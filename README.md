# Enhanced CLI Boilerplate with AgentHustle Integration

This is an enhanced CLI boilerplate that demonstrates integration between AgentHustle's AI capabilities and tools using both local implementations and Smithery's hosted Model Context Protocol (MCP) services. The project now includes a modern web interface powered by Agent UI for an intuitive user experience.

## 🚀 Features Overview

### 🎯 Dual Interface Architecture
- **🖥️ Modern Web Interface**: Beautiful Agent UI frontend with rich tool visualization
- **⚡ CLI Interface**: Traditional command-line interface for developers
- **🔄 Unified Backend**: Single Express.js server powering both interfaces

### 🛠️ Comprehensive Tool Ecosystem

**🔍 Web Search & Research**:
- `brave-search`: Web search using **Smithery hosted Brave Search** (preferred) or local Brave Search API
- `brave_local_search`: Local business and location search via Smithery

**₿ Bitcoin & Crypto Tools (29 tools)**:
- **BRC-20 Tokens**: Balance checking, transaction history, token information
- **Inscriptions**: Browse, analyze, and track Bitcoin inscriptions
- **Runes**: Market data, balance checking, transfer activity
- **Collections**: NFT collection analysis and inscription browsing
- **Transactions**: Bitcoin transaction analysis with ordinals data
- **Rare Satoshis**: Rare sat identification and tracking

**📈 Stock Market Analysis**:
- `get-stock-data`: Real-time stock market data and metrics
- `get-daily-stock-data`: Historical daily stock data analysis
- `get-stock-alerts`: Intelligent stock price alerts and monitoring

**🔐 Crypto Security & Analysis**:
- `rugcheck`: Security analysis for crypto tokens
- `trending-tokens`: Get trending tokens on various blockchains
- `wallet-balance`: Check wallet balances across chains
- `crypto-chat`: Specialized crypto-focused AI conversations

### 🎨 Agent UI Features

**✨ Enhanced User Experience**:
- **🖥️ Modern Chat Interface**: Beautiful, responsive web UI built with Next.js and Tailwind CSS
- **🔧 Advanced Tool Visualization**: See exactly which tools are being used with rich, interactive displays
- **📊 Expandable Tool Results**: Click-to-expand tool cards with detailed results, syntax highlighting, and proper JSON formatting
- **✅ Execution Status Indicators**: Visual success/failure indicators with green checkmarks and red error markers
- **📱 Mobile Responsive**: Seamless experience across desktop, tablet, and mobile devices
- **💬 Persistent Sessions**: Conversation history with full context preservation
- **🎯 Real-time Updates**: Live streaming of AI responses and tool executions

**🔧 Tool Result Display Features**:
- **Tool Call Cards**: Each tool execution displayed in dedicated cards with clear visual hierarchy
- **Success/Error Indicators**: Immediate visual feedback on tool execution status
- **Result Summaries**: Preview of tool results when collapsed for quick scanning
- **Detailed Expansion**: Full tool arguments, results, and execution metrics on demand
- **Syntax Highlighting**: Properly formatted JSON results with color coding
- **Execution Metrics**: Tool execution time and performance data

### 🔗 Integration Capabilities

**🌐 Smithery MCP Integration**:
- **Hosted MCP Tools**: Access to Smithery's hosted tool ecosystem
- **Automatic Fallback**: Falls back to local implementations when Smithery is unavailable
- **No API Key Management**: Use Smithery's hosted services without managing your own API keys
- **Consistent Interface**: Standard MCP protocol for all tools

**🤖 AgentHustle AI Integration**:
- Automatic tool call parsing from AgentHustle responses
- Client-side tool execution with result formatting
- AI-powered result summarization and follow-up suggestions
- Context-aware tool selection and chaining

## 🚀 Quick Start

### Option 1: Web Interface (Recommended)

1. **Start the Backend Server**:
```bash
npm run start:server
# Backend runs on http://localhost:8081
```

2. **Start the Agent UI Frontend**:
```bash
cd my-cli-frontend
npm run dev
# Frontend runs on http://localhost:3000
```

3. **Open in Browser**:
   - Navigate to `http://localhost:3000`
   - You'll see the Agent UI interface connected to your CLI backend
   - Start chatting with your enhanced AI assistant!

### Option 2: CLI Interface

1. **Start the MCP Server**:
```bash
npm run start:server
```

2. **Start the CLI**:
```bash
npm start
```

## 🎯 Usage Examples

### 🌐 Web Interface Examples

**Bitcoin & Crypto Analysis**:
```
💬 "What BRC-20 tokens does this address own: bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr"
🔧 → Uses ordiscan_address_brc20 tool
📊 → Displays formatted token balances with rich UI
✅ Result: Shows ORDI: 1,250.5, SATS: 50M, PEPE: 100K tokens
```

**Web Search & Research**:
```
💬 "What are the latest developments in Solana DeFi?"
🔧 → Uses brave-search tool via Smithery
📊 → Shows search results with clickable links and summaries
✅ Result: 5 recent articles with descriptions and URLs
```

**Stock Market Analysis**:
```
💬 "Show me Apple's stock performance over the last 30 days"
🔧 → Uses get-daily-stock-data tool
📊 → Displays interactive charts and market data
✅ Result: Price: $185.42, Change: +2.15 (+1.17%), Volume: 45M
```

### ⚡ CLI Interface Examples

**Chat Mode with Tool Integration**:
```bash
[chat]> What are the latest developments in Solana?
# AgentHustle automatically uses Brave search and summarizes results

[chat]> What BRC-20 tokens does bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr own?
# Uses Ordiscan tools for Bitcoin address analysis

[chat]> Show me Apple's current stock price
# Uses stock analysis tools for real-time market data
```

**Direct Tool Usage**:
```bash
[chat]> /use brave-search
Enter query: latest Solana developments
Enter count: 10

[chat]> /tools
# Lists all available tools with descriptions
```

**Mode Switching**:
```bash
/mode chat     # Switch to chat mode (default)
/mode tools    # Switch to tools mode  
/mode stream   # Switch to streaming mode
```

## 📚 Comprehensive Tool Documentation

### 🔍 Web Search Tools

**Smithery Brave Search Integration**:
- `brave_web_search`: Global web search with Smithery hosting
- `brave_local_search`: Local business and location search
- **Automatic Fallback**: Uses local Brave API if Smithery unavailable
- **No API Key Required**: Smithery handles API key management

### ₿ Bitcoin & Ordinals Tools (29 Tools)

**📊 BRC-20 Token Analysis**:
- `ordiscan_brc20_list`: Paginated list of all BRC-20 tokens
- `ordiscan_brc20_info`: Detailed token information and statistics
- `ordiscan_address_brc20`: Token balances for any Bitcoin address
- `ordiscan_address_brc20_activity`: Transaction history and transfers

**🖼️ Inscription Management**:
- `ordiscan_inscriptions_list`: Browse all inscriptions with filters
- `ordiscan_inscription_info`: Detailed inscription metadata
- `ordiscan_inscription_traits`: Trait analysis for inscriptions
- `ordiscan_inscription_transfers`: Transfer history tracking
- `ordiscan_address_inscriptions`: All inscriptions owned by address

**🔮 Runes Ecosystem**:
- `ordiscan_runes_list`: Complete runes directory with pagination
- `ordiscan_rune_market`: Real-time price and market cap data
- `ordiscan_rune_name_unlock`: Rune name availability checker
- `ordiscan_address_runes`: Rune balances and holdings
- `ordiscan_runes_activity`: Transfer and minting activity

**📚 Collection Analytics**:
- `ordiscan_collections_list`: Indexed NFT collections browser
- `ordiscan_collection_info`: Collection statistics and metadata
- `ordiscan_collection_inscriptions`: Inscriptions within collections

**📝 Transaction Analysis**:
- `ordiscan_tx_info`: Comprehensive transaction information
- `ordiscan_tx_inscriptions`: Inscriptions created in transactions
- `ordiscan_tx_runes`: Runes activity in transactions
- `ordiscan_tx_inscription_transfers`: Transfer tracking

**💎 Rare Satoshis**:
- `ordiscan_address_rare_sats`: Rare satoshis owned by addresses
- `ordiscan_sat_info`: Individual satoshi information
- `ordiscan_utxo_rare_sats`: Rare sats in specific UTXOs
- `ordiscan_utxo_sat_ranges`: Satoshi ranges for UTXOs
- `ordiscan_address_utxos`: UTXO analysis with ordinals data

### 📈 Stock Analysis Tools

**💹 Market Data & Analysis**:
- `get-stock-data`: Real-time stock prices, volume, market cap
- `get-daily-stock-data`: Historical data with customizable periods
- `get-stock-alerts`: Intelligent price alerts and thresholds

**🎯 Usage Examples**:
```bash
# Real-time data
get-stock-data({symbol: "AAPL"})

# Historical analysis  
get-daily-stock-data({symbol: "TSLA", period: "30d"})

# Alert setup
get-stock-alerts({symbol: "MSFT", threshold: 5})
```

### 🔐 Crypto Security Tools

**🛡️ Token Security**:
- `rugcheck`: Comprehensive token security analysis
- `trending-tokens`: Trending tokens across blockchains
- `wallet-balance`: Multi-chain wallet balance checking
- `crypto-chat`: AI-powered crypto conversations

## 🔧 Setup & Configuration

### 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- Git for version control
- Required API keys (see environment setup)

### 🛠️ Installation

1. **Clone and Install**:
```bash
git clone <repository-url>
cd enhanced-cli-boilerplate-exp5
npm install
```

2. **Frontend Setup**:
```bash
cd my-cli-frontend
npm install
```

3. **Environment Configuration**:

Create `.env` file (copy from `env.example`):
```env
# Required - AgentHustle AI
HUSTLE_API_KEY=your-api-key-here
VAULT_ID=your-vault-id-here

# Smithery Configuration (for hosted tools)
SMITHERY_API_KEY=your-smithery-api-key
SMITHERY_PROFILE=your-smithery-profile-here

# Bitcoin Ordinals (Ordiscan)
ORDISCAN_API_KEY=your-ordiscan-api-key

# Stock Analysis (Alpha Vantage)
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key

# Optional - Local Brave Search (fallback only)
BRAVE_API_KEY=your-brave-search-api-key

# Server Configuration
MCP_PORT=8081
DEBUG=false
```

### 🔑 API Key Setup

**Required Credentials**:
- **AgentHustle**: Get API key and Vault ID from AgentHustle platform
- **Smithery**: Sign up at [smithery.ai](https://smithery.ai/) for hosted tools
- **Ordiscan**: Contact tool author for Bitcoin ordinals API access
- **Alpha Vantage**: Free tier available at [alphavantage.co](https://www.alphavantage.co/)
- **Brave Search**: Optional fallback from [brave.com/search/api](https://brave.com/search/api/)

**Security Notes**:
- ⚠️ Never commit API keys to version control
- 🔒 Use different keys for development/production
- 🛡️ All keys must be in environment variables
- 🚫 No hardcoded fallback keys provided

## 🎨 Agent UI vs CLI Comparison

| Feature | CLI Interface | Agent UI Interface |
|---------|---------------|-------------------|
| **Accessibility** | Terminal required | Web browser |
| **Tool Visualization** | Text output | Rich, interactive display |
| **Tool Results** | JSON/text | Formatted, expandable cards |
| **Conversation History** | Session-based | Persistent storage |
| **Mobile Support** | Limited | Full responsive design |
| **User Experience** | Developer-focused | User-friendly |
| **Setup Complexity** | Simple | Requires frontend setup |
| **Real-time Updates** | Basic | Advanced streaming |

## 🔄 Architecture Overview

```
┌─────────────────┐    HTTP/JSON     ┌──────────────────────────────┐
│   Agent UI      │ ◄─────────────► │     Enhanced CLI Server      │
│  (Next.js)      │   Messages      │      (Express.js)            │
│  Port: 3000     │                 │      Port: 8081              │
└─────────────────┘                 └──────────────────────────────┘
                                                    │
                                    ┌───────────────┼───────────────┐
                                    │               │               │
                               ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
                               │Hustle AI│    │MCP Tools│    │Local    │
                               │Client   │    │(Smithery│    │Tools    │
                               │         │    │etc.)    │    │         │
                               └─────────┘    └─────────┘    └─────────┘
```

## 🧪 Testing & Validation

### 🔍 Test Scripts

**Comprehensive Testing**:
```bash
# Test all integrations
npm test

# Test specific components
node test-agentui.js          # Agent UI integration
node test-smithery.js         # Smithery MCP tools
node test-ordiscan.js         # Bitcoin ordinals tools
node test-stock-analysis.js   # Stock market tools
node test-hustle-direct.js    # AgentHustle AI
```

**Health Checks**:
```bash
# Backend health
curl http://localhost:8081/health

# Agent UI connectivity
curl http://localhost:8081/v1/playground/status

# Tool availability
curl -X POST http://localhost:8081/api/tools/list
```

## 🔧 Development & Extension

### 🛠️ Adding New Tools

**Smithery Integration** (Recommended):
1. Find tool on [smithery.ai](https://smithery.ai/)
2. Follow [Smithery Integration Guide](SMITHERY_INTEGRATION_GUIDE.md)
3. Use template: `templates/new-smithery-tool-template.js`
4. See example: `examples/add-weather-tool-example.js`

**Local Tool Development**:
1. Create tool in `src/tools/`
2. Add registration in `src/server.js`
3. Implement tool interface
4. Add tests and documentation

### 📚 Documentation Resources

- **[Tool Flow Guide](TOOL_FLOW_GUIDE.md)**: Complete 6-step integration pattern
- **[Quick Reference](QUICK_REFERENCE.md)**: 5-minute tool addition checklist
- **[Smithery Integration Guide](SMITHERY_INTEGRATION_GUIDE.md)**: Comprehensive Smithery setup
- **[Security Checklist](SECURITY_CHECKLIST.md)**: Security best practices
- **[recreate.md](recreate.md)**: Complete step-by-step implementation guide

## 🚨 Troubleshooting

### Common Issues

**CORS Errors**:
```bash
# Solution: Check CORS configuration in src/server.js
# Ensure frontend URL is in allowed origins
```

**Tool Execution Failures**:
```bash
# Check API keys in .env file
# Verify tool name spelling and parameters
# Check network connectivity to external APIs
```

**Agent UI Connection Issues**:
```bash
# Verify backend is running on port 8081
# Check frontend API configuration
# Ensure no firewall blocking connections
```

**Missing Tool Results**:
```bash
# Verify tool result formatting in backend
# Check Agent UI tool display components
# Ensure proper JSON serialization
```

## 🌟 Advanced Features

### 🔄 Tool Chaining
- Automatic tool selection based on context
- Multi-step tool execution workflows
- Result passing between tools
- AI-guided tool orchestration

### 📊 Analytics & Monitoring
- Tool execution metrics and timing
- Success/failure rate tracking
- Usage pattern analysis
- Performance optimization insights

### 🔐 Security Features
- API key rotation support
- Rate limiting and throttling
- Input validation and sanitization
- Secure credential management

## 🤝 Contributing

We welcome contributions! Please:

1. **Follow the Integration Guides**: Use established patterns for new tools
2. **Add Comprehensive Tests**: Include test scripts for new features
3. **Update Documentation**: Keep guides and examples current
4. **Security First**: Never commit API keys or sensitive data
5. **Code Quality**: Follow existing patterns and conventions

### 📝 Contribution Areas

- 🛠️ New tool integrations using Smithery
- 🎨 Agent UI enhancements and features
- 📚 Documentation improvements
- 🧪 Test coverage expansion
- 🔧 Performance optimizations
- 🔒 Security enhancements

## 📄 License

MIT License - See LICENSE file for details

---

## 🎯 What's Next?

This Enhanced CLI Boilerplate provides a powerful foundation for building AI-powered applications with modern UI and extensive tool capabilities. The modular architecture allows for easy extension and customization.

**Ready to get started?** 
1. 📖 Check the [recreate.md](recreate.md) for step-by-step implementation
2. 🚀 Follow the Quick Start guide above
3. 🛠️ Add your first custom tool using our guides
4. 🎨 Customize the Agent UI to match your needs

**Questions or need help?** Check our comprehensive documentation or open an issue!

😎 