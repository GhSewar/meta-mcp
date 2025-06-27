# Meta Marketing API MCP Server

A comprehensive Model Context Protocol (MCP) server that enables AI assistants like Claude to interact with Facebook/Instagram advertising data through the Meta Marketing API. This server provides full campaign lifecycle management, analytics, audience targeting, and creative optimization capabilities.

## 🚀 Features

### **Campaign Management**
- ✅ Create, update, pause, resume, and delete campaigns
- ✅ Support for all campaign objectives (traffic, conversions, awareness, etc.)
- ✅ Budget management and scheduling
- ✅ Ad set creation with advanced targeting
- ✅ Individual ad management

### **Analytics & Reporting**
- 📊 Performance insights with customizable date ranges
- 📈 Multi-object performance comparison
- 📋 Data export in CSV/JSON formats
- 🎯 Attribution modeling and conversion tracking
- 📅 Daily performance trends analysis

### **Audience Management**
- 👥 Custom audience creation and management
- 🎯 Lookalike audience generation
- 📏 Audience size estimation
- 🔍 Targeting recommendations and insights
- 🏥 Audience health monitoring

### **Creative Management**
- 🎨 Ad creative creation and management
- 👁️ Cross-platform ad previews
- 🧪 A/B testing setup and guidance
- 📸 Creative performance analysis

### **Enterprise Features**
- 🔐 Secure OAuth 2.0 authentication
- ⚡ Automatic rate limiting with exponential backoff
- 🔄 Pagination support for large datasets
- 🛡️ Comprehensive error handling
- 📚 Rich MCP resources for contextual data access
- 🌐 Multi-account support

## 📦 Installation & Setup

### Option 1: Direct Installation (Recommended)
```bash
npm install -g meta-ads-mcp
```

### Option 2: From Source
```bash
git clone https://github.com/your-org/meta-ads-mcp.git
cd meta-ads-mcp
npm install
npm run build
```

### Option 3: Automated Setup (Easiest)
```bash
# Clone the repository first
git clone https://github.com/your-org/meta-ads-mcp.git
cd meta-ads-mcp

# Run the interactive setup
npm run setup
```

The setup script will:
- ✅ Check system requirements
- ✅ Validate your Meta access token
- ✅ Create Claude Desktop configuration
- ✅ Install dependencies
- ✅ Test the connection

## 🔧 Configuration Guide

### Step 1: Get Meta Access Token
1. Create a Meta App at [developers.facebook.com](https://developers.facebook.com/)
2. Add Marketing API product
3. Generate an access token with `ads_read` and `ads_management` permissions
4. (Optional) Set up OAuth for automatic token refresh

![CleanShot 2025-06-17 at 15 52 35@2x](https://github.com/user-attachments/assets/160a260f-8f1b-44de-9041-f684a47e4a9d)

### Step 2: Configure Claude Desktop

#### Find your configuration file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

If the file doesn't exist, create it with the following content:

#### Basic Configuration (Token-based):
```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "npx",
      "args": ["-y", "meta-ads-mcp"],
      "env": {
        "META_ACCESS_TOKEN": "your_access_token_here"
      }
    }
  }
}
```

#### Advanced Configuration (with OAuth):
```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "npx",
      "args": ["-y", "meta-ads-mcp"],
      "env": {
        "META_ACCESS_TOKEN": "your_access_token_here",
        "META_APP_ID": "your_app_id",
        "META_APP_SECRET": "your_app_secret",
        "META_AUTO_REFRESH": "true",
        "META_BUSINESS_ID": "your_business_id"
      }
    }
  }
}
```

#### Local Development Configuration:
If you've cloned the repository locally:
```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "node",
      "args": ["/absolute/path/to/meta-ads-mcp/build/index.js"],
      "env": {
        "META_ACCESS_TOKEN": "your_access_token_here"
      }
    }
  }
}
```

### Step 3: Configure for Cursor

Cursor uses the same MCP configuration as Claude Desktop. Add the configuration to your Cursor settings:

1. Open Cursor Settings
2. Go to "Extensions" > "Claude"
3. Add the MCP server configuration in the JSON settings

### Step 4: Restart Your Client
- **Claude Desktop**: Completely quit and restart the application
- **Cursor**: Restart the IDE

### Step 5: Verify Setup
```bash
# Run health check to verify everything is working
npm run health-check

# Or if installed globally
npx meta-ads-mcp --health-check
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Command not found" or "npx" errors
```bash
# Install Node.js if not installed
# macOS: brew install node
# Windows: Download from nodejs.org
# Linux: Use your package manager

# Verify installation
node --version
npm --version
npx --version
```

#### 2. Permission errors
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Or install without sudo
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 3. Meta API connection issues
```bash
# Test your token manually
curl -G \
  -d "access_token=YOUR_ACCESS_TOKEN" \
  "https://graph.facebook.com/v23.0/me/adaccounts"
```

#### 4. Check Claude Desktop logs
- **macOS**: `~/Library/Logs/Claude/mcp*.log`
- **Windows**: `%APPDATA%\Claude\logs\mcp*.log`

```bash
# macOS/Linux - View logs
tail -f ~/Library/Logs/Claude/mcp*.log

# Windows - View logs
type "%APPDATA%\Claude\logs\mcp*.log"
```

#### 5. Test the server manually
```bash
# Test the MCP server directly
npx -y meta-ads-mcp

# Or if installed locally
node build/index.js
```

### Debug Mode
Enable debug logging by adding to your environment:
```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "npx",
      "args": ["-y", "meta-ads-mcp"],
      "env": {
        "META_ACCESS_TOKEN": "your_access_token_here",
        "DEBUG": "mcp:*",
        "NODE_ENV": "development"
      }
    }
  }
}
```

## 🌐 Web Deployment (Vercel)

For web applications, this server is also available as a Vercel deployment with OAuth authentication:

### Configuration:
1. Deploy to Vercel or use our hosted version
2. Set environment variables in Vercel dashboard
3. Configure OAuth app in Meta Developer Console
4. Use the web endpoint: `https://your-project.vercel.app/api/mcp`

### MCP Client Configuration for Web:
```json
{
  "mcpServers": {
    "meta-ads-remote": {
      "url": "https://mcp.offerarc.com/api/mcp",
      "headers": {
        "Authorization": "Bearer your_session_token"
      }
    }
  }
}
```

**Note**: You need to authenticate first at `https://mcp.offerarc.com/api/auth/login` to get your session token.

## 🛠️ Usage Examples

### Test the Connection
```
Check the health of the Meta Marketing API server
```

### Campaign Management
```
Create a new traffic campaign named "Holiday Sale 2024" with a $50 daily budget
```

```
List all active campaigns and show their performance for the last 7 days
```

```
Pause all campaigns with CPC above $2.00
```

### Analytics & Reporting
```
Compare the performance of my top 3 campaigns over the last 30 days
```

```
Export campaign performance data for last quarter as CSV
```

```
Show me daily performance trends for campaign 123456 over the last 14 days
```

### Audience Management
```
Create a lookalike audience based on my best customers targeting US users
```

```
Estimate the audience size for females aged 25-45 interested in fitness
```

```
Show me the health status of all my custom audiences
```

### Creative Management
```
Create an ad creative with title "Summer Sale" and preview it for mobile feed
```

```
Set up an A/B test comparing different headlines for my campaign
```

## 📚 Resources Access

The server provides rich contextual data through MCP resources:

- `meta://campaigns/{account_id}` - Campaign overview
- `meta://insights/account/{account_id}` - Performance dashboard
- `meta://audiences/{account_id}` - Audience insights
- `meta://audience-health/{account_id}` - Audience health report

## 🔧 Environment Variables

### Required
```bash
META_ACCESS_TOKEN=your_access_token_here
```

### Optional
```bash
META_APP_ID=your_app_id                    # For OAuth
META_APP_SECRET=your_app_secret            # For OAuth
META_BUSINESS_ID=your_business_id          # For business-specific operations
META_API_VERSION=v23.0                     # API version (default: v23.0)
META_API_TIER=standard                     # 'development' or 'standard'
META_AUTO_REFRESH=true                     # Enable automatic token refresh
META_REFRESH_TOKEN=your_refresh_token      # For token refresh
```

## 📖 Documentation

- **[Quick Setup Guide](SETUP_GUIDE.md)** - 5-minute setup instructions
- **[Setup Guide](docs/setup.md)** - Complete installation and configuration
- **[Tools Reference](docs/tools-reference.md)** - All available tools and resources
- **[Example Configuration](examples/claude_desktop_config.json)** - Sample configuration file

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Claude AI     │◄──►│ MCP Server       │◄──►│ Meta Marketing  │
│                 │    │                  │    │ API             │
│ - Natural       │    │ - Authentication │    │                 │
│   Language      │    │ - Rate Limiting  │    │ - Campaigns     │
│ - Tool Calls    │    │ - Error Handling │    │ - Analytics     │
│ - Resource      │    │ - Data Transform │    │ - Audiences     │
│   Access        │    │ - Pagination     │    │ - Creatives     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components

- **Meta API Client**: Handles authentication, rate limiting, and API communication
- **Tool Handlers**: 40+ tools for comprehensive Meta API functionality
- **Resource Providers**: Contextual data access for AI understanding
- **Error Management**: Robust error handling with automatic retries
- **Rate Limiter**: Intelligent rate limiting with per-account tracking

## 🔒 Security & Best Practices

### Token Security
- ✅ Environment variable configuration
- ✅ No token logging or exposure
- ✅ Automatic token validation
- ✅ Secure credential management

### API Management
- ✅ Rate limit compliance
- ✅ Exponential backoff retries
- ✅ Request validation
- ✅ Error boundary protection

### Data Privacy
- ✅ Meta data use policy compliance
- ✅ No persistent data storage
- ✅ Secure API communication
- ✅ Audit trail support

## ⚡ Performance

### Rate Limits
- **Development Tier**: 60 API calls per 5 minutes
- **Standard Tier**: 9000 API calls per 5 minutes
- **Automatic Management**: Built-in rate limiting and retry logic

### Optimization
- 🚀 Concurrent request processing
- 📦 Efficient pagination handling
- 🎯 Smart data caching
- ⚡ Minimal memory footprint

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test with example client:
```bash
npx tsx examples/client-example.ts
```

Health check:
```bash
# In Claude:
Check the health of the Meta Marketing API server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Open an issue on GitHub
- **Meta API**: Refer to [Meta Marketing API docs](https://developers.facebook.com/docs/marketing-apis/)
- **MCP Protocol**: See [Model Context Protocol specification](https://modelcontextprotocol.io/)

## 🏷️ Version History

### v1.0.6 (Latest)
- ✅ Using Meta Graph API v23.0 (latest version)
- ✅ Added support for Outcome-Driven Ad Experience (ODAE) objectives
- ✅ Added campaign-level budget optimization support
- ✅ Added bid strategy options (LOWEST_COST_WITHOUT_CAP, LOWEST_COST_WITH_BID_CAP, COST_CAP)
- ✅ Removed deprecated insights metrics per Meta API v19.0 changes
- ✅ Enhanced campaign creation with bid cap and budget optimization features

### v1.0.5
- ✅ Fixed ad set creation to use correct account endpoint
- ✅ Improved error handling for campaign operations

### v1.0.4
- ✅ Enhanced campaign management features
- ✅ Improved API error responses

### v1.0.3
- ✅ Added docker support
- ✅ Improved deployment options

### v1.0.2
- ✅ Fixed entry point issue for npx compatibility
- ✅ Added detailed startup debugging logs
- ✅ Improved error handling and diagnostics

### v1.0.1
- ✅ Enhanced debugging capabilities
- ✅ Better error reporting

### v1.0.0
- ✅ Complete Meta Marketing API integration
- ✅ 40+ tools and resources
- ✅ Advanced rate limiting
- ✅ Comprehensive error handling
- ✅ Multi-account support
- ✅ Production-ready security

---

**Built with ❤️ for the AI-powered advertising future**
