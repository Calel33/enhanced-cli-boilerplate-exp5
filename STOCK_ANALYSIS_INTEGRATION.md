# 📈 Stock Analysis MCP Integration

## Overview

This document describes the integration of **@qubaomingg/stock-analysis-mcp** from Smithery into the enhanced CLI boilerplate. This integration provides 3 powerful stock analysis tools powered by Alpha Vantage API.

## 🔧 Integration Details

### Smithery MCP Server
- **Author**: @qubaomingg
- **Tool**: stock-analysis-mcp
- **Base URL**: `https://server.smithery.ai/@qubaomingg/stock-analysis-mcp/mcp`
- **API Key Required**: Alpha Vantage API key
- **Profile**: `glad-squid-LrsVYY` (default)

### Available Tools

1. **get-stock-data** / **get_stock_data**
   - Get real-time stock market data
   - Parameters: `symbol` (required)
   - Returns: Current price, volume, market metrics

2. **get-stock-alerts** / **get_stock_alerts**
   - Generate stock alerts based on price movements
   - Parameters: `symbol` (required), `threshold` (optional)
   - Returns: Alert configurations and triggers

3. **get-daily-stock-data** / **get_daily_stock_data**
   - Get historical daily stock data
   - Parameters: `symbol` (required), `days` (optional)
   - Returns: Historical price data with customizable periods

## 🚀 Setup Instructions

### 1. Get Alpha Vantage API Key

1. Visit [Alpha Vantage API](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Copy your API key

### 2. Configure Environment Variables

Add to your `.env` file:
```env
# Alpha Vantage API Configuration (for stock analysis)
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key-here

# Smithery Configuration (if not already configured)
SMITHERY_API_KEY=your-smithery-api-key-here
SMITHERY_PROFILE=your-smithery-profile-here
```

### 3. Test the Integration

```bash
# Test all stock analysis tools
node test-stock-analysis.js

# Start the MCP server
npm run start:server

# Start the CLI in another terminal
npm start
```

## 💡 Usage Examples

### Natural Language Queries

The AI will automatically select the appropriate stock analysis tools:

```
[chat]> What is the current stock price of Apple?
[chat]> Show me Tesla's performance over the last 30 days
[chat]> Set up alerts for Microsoft stock with a 5% threshold
[chat]> Get me real-time data for NVIDIA
[chat]> What was Amazon's stock trend last week?
```

### Direct Tool Usage

```
[chat]> /use get-stock-data
Enter symbol: AAPL

[chat]> /use get-daily-stock-data  
Enter symbol: TSLA
Enter days: 30

[chat]> /use get-stock-alerts
Enter symbol: MSFT
Enter threshold: 5.0
```

## 🔄 Integration Flow

### 1. Tool Detection
```javascript
// CLI detects stock analysis tool calls
if (toolName.includes('stock') || toolName.includes('get-stock')) {
  // Handle both hyphen and underscore formats
  const hyphenName = toolName.replace(/_/g, '-');
  const underscoreName = toolName.replace(/-/g, '_');
  mappedToolName = hyphenName; // Prefer hyphen for Smithery
}
```

### 2. Tool Execution
```javascript
// Server executes via Smithery MCP
case 'get-stock-data':
case 'get_stock_data':
  if (stockAnalysisConnected || await initializeStockAnalysis()) {
    const stockParams = { ...params };
    if (process.env.ALPHA_VANTAGE_API_KEY) {
      stockParams.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY;
    }
    const stockResult = await stockAnalysisClient.callTool(normalizedName, stockParams);
    // Parse and format result...
  }
```

### 3. Result Processing
```javascript
// CLI shows appropriate summaries and correctly identifies as Smithery tool
const toolSource = (tool.source === 'smithery' || tool.source === 'ordiscan' || tool.source === 'stock-analysis') ? '🌐 Smithery' : '📦 Local';
console.log(chalk.blue(`\n🔧 Using ${toolCall.name} (${toolSource})...`));

if (result.source === 'stock-analysis') {
  if (result.symbol) {
    if (toolCall.name.includes('stock-data')) {
      console.log(chalk.cyan(`📈 Stock data for ${result.symbol}`));
    } else if (toolCall.name.includes('alerts')) {
      console.log(chalk.cyan(`🚨 Stock alerts for ${result.symbol}`));
    }
  }
}
```

### 4. AI Summarization
```javascript
// AgentHustle provides intelligent summary
const followUpPrompt = `I successfully executed stock analysis tools and got the following results:
${JSON.stringify(toolResults, null, 2)}
Please summarize this data for the user and ask if they would like to do anything further with it.`;
```

## 🧪 Testing

### Automated Testing
```bash
node test-stock-analysis.js
```

**Test Coverage:**
- ✅ Alpha Vantage API key validation
- ✅ MCP server connectivity
- ✅ All 3 stock analysis tools
- ✅ Both naming conventions (hyphen/underscore)
- ✅ Error handling and response parsing
- ✅ Performance timing
- ✅ Result formatting

### Manual Testing
```bash
# Start server
npm run start:server

# Test via CLI
npm start
[chat]> What is Apple's current stock price?
```

## 🔧 Technical Implementation

### Files Modified

1. **src/server.js**
   - Added `stockAnalysisClient` initialization
   - Added `initializeStockAnalysis()` function
   - Added stock analysis tools to `/api/tools/list`
   - Added tool execution logic for all 3 tools
   - Added startup logging for stock analysis

2. **src/cli.js**
   - Added stock analysis tool name mapping
   - Added stock analysis result summaries
   - Added stock analysis tools to tools listing

3. **env.example**
   - Added `ALPHA_VANTAGE_API_KEY` configuration

4. **test-stock-analysis.js**
   - Comprehensive test suite for all tools
   - API key validation
   - Performance testing
   - Error handling verification

5. **README.md**
   - Added stock analysis documentation
   - Added usage examples
   - Added setup instructions

### Key Features

- **Dual Naming Support**: Handles both `get-stock-data` and `get_stock_data` formats
- **Automatic API Key Injection**: Adds Alpha Vantage API key to requests automatically
- **Intelligent Result Summaries**: Shows appropriate summaries based on tool type
- **Error Handling**: Graceful degradation when API key is missing or tools fail
- **Performance Monitoring**: Test script includes timing measurements
- **AI Integration**: Seamless integration with AgentHustle for natural language queries

## 🚨 Error Handling

### Common Issues

1. **Missing API Key**
   ```
   ❌ ALPHA_VANTAGE_API_KEY not configured
   Solution: Add API key to .env file
   ```

2. **API Rate Limits**
   ```
   ❌ Alpha Vantage rate limit exceeded
   Solution: Wait or upgrade to premium plan
   ```

3. **Invalid Symbol**
   ```
   ❌ Stock symbol not found
   Solution: Use valid stock ticker symbols (e.g., AAPL, TSLA)
   ```

4. **Smithery Connection Issues**
   ```
   ❌ Stock Analysis not available - no connection
   Solution: Check Smithery credentials and internet connectivity
   ```

### Debugging

Enable debug mode:
```env
DEBUG=true
```

Check server logs for detailed error information.

## 📊 API Limits

### Alpha Vantage Free Tier
- **Rate Limit**: 5 requests per minute
- **Daily Limit**: 500 requests per day
- **Data**: Real-time and historical stock data
- **Upgrade**: Premium plans available for higher limits

### Best Practices
- Cache results when possible
- Use batch requests for multiple symbols
- Implement request queuing for rate limit compliance
- Monitor usage to avoid hitting daily limits

## 🎯 Future Enhancements

### Potential Additions
1. **More Stock Tools**: Add cryptocurrency, forex, or commodity analysis
2. **Portfolio Tracking**: Implement portfolio management tools
3. **Technical Indicators**: Add RSI, MACD, moving averages
4. **News Integration**: Combine stock data with financial news
5. **Alerts System**: Implement persistent alert monitoring

### Integration Opportunities
- **Database Storage**: Store historical data locally
- **Visualization**: Add chart generation capabilities
- **Notifications**: Email/SMS alerts for price movements
- **Webhooks**: Real-time data streaming

## 📝 Conclusion

The stock analysis integration provides a powerful foundation for financial data analysis within the enhanced CLI boilerplate. With 3 core tools and seamless AI integration, users can easily access real-time and historical stock market data through natural language queries.

The integration follows the established patterns from the Brave Search and Ordiscan integrations, ensuring consistency and maintainability across all tool integrations.

---

**Related Documentation:**
- [Smithery Integration Guide](SMITHERY_INTEGRATION_GUIDE.md)
- [Tool Flow Guide](TOOL_FLOW_GUIDE.md)
- [Quick Reference](QUICK_REFERENCE.md)
- [Main README](README.md) 