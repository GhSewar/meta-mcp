#!/usr/bin/env tsx
/**
 * Lightweight CLI to call Meta API-like tool functions with optional mock data.
 * Usage examples:
 *   npx tsx mcp/scripts/call-tools.ts getCampaigns --account_id act_123 --limit 5 --mock
 *   npx tsx mcp/scripts/call-tools.ts getAdSets --account_id act_123 --limit 5 --mock
 *   npx tsx mcp/scripts/call-tools.ts getAds --account_id act_123 --limit 5 --mock
 *   npx tsx mcp/scripts/call-tools.ts verify_account_setup --account_id act_123 --mock
 */
import { config } from "dotenv";
config({ path: '.env' });

import { MetaApiClient } from "../src/meta-client.js";
import { AuthManager } from "../src/utils/auth.js";

type ArgMap = Record<string, string>;

function parseArgs(argv: string[]): { cmd: string; args: ArgMap; mock: boolean } {
  const [, , cmd, ...rest] = argv;
  const args: ArgMap = {};
  let mock = false;
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (token === "--mock") {
      mock = true;
      continue;
    }
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const val = rest[i + 1] && !rest[i + 1].startsWith("--") ? rest[++i] : "true";
      args[key] = val;
    }
  }
  return { cmd: cmd || "", args, mock };
}

function ensureAccountId(args: ArgMap): string {
  return args.account_id || args.accountId || "act_0000000000";
}

async function runReal(cmd: string, args: ArgMap) {
  const auth = AuthManager.fromEnvironment();
  const meta = new MetaApiClient(auth);

  switch (cmd) {
    case "getCampaigns": {
      const accountId = ensureAccountId(args);
      const limit = args.limit ? parseInt(args.limit, 10) : 5;
      const res = await meta.getCampaigns(accountId, { limit });
      return res;
    }
    case "getAdSets": {
      const accountId = ensureAccountId(args);
      const limit = args.limit ? parseInt(args.limit, 10) : 5;
      const res = await meta.getAdSets({ accountId, limit });
      return res;
    }
    case "getAds": {
      const accountId = ensureAccountId(args);
      const limit = args.limit ? parseInt(args.limit, 10) : 5;
      const res = await meta.getAds({ accountId, limit });
      return res;
    }
    case "verify_account_setup": {
      const accountId = ensureAccountId(args);
      // Replicate the tool logic using real calls
      const verification: any = {
        account_id: accountId,
        setup_status: "checking",
        components: {
          account_access: { status: "unknown", details: "" },
          payment_method: { status: "unknown", details: "" },
          facebook_pages: { status: "unknown", details: "", count: 0 },
          active_campaigns: { status: "unknown", details: "", count: 0 },
        },
        recommendations: [] as string[],
        warnings: [] as string[],
      };

      try {
        const account = await meta.getAdAccount(accountId);
        verification.components.account_access = {
          status: "success",
          details: `Account "${account.name}" accessible`,
        };
      } catch {
        verification.components.account_access = {
          status: "error",
          details: "Cannot access account - check permissions",
        };
        verification.warnings.push("Account access issues detected");
      }

      try {
        const campaigns = await meta.getCampaigns(accountId, { limit: 10 });
        verification.components.active_campaigns = {
          status: campaigns.data.length > 0 ? "success" : "warning",
          details: `Found ${campaigns.data.length} campaigns`,
          count: campaigns.data.length,
        };
        if (campaigns.data.length === 0) {
          verification.recommendations.push(
            "Create your first campaign to start advertising"
          );
        }
      } catch {
        verification.components.active_campaigns = {
          status: "error",
          details: "Cannot retrieve campaigns",
          count: 0,
        };
      }

      try {
        const funding = await meta.getFundingSources(accountId);
        verification.components.payment_method = {
          status: funding.length > 0 ? "success" : "warning",
          details: funding.length > 0 ? "Payment method configured" : "No payment method found",
        };
        if (funding.length === 0) {
          verification.warnings.push(
            "No payment method configured - required for ad delivery"
          );
          verification.recommendations.push(
            "Add a payment method in Meta Business Manager"
          );
        }
      } catch {
        verification.components.payment_method = {
          status: "unknown",
          details: "Cannot check payment methods (insufficient permissions)",
        };
      }

      const hasErrors = Object.values(verification.components).some(
        // @ts-ignore
        (c: any) => c.status === "error"
      );
      const hasWarnings = Object.values(verification.components).some(
        // @ts-ignore
        (c: any) => c.status === "warning"
      );
      verification.setup_status = hasErrors
        ? "needs_attention"
        : hasWarnings
          ? "mostly_ready"
          : "ready";

      return verification;
    }
    default:
      throw new Error(`Unknown command: ${cmd}`);
  }
}

async function runMock(cmd: string, args: ArgMap) {
  const accountId = ensureAccountId(args);
  switch (cmd) {
    case "getCampaigns":
      return {
        data: [
          { id: "cmp_1", name: "Summer Sale", objective: "OUTCOME_TRAFFIC", status: "ACTIVE" },
          { id: "cmp_2", name: "Lead Gen", objective: "OUTCOME_LEADS", status: "PAUSED" },
        ],
        hasNextPage: false,
        hasPreviousPage: false,
        paging: { cursors: { after: null, before: null } },
      };
    case "getAdSets":
      return {
        data: [
          { id: "as_1", name: "AS - US 18-35", campaign_id: "cmp_1", status: "ACTIVE" },
          { id: "as_2", name: "AS - US 36-65", campaign_id: "cmp_1", status: "PAUSED" },
        ],
        hasNextPage: false,
        hasPreviousPage: false,
        paging: { cursors: { after: null, before: null } },
      };
    case "getAds":
      return {
        data: [
          { id: "ad_1", name: "Ad A", adset_id: "as_1", campaign_id: "cmp_1", status: "ACTIVE" },
          { id: "ad_2", name: "Ad B", adset_id: "as_2", campaign_id: "cmp_1", status: "PAUSED" },
        ],
        hasNextPage: false,
        hasPreviousPage: false,
        paging: { cursors: { after: null, before: null } },
      };
    case "verify_account_setup":
      return {
        account_id: accountId,
        setup_status: "mostly_ready",
        components: {
          account_access: { status: "success", details: "Account \"Demo\" accessible" },
          payment_method: { status: "warning", details: "No payment method found" },
          facebook_pages: { status: "unknown", details: "", count: 0 },
          active_campaigns: { status: "success", details: "Found 2 campaigns", count: 2 },
        },
        recommendations: ["Add a payment method in Meta Business Manager"],
        warnings: ["No payment method configured - required for ad delivery"],
      };
    default:
      throw new Error(`Unknown command: ${cmd}`);
  }
}

async function main() {
  const { cmd, args, mock } = parseArgs(process.argv);
  if (!cmd) {
    console.error("Usage: call-tools <getCampaigns|getAdSets|getAds|verify_account_setup> [--account_id <id>] [--limit <n>] [--mock]");
    process.exit(2);
  }
  try {
    const result = mock ? await runMock(cmd, args) : await runReal(cmd, args);
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } catch (err: any) {
    process.stderr.write(`Error: ${err?.message || String(err)}\n`);
    process.exit(1);
  }
}

main();
