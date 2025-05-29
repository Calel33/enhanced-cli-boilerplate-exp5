# Enhanced CLI Boilerplate with AgentHustle Integration

This is an enhanced CLI boilerplate that demonstrates integration between AgentHustle's AI capabilities and tools using both local implementations and Smithery's hosted Model Context Protocol (MCP) services.

## Features

- **Multiple Operation Modes**:
  - `chat`: Default mode for interacting with AgentHustle AI
  - `tools`: Direct tool usage mode
  - `stream`: Streaming response mode (for real-time AI responses)

- **Integrated Tools**:
  - `brave-search`: Web search using **Smithery hosted Brave Search** (preferred) or local Brave Search API
  - `rugcheck`: Security analysis for crypto tokens
  - `trending-tokens`: Get trending tokens on various blockchains
  - `wallet-balance`: Check wallet balances
  - `crypto-chat`: Specialized crypto-focused chat
  - **`ordiscan` tools**: 29 Bitcoin ordinals, inscriptions, BRC-20, and runes tools via Smithery

- **Smithery Integration**:
  - **Hosted MCP Tools**: Access to Smithery's hosted tool ecosystem
  - **Automatic Fallback**: Falls back to local implementations when Smithery is unavailable
  - **No API Key Management**: Use Smithery's hosted services without managing your own API keys
  - **Consistent Interface**: Standard MCP protocol for all tools

- **Tool Integration Features**:
  - Automatic tool call parsing from AgentHustle responses
  - Client-side tool execution
  - Result summarization by AgentHustle
  - Interactive follow-up suggestions

## 🎨 Agent UI Integration

This boilerplate now includes a **modern web interface** powered by Agent UI, providing a beautiful and intuitive way to interact with your enhanced CLI backend.

### ✨ Agent UI Features

- **🖥️ Modern Chat Interface**: Beautiful, responsive web UI built with Next.js and Tailwind CSS
- **🔧 Tool Call Visualization**: See exactly which tools are being used and their results in real-time
- **📊 Interactive Tool Results**: Rich display of tool outputs with expandable results, syntax highlighting, and proper formatting
- **✅ Tool Execution Status**: Visual indicators showing successful/failed tool executions with detailed error information
- **🔍 Expandable Tool Details**: Click to expand tool calls and see detailed results, arguments, and execution metrics
- **💬 Conversation History**: Persistent chat sessions with full context
- **🎯 Real-time Updates**: Live streaming of AI responses and tool executions
- **📱 Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

### 🚀 Quick Start with Agent UI

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

### 🔗 How Agent UI Works

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

### 🎯 Agent UI Usage Examples

**Bitcoin & Crypto Analysis**:
```
💬 "What BRC-20 tokens does this address own: bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr"
🔧 → Uses ordiscan_address_brc20 tool
📊 → Displays formatted token balances with rich UI
```

**Web Search & Research**:
```
💬 "What are the latest developments in Solana DeFi?"
🔧 → Uses brave-search tool via Smithery
📊 → Shows search results with clickable links and summaries
```

**Stock Market Analysis**:
```
💬 "Show me Apple's stock performance over the last 30 days"
🔧 → Uses get-daily-stock-data tool
📊 → Displays interactive charts and market data
```

### 🔧 Tool Result Display Features

The Agent UI now provides comprehensive visualization of tool executions:

**📊 Enhanced Tool Visualization**:
- **Tool Call Cards**: Each tool execution is displayed in a dedicated card with clear visual hierarchy
- **Success/Error Indicators**: Green checkmarks for successful executions, red X marks for failures
- **Expandable Results**: Click any tool card to expand and see detailed results
- **Syntax Highlighting**: JSON results are properly formatted with syntax highlighting
- **Execution Metrics**: See tool execution time and other performance metrics

**🎯 Interactive Tool Results**:
```
🔧 Tool: brave-search
📝 Arguments: {"query": "Solana DeFi", "count": 5}
✅ Status: Success
📊 Results: [Click to expand]
   ↳ Shows formatted search results with links, descriptions, and metadata
```

**🔍 Tool Result Examples**:

*Bitcoin Address Analysis*:
```
🔧 ordiscan_address_brc20
✅ Success - Found 3 BRC-20 tokens
📊 Results:
   • ORDI: 1,250.5 tokens
   • SATS: 50,000,000 tokens  
   • PEPE: 100,000 tokens
```

*Stock Data Retrieval*:
```
🔧 get-stock-data  
✅ Success - Retrieved AAPL data
📊 Results:
   • Current Price: $185.42
   • Change: +2.15 (+1.17%)
   • Volume: 45,234,567
   • Market Cap: $2.89T
```

*Web Search Results*:
```
🔧 brave-search
✅ Success - Found 5 results
📊 Results:
   1. "Solana DeFi TVL Reaches New High" - CoinDesk
   2. "Top Solana DeFi Protocols in 2024" - DeFiPulse
   3. "Solana vs Ethereum DeFi Comparison" - CryptoNews
   [Click to see full results with links and descriptions]
```

### 🛠️ Agent UI Configuration

The Agent UI is pre-configured to connect to your CLI backend. Key configuration points:

- **Backend Endpoint**: `http://localhost:8081`
- **API Routes**: `/api/agentui/chat` for main chat interface
- **Playground APIs**: `/v1/playground/*` for Agent UI compatibility
- **CORS**: Properly configured for frontend-backend communication

### 📱 Agent UI vs CLI Interface

| Feature | CLI Interface | Agent UI Interface |
|---------|---------------|-------------------|
| **Accessibility** | Terminal required | Web browser |
| **Tool Visualization** | Text output | Rich, interactive display |
| **Conversation History** | Session-based | Persistent storage |
| **Mobile Support** | Limited | Full responsive design |
| **Tool Results** | JSON/text | Formatted, interactive |
| **User Experience** | Developer-focused | User-friendly |
| **Setup Complexity** | Simple | Requires frontend setup |

### 🔧 Customizing Agent UI

The Agent UI frontend is fully customizable:

- **Styling**: Modify `tailwind.config.ts` for custom themes
- **Components**: Extend React components in `src/components/`
- **API Integration**: Customize `src/api/cli-backend.ts` for different backends
- **Store Management**: Modify `src/store.ts` for state management

### 📚 Agent UI Documentation

For detailed setup and customization instructions, see:
- **[recreate.md](recreate.md)**: Complete step-by-step guide for implementing CLI-to-frontend integration
- **[tutorial.md](tutorial.md)**: Detailed tutorial on Agent UI integration
- **Agent UI Repository**: [https://github.com/agno-agi/agent-ui](https://github.com/agno-agi/agent-ui)

## 📚 Documentation

- **[Tool Flow Guide](TOOL_FLOW_GUIDE.md)**: Complete 6-step flow pattern for seamless AgentHustle integration
- **[Quick Reference](QUICK_REFERENCE.md)**: 5-minute checklist for adding any Smithery tool
- **[Smithery Integration Guide](SMITHERY_INTEGRATION_GUIDE.md)**: Complete guide for adding any Smithery tool to your project
- **[Tool Template](templates/new-smithery-tool-template.js)**: Copy-paste template for quick tool integration
- **[Weather Tool Example](examples/add-weather-tool-example.js)**: Concrete example of adding a weather tool

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with required credentials (copy from `env.example`):
```env
# Required
HUSTLE_API_KEY=your-api-key-here
VAULT_ID=your-vault-id-here

# Smithery Configuration (for hosted tools)
SMITHERY_API_KEY=your-smithery-api-key
SMITHERY_PROFILE=your-smithery-profile-here

# Ordiscan API Configuration
ORDISCAN_API_KEY=your-ordiscan-api-key

# Optional - Local Brave Search API (fallback only)
BRAVE_API_KEY=your-brave-search-api-key

# Optional
MCP_PORT=8081
MCP_SERVER_URL=http://localhost:8081
```

**Note**: You'll need to obtain your own credentials:
- **Smithery credentials** from [https://smithery.ai/](https://smithery.ai/) for hosted tools
- **Ordiscan API key** from the tool author for Bitcoin ordinals functionality
- **Brave Search API key** (optional) for local search fallback

All API keys must be configured in your `.env` file - no default keys are provided for security.

## Usage

1. Start the MCP server:
```bash
npm run start:server
# or
node src/server.js
```

2. In a new terminal, start the CLI:
```bash
npm start
# or
node src/cli.js
```

### Available Commands

- `/mode chat`: Switch to chat mode (default)
- `/mode tools`: Switch to tools mode
- `/mode stream`: Switch to streaming mode
- `/tools`: List available tools
- `/use <tool-name>`: Use a specific tool directly
- `/exit`: Exit the application

### Tool Usage Examples

1. **Using Chat Mode with Tool Integration**:
```
[chat]> What are the latest developments in Solana?
```
AgentHustle will automatically use the Smithery hosted Brave search tool and summarize the results.

2. **Bitcoin Ordinals and BRC-20 Queries**:
```
[chat]> What BRC-20 tokens does this Bitcoin address own: bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr
[chat]> Show me information about the ORDI BRC-20 token
[chat]> What inscriptions are in the taproot-wizards collection?
[chat]> Get details about inscription b61b0172d95e266c18aea0c624db987e971a5d6d4ebc2aaed85da4642d635735i0
```
AgentHustle will automatically use the appropriate Ordiscan tools and provide detailed Bitcoin ordinals information.

3. **Direct Tool Usage**:
```
[chat]> /use brave-search
Enter query: latest Solana developments
Enter count (default: 5): 10
```

## 🔗 Ordiscan Bitcoin Tools Integration

This boilerplate includes **29 specialized Bitcoin tools** via the Ordiscan MCP integration:

### 📊 BRC-20 Token Tools
- `ordiscan_brc20_list`: Get paginated list of BRC-20 tokens
- `ordiscan_brc20_info`: Get detailed information about specific BRC-20 tokens
- `ordiscan_address_brc20`: Get BRC-20 token balances for any Bitcoin address
- `ordiscan_address_brc20_activity`: Get BRC-20 transaction history for addresses

### 🖼️ Inscription Tools  
- `ordiscan_inscriptions_list`: Browse all inscriptions with pagination
- `ordiscan_inscription_info`: Get detailed inscription information
- `ordiscan_inscription_traits`: Get traits for specific inscriptions
- `ordiscan_inscription_transfers`: Get transfer history for inscriptions
- `ordiscan_address_inscriptions`: Get all inscriptions owned by an address

### 🔮 Runes Tools
- `ordiscan_runes_list`: Get paginated list of all runes
- `ordiscan_rune_market`: Get latest price and market cap for runes
- `ordiscan_rune_name_unlock`: Check when rune names become available
- `ordiscan_address_runes`: Get rune balances for Bitcoin addresses
- `ordiscan_runes_activity`: Get rune transfer activity

### 📚 Collection Tools
- `ordiscan_collections_list`: Browse indexed NFT collections
- `ordiscan_collection_info`: Get detailed collection information
- `ordiscan_collection_inscriptions`: Get inscriptions within collections

### 📝 Transaction & UTXO Tools
- `ordiscan_tx_info`: Get Bitcoin transaction information
- `ordiscan_tx_inscriptions`: Get inscriptions created in transactions
- `ordiscan_tx_runes`: Get runes minted/transferred in transactions
- `ordiscan_address_utxos`: Get UTXOs and associated inscriptions/runes
- `ordiscan_utxo_rare_sats`: Get rare satoshis in specific UTXOs

### 💎 Rare Satoshis Tools
- `ordiscan_address_rare_sats`: Get rare satoshis owned by addresses
- `ordiscan_sat_info`: Get information about specific satoshis
- `ordiscan_utxo_sat_ranges`: Get satoshi ranges for UTXOs

All these tools work seamlessly with AgentHustle AI - just ask natural language questions about Bitcoin ordinals, and the AI will automatically select and use the appropriate tools!

## 📈 Stock Analysis Tools Integration

This boilerplate includes **3 powerful stock analysis tools** via the Alpha Vantage MCP integration:

### 💹 Real-Time Market Data
- `get-stock-data`: Get real-time stock market data including current price, volume, and market metrics
- `get-daily-stock-data`: Get historical daily stock data with customizable time periods
- `get-stock-alerts`: Generate intelligent stock alerts based on price movements and thresholds

### 🎯 Stock Analysis Examples

**Real-Time Stock Queries**:
```
[chat]> What is the current stock price of Apple?
[chat]> Show me Tesla's stock performance today
[chat]> Get me the latest market data for Microsoft
```

**Historical Data Analysis**:
```
[chat]> Show me Apple's stock performance over the last 30 days
[chat]> Get daily stock data for NVIDIA for the past week
[chat]> What was Tesla's stock trend last month?
```

**Stock Alerts & Monitoring**:
```
[chat]> Set up stock alerts for Amazon with a 5% threshold
[chat]> Create price alerts for Google stock
[chat]> Monitor Microsoft for significant price changes
```

### 🔑 Alpha Vantage API Key Setup

To use stock analysis tools, you'll need a free Alpha Vantage API key:

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Get your API key
4. Add it to your `.env` file:
```env
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
```

**Free Tier Limits**: 
- 5 API requests per minute
- 500 requests per day
- Perfect for testing and light usage

### 🧪 Testing Stock Analysis

Test your stock analysis integration:
```bash
node test-stock-analysis.js
```

This will verify:
- ✅ Alpha Vantage API key configuration
- ✅ MCP server connectivity  
- ✅ All 3 stock analysis tools functionality
- ✅ Both hyphen and underscore naming conventions
- ✅ Error handling and response parsing

All stock analysis tools work seamlessly with AgentHustle AI - just ask natural language questions about stocks, and the AI will automatically select and use the appropriate tools!

## Smithery vs Local Tools

- **Smithery Tools** (Preferred): Hosted on Smithery's infrastructure, no API key management required
- **Local Tools** (Fallback): Run locally with your own API keys when Smithery is unavailable
- **Automatic Selection**: The system automatically chooses Smithery when available, falls back to local implementations

## 🔧 Adding New Smithery Tools

Want to add more tools from Smithery? It's easy! Follow these steps:

1. **Quick Start**: Check the [Smithery Integration Guide](SMITHERY_INTEGRATION_GUIDE.md) for detailed instructions
2. **Use the Template**: Copy `templates/new-smithery-tool-template.js` and modify it for your tool
3. **See Examples**: Look at `examples/add-weather-tool-example.js` for a complete working example

### Basic Steps:
1. Find your tool on [smithery.ai](https://smithery.ai)
2. Add tool configuration to `src/utils/smithery-client.js`
3. Add tool execution logic to `src/server.js`
4. Create a test script
5. Test and enjoy!

The same pattern used for Brave Search works for **any** Smithery tool.

## Tool Response Handling

The system handles tool responses in the following way:

1. AgentHustle makes a tool call using the format:
```
<tool>brave_web_search({
  query: "search query",
  count: 10,
  offset: 0
})</tool>
```

2. The CLI intercepts and processes these tool calls
3. Tools are executed via Smithery (preferred) or locally (fallback)
4. Results are sent back to AgentHustle for summarization
5. AgentHustle provides a summary and suggests next steps

## Development

### Adding New Tools

1. **For Smithery Integration**: Follow the [Smithery Integration Guide](SMITHERY_INTEGRATION_GUIDE.md)
2. **For Local Tools**: Create a new tool file in `src/tools/` and add registration in `src/server.js`

### Tool Implementation Requirements

- Each tool must provide:
  - `name`: Unique identifier
  - `description`: Tool purpose
  - `parameters`: JSON Schema of accepted parameters
  - `execute()`: Implementation function (for local tools)

## Error Handling

The system includes comprehensive error handling for:
- Missing environment variables
- Smithery connection failures with automatic fallback
- Tool execution failures
- API communication issues
- Invalid tool calls or parameters

## Contributing

Feel free to contribute by:
- Adding new tools using the [Smithery Integration Guide](SMITHERY_INTEGRATION_GUIDE.md)
- Improving existing tool implementations
- Enhancing the CLI interface
- Adding new features
- Improving Smithery integration

## License

MIT License - See LICENSE file for details

## 🔒 Security

**Important Security Notes:**

- **Never commit API keys to version control** - The `.env` file is gitignored for this reason
- **No hardcoded fallback keys** - All API keys must be provided via environment variables
- **Use your own credentials** - No default or example API keys are provided in the codebase
- **Environment-specific configuration** - Use different API keys for development, staging, and production

If you accidentally commit API keys:
1. Immediately revoke the exposed keys
2. Generate new API keys
3. Update your environment variables
4. Consider using tools like `git-secrets` to prevent future accidents