from datetime import datetime
from typing import Any, Dict, Optional, Set, Tuple

# pip install "mcp[cli]"
from mcp import ClientSession, StdioServerParameters, types
from mcp.client.stdio import stdio_client
import os, asyncio, json

REPO_ROOT = r""
META_TOKEN = os.getenv("META_ACCESS_TOKEN", "")
ACCOUNT_ID = os.getenv("META_AD_ACCOUNT_ID", "")  # e.g., "act_1234567890"
ALLOW_MUTATIONS = os.getenv("ALLOW_MUTATIONS", "0") in ("1", "true", "True")

# ---------------------------
# Interactive input utilities
# ---------------------------

def _print_field_intro(name: str, spec: Dict[str, Any], required: bool) -> None:
    desc = (spec or {}).get("description", "").strip()
    typ = (spec or {}).get("type", "string")
    enum = (spec or {}).get("enum")
    print("\n> Field:", name, "(required)" if required else "(optional)")
    print("  - type:", typ)
    if enum:
        print("  - allowed values:", ", ".join(map(str, enum)))
    if desc:
        print("  - description:", desc)


def _parse_bool(s: str) -> Optional[bool]:
    true_vals = {"true", "t", "1", "y", "yes"}
    false_vals = {"false", "f", "0", "n", "no"}
    ls = s.strip().lower()
    if ls in true_vals:
        return True
    if ls in false_vals:
        return False
    return None


def _prompt_for_value(name: str, spec: Dict[str, Any], required: bool) -> Any:
    """Prompt the user for a single property based on JSON Schema hints."""
    typ = (spec or {}).get("type", "string")
    enum = (spec or {}).get("enum")
    items = (spec or {}).get("items")

    while True:
        _print_field_intro(name, spec, required)
        raw = input("  Enter value (leave blank to skip" + (" — cannot skip" if required else "") + "): ")

        # Handle skip for optional
        if raw.strip() == "":
            if required:
                print("  This field is required. Please provide a value.")
                continue
            else:
                return None  # signal to omit optional key entirely

        # Enums
        if enum:
            if raw in enum:
                return raw
            else:
                print("  Value not in allowed enum. Try again.")
                continue

        # Type handling
        try:
            if typ == "boolean":
                val = _parse_bool(raw)
                if val is None:
                    raise ValueError("Enter true/false, y/n, 1/0")
                return val
            elif typ == "integer":
                return int(raw)
            elif typ == "number":
                return float(raw)
            elif typ == "array":
                # Try JSON first, then comma-separated fallback
                try:
                    arr = json.loads(raw)
                    if not isinstance(arr, list):
                        raise ValueError
                except Exception:
                    arr = [x.strip() for x in raw.split(",") if x.strip() != ""]
                # If items has enum, validate
                if isinstance(items, dict) and items.get("enum"):
                    allowed = set(items["enum"])  # type: ignore[index]
                    bad = [x for x in arr if x not in allowed]
                    if bad:
                        print("  These values are not allowed:", bad)
                        continue
                return arr
            elif typ == "object":
                # Require JSON object
                obj = json.loads(raw)
                if not isinstance(obj, dict):
                    raise ValueError("Expected a JSON object")
                return obj
            else:
                # string or unknown → return as-is
                return raw
        except Exception as e:
            print(f"  Could not parse input ({e}). Please try again.")
            continue


def _normalize_input_schema(schema: Dict[str, Any]) -> Tuple[Dict[str, Any], Set[str]]:
    """Normalize various inputSchema shapes to (properties, required).

    Supported shapes:
    - JSON Schema object: { type: 'object', properties: {...}, required: [...] }
    - Zod-to-JSON exported: { properties: {...}, required: [...] }
    - Inline map (used by some tools): { fieldA: { type: 'string', ... }, ... }
    """
    if not isinstance(schema, dict):
        return {}, set()

    # Standard JSON Schema object with explicit type
    if schema.get("type") == "object" and isinstance(schema.get("properties"), dict):
        props = schema.get("properties") or {}
        required = set(schema.get("required") or [])
        return props, required

    # Object with properties/required but no explicit type
    if isinstance(schema.get("properties"), dict):
        props = schema.get("properties") or {}
        required = set(schema.get("required") or [])
        return props, required

    # Inline map: treat top-level keys as properties
    # Filter out known meta-keys if present
    props = {
        k: v for k, v in schema.items() if not k.startswith("$") and k not in {"required", "type"}
    }
    # If a top-level required array exists, honor it; otherwise assume all listed fields are required
    req = schema.get("required")
    required = set(req) if isinstance(req, list) else set(props.keys())
    return props, required


def collect_args_from_user(tool: types.Tool) -> Dict[str, Any]:
    """Inspect the tool's inputSchema (JSON Schema or inline map) and prompt for each argument."""
    schema = getattr(tool, "inputSchema", None)
    if not schema or not isinstance(schema, dict):
        print("  (No input schema; calling with empty args)")
        return {}

    props, required = _normalize_input_schema(schema)
    if not props:
        print("  (Empty input schema; calling with empty args)")
        return {}

    args: Dict[str, Any] = {}

    # Nicely show the tool name & description before prompting
    print("\n============================")
    print("Tool:", tool.name)
    if getattr(tool, "description", None):
        print("Description:", tool.description)
    print("============================\n")

    for name, spec in props.items():
        val = _prompt_for_value(name, (spec or {}), name in required)
        if val is not None:
            args[name] = val

    return args


# ---------------------------
# Tool execution with retry logic
# ---------------------------

async def execute_tool_with_retry(session: ClientSession, tool: types.Tool, tool_index: int, max_retries: int = 10) -> Optional[types.CallToolResult]:
    """Execute a tool with retry logic for robustness."""
    tname = tool.name
    result = None

    for attempt in range(1, max_retries + 1):
        try:
            args = collect_args_from_user(tool)
            print(f"[{tool_index}] Calling {tname} with args (attempt {attempt}/{max_retries}):\n{json.dumps(args, indent=2)}")

            result = await session.call_tool(tname, args)

            # Check if result indicates success
            if result and not getattr(result, 'isError', False):
                return result

            # Result indicates error, retry if attempts remaining
            if attempt < max_retries:
                error_msg = getattr(result, 'error', 'Unknown error') if result else 'No result returned'
                print(f"[{tool_index}] {tname} ERROR (attempt {attempt}/{max_retries}): {error_msg}")
                print(f"[{tool_index}] Retrying {tname}...")
            else:
                print(f"[{tool_index}] {tname} FAILED after {max_retries} attempts\n")

        except Exception as e:
            if attempt < max_retries:
                print(f"[{tool_index}] {tname} ERROR (attempt {attempt}/{max_retries}): {e}")
                print(f"[{tool_index}] Retrying {tname}...")
            else:
                print(f"[{tool_index}] {tname} FAILED after {max_retries} attempts: {e}\n")

    return None


# ---------------------------
# Mutation gate
# ---------------------------

def is_mutation_tool(tool_name: str) -> bool:
    prefixes = ("create_", "update_", "pause_", "resume_", "delete_")
    return tool_name.startswith(prefixes)


# ---------------------------
# Main program
# ---------------------------
async def main():
    if not META_TOKEN:
        print("ERROR: Please set META_ACCESS_TOKEN in your environment.")
        print("Example: export META_ACCESS_TOKEN='EAAB...'; export META_AD_ACCOUNT_ID='act_123...'\n")
        return

    server = StdioServerParameters(
        # On Windows, run through cmd to resolve npx reliably
        command="cmd" if os.name == "nt" else "npx",
        args=(["/c", "npx", "tsx", "mcp/src/index.ts"] if os.name == "nt" else ["tsx", "mcp/src/index.ts"]),
        env={
            "META_ACCESS_TOKEN": META_TOKEN,
            "META_AD_ACCOUNT_ID": ACCOUNT_ID,
            "DEBUG": "mcp:*",
            "NODE_ENV": "development",
            "PATH": os.environ.get("PATH", ""),
        },
    )

    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # List tools
            tlist = await session.list_tools()
            tools = tlist.tools or []
            if not tools:
                print("No tools reported by server.")
                return

            print("Total tools:", len(tools))
            for i, t in enumerate(tools, 1):
                print(f"{i}. {t.name} — {t.description or ''}")

            # ---------------------------
            # Ask user how many tools to process
            # ---------------------------
            while True:
                try:
                    n = input("\nHow many of the FIRST tools should be processed? Enter a number: ")
                    count = int(n.strip())
                    if count <= 0:
                        print("Please enter a positive integer.")
                        continue
                    break
                except Exception:
                    print("Invalid number, try again.")

            # Build ordered list to call based on tools_to_call sequence for ctwa campaigns
            tools_to_call = [
                "verify_account_setup",
                "create_campaign",
                "check_campaign_readiness",
                "create_ad_set_enhanced",
                "create_ad_creative",
                "validate_creative_setup",
                "preview_ad",
                "update_campaign",
            ]

            # Map available tools by name
            tool_map = {t.name: t for t in tools}

            # Filter to those that exist, preserving desired order
            ordered_tools = [tool_map[name] for name in tools_to_call if name in tool_map]

            if not ordered_tools:
                print("None of the desired tools are available from the server.")
                return

            # Respect user-provided count
            count = min(count, len(ordered_tools))
            print(f"\n--- Processing the first {count} tool(s) in tools_to_call order ---\n")

            for i, tool in enumerate(ordered_tools[:count], 1):
                tname = tool.name

                # Safety: skip mutations unless allowed
                if is_mutation_tool(tname) and not ALLOW_MUTATIONS:
                    print(f"[{i}] {tname}: SKIPPED (set ALLOW_MUTATIONS=1 to enable write tools)\n")
                    continue

                # Execute tool with retry logic
                result = await execute_tool_with_retry(session, tool, i)

                # If all retries failed, continue to next tool
                if result is None:
                    continue

                # Display result content blocks
                print(f"[{i}] {tname} RESULT:")
                if getattr(result, "structuredContent", None):
                    print(json.dumps(result.structuredContent, indent=2))
                for block in result.content:
                    if isinstance(block, types.TextContent):
                        print(block.text)
                    elif isinstance(block, types.JsonContent):
                        print(json.dumps(block.data, indent=2))
                print()


if __name__ == "__main__":
    asyncio.run(main())
