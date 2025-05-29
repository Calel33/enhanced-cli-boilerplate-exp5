# Complete Recreation Guide: Enhanced CLI Boilerplate with Agent UI Integration

This guide provides step-by-step instructions to recreate the Enhanced CLI Boilerplate project with full Agent UI integration, advanced tool visualization, and comprehensive tool ecosystem.

## 🎯 Project Overview

**What We're Building**:
- **Dual Interface System**: Modern web UI + traditional CLI
- **Enhanced Tool Visualization**: Rich, interactive tool result displays
- **29+ Bitcoin/Crypto Tools**: Complete ordinals ecosystem via Ordiscan
- **Stock Market Analysis**: Real-time and historical data
- **Web Search Integration**: Smithery-hosted Brave Search with fallbacks
- **AgentHustle AI**: Intelligent tool selection and execution

**Key Features Added**:
- ✅ **Expandable Tool Result Cards**: Click-to-expand with detailed results
- ✅ **Success/Error Indicators**: Visual feedback with green/red status
- ✅ **Syntax Highlighting**: Properly formatted JSON results
- ✅ **Execution Metrics**: Tool timing and performance data
- ✅ **Mobile Responsive**: Seamless cross-device experience

## 🚀 Step 1: Project Foundation

### 1.1 Initialize Project Structure

```bash
mkdir enhanced-cli-boilerplate-exp5
cd enhanced-cli-boilerplate-exp5

# Initialize package.json
npm init -y

# Create directory structure
mkdir -p src/{tools,utils}
mkdir -p templates
mkdir -p examples
mkdir -p my-cli-frontend
```

### 1.2 Install Core Dependencies

```bash
# Backend dependencies
npm install express cors dotenv
npm install @emblem-sdk/hustle-incognito
npm install axios node-fetch

# Development dependencies
npm install --save-dev nodemon
```

### 1.3 Create Package.json Scripts

```json
{
  "scripts": {
    "start": "node src/cli.js",
    "start:server": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "node test-all.js"
  }
}
```

## 🔧 Step 2: Backend Server Implementation

### 2.1 Create Enhanced Server (src/server.js)

```javascript
const express = require('express');
const cors = require('cors');
const { HustleClient } = require('@emblem-sdk/hustle-incognito');
require('dotenv').config();

const app = express();
const PORT = process.env.MCP_PORT || 8081;

// Enhanced CORS configuration for Agent UI
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize Hustle client
const hustleClient = new HustleClient({
    apiKey: process.env.HUSTLE_API_KEY,
    vaultId: process.env.VAULT_ID
});

// Import all tools
const ordiscanTools = require('./tools/ordiscan-tools');
const stockTools = require('./tools/stock-analysis-tools');
const braveSearchTool = require('./tools/brave-search-tool');

// Register all tools
const allTools = [
    ...ordiscanTools,
    ...stockTools,
    braveSearchTool
];

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        tools: allTools.length 
    });
});

// Agent UI status endpoint
app.get('/v1/playground/status', (req, res) => {
    res.json({
        status: 'connected',
        name: 'Enhanced CLI Backend',
        version: '1.0.0',
        tools: allTools.length,
        features: [
            'Bitcoin Ordinals Analysis',
            'Stock Market Data',
            'Web Search',
            'Enhanced Tool Visualization'
        ]
    });
});

// Enhanced Agent UI chat endpoint with tool result formatting
app.post('/api/agentui/chat', async (req, res) => {
    try {
        const { message, conversation_history = [] } = req.body;
        
        console.log('🎯 Agent UI Request:', { message, historyLength: conversation_history.length });

        // Convert Agent UI format to Hustle format
        const hustleMessages = convertAgentUIToHustle([
            ...conversation_history,
            { role: 'user', content: message, created_at: Date.now() }
        ]);

        // Get response from Hustle AI
        const response = await hustleClient.chat({
            messages: hustleMessages,
            tools: allTools,
            stream: false
        });

        console.log('🤖 Hustle Response:', JSON.stringify(response, null, 2));

        // Enhanced tool call processing with proper formatting
        let processedMessages = [];
        
        if (response.messages) {
            for (const msg of response.messages) {
                if (msg.role === 'assistant' && msg.tool_calls) {
                    // Process assistant message with tool calls
                    processedMessages.push({
                        role: 'assistant',
                        content: msg.content || '',
                        created_at: Date.now(),
                        tool_calls: msg.tool_calls.map(tc => ({
                            id: tc.id,
                            type: 'function',
                            function: {
                                name: tc.function.name,
                                arguments: tc.function.arguments
                            }
                        }))
                    });

                    // Execute tools and format results for Agent UI
                    for (const toolCall of msg.tool_calls) {
                        try {
                            const startTime = Date.now();
                            const tool = allTools.find(t => t.name === toolCall.function.name);
                            
                            if (tool) {
                                const args = JSON.parse(toolCall.function.arguments);
                                const result = await tool.handler(args);
                                const executionTime = Date.now() - startTime;

                                // Format tool result for Agent UI with enhanced display data
                                processedMessages.push({
                                    role: 'tool',
                                    content: JSON.stringify(result, null, 2), // Properly formatted JSON
                                    tool_call_id: toolCall.id,
                                    tool_name: toolCall.function.name,
                                    tool_args: args,
                                    tool_call_error: false,
                                    metrics: { time: executionTime },
                                    created_at: Date.now()
                                });
                            }
                        } catch (error) {
                            console.error('❌ Tool execution error:', error);
                            
                            // Format error result for Agent UI
                            processedMessages.push({
                                role: 'tool',
                                content: JSON.stringify({ 
                                    error: error.message,
                                    type: 'execution_error'
                                }, null, 2),
                                tool_call_id: toolCall.id,
                                tool_name: toolCall.function.name,
                                tool_call_error: true,
                                metrics: { time: 0 },
                                created_at: Date.now()
                            });
                        }
                    }
                } else {
                    // Regular message without tool calls
                    processedMessages.push({
                        role: msg.role,
                        content: msg.content || '',
                        created_at: Date.now()
                    });
                }
            }
        }

        console.log('📤 Sending to Agent UI:', JSON.stringify(processedMessages, null, 2));
        res.json({ messages: processedMessages });

    } catch (error) {
        console.error('❌ Agent UI chat error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Utility function to convert Agent UI messages to Hustle format
function convertAgentUIToHustle(agentUIMessages) {
    return agentUIMessages.map(msg => {
        // Handle tool messages specially
        if (msg.role === 'tool') {
            return {
                role: 'tool',
                content: msg.content,
                tool_call_id: msg.tool_call_id
            };
        }
        
        // Standard message conversion
        return {
            role: msg.role,
            content: msg.content
        };
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Enhanced CLI Server running on http://localhost:${PORT}`);
    console.log(`🎨 Agent UI ready at http://localhost:3000`);
    console.log(`🛠️  Tools available: ${allTools.length}`);
});

module.exports = app;
```

### 2.2 Create Tool Implementations

**Bitcoin Ordinals Tools (src/tools/ordiscan-tools.js)**:

```javascript
const axios = require('axios');

const ORDISCAN_BASE_URL = 'https://api.ordiscan.com';
const API_KEY = process.env.ORDISCAN_API_KEY;

// Helper function for API calls
async function ordiscanRequest(endpoint, params = {}) {
    try {
        const url = `${ORDISCAN_BASE_URL}${endpoint}`;
        const response = await axios.get(url, {
            params: { ...params, api_key: API_KEY },
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        throw new Error(`Ordiscan API error: ${error.message}`);
    }
}

// BRC-20 Token Tools
const brc20Tools = [
    {
        name: 'ordiscan_brc20_list',
        description: 'Get paginated list of all BRC-20 tokens with market data',
        parameters: {
            type: 'object',
            properties: {
                page: { type: 'number', description: 'Page number (default: 1)' },
                limit: { type: 'number', description: 'Items per page (max: 100)' }
            }
        },
        handler: async ({ page = 1, limit = 20 }) => {
            return await ordiscanRequest('/v1/brc20/tokens', { page, limit });
        }
    },
    {
        name: 'ordiscan_brc20_info',
        description: 'Get detailed information about a specific BRC-20 token',
        parameters: {
            type: 'object',
            properties: {
                ticker: { type: 'string', description: 'BRC-20 token ticker (e.g., "ordi")' }
            },
            required: ['ticker']
        },
        handler: async ({ ticker }) => {
            return await ordiscanRequest(`/v1/brc20/token/${ticker}`);
        }
    },
    {
        name: 'ordiscan_address_brc20',
        description: 'Get BRC-20 token balances for a Bitcoin address',
        parameters: {
            type: 'object',
            properties: {
                address: { type: 'string', description: 'Bitcoin address' }
            },
            required: ['address']
        },
        handler: async ({ address }) => {
            return await ordiscanRequest(`/v1/address/${address}/brc20`);
        }
    }
];

// Inscription Tools
const inscriptionTools = [
    {
        name: 'ordiscan_inscriptions_list',
        description: 'Browse all inscriptions with optional filters',
        parameters: {
            type: 'object',
            properties: {
                page: { type: 'number', description: 'Page number' },
                limit: { type: 'number', description: 'Items per page' },
                content_type: { type: 'string', description: 'Filter by content type' }
            }
        },
        handler: async ({ page = 1, limit = 20, content_type }) => {
            const params = { page, limit };
            if (content_type) params.content_type = content_type;
            return await ordiscanRequest('/v1/inscriptions', params);
        }
    },
    {
        name: 'ordiscan_inscription_info',
        description: 'Get detailed information about a specific inscription',
        parameters: {
            type: 'object',
            properties: {
                inscription_id: { type: 'string', description: 'Inscription ID' }
            },
            required: ['inscription_id']
        },
        handler: async ({ inscription_id }) => {
            return await ordiscanRequest(`/v1/inscription/${inscription_id}`);
        }
    }
];

// Runes Tools
const runesTools = [
    {
        name: 'ordiscan_runes_list',
        description: 'Get list of all runes with market data',
        parameters: {
            type: 'object',
            properties: {
                page: { type: 'number', description: 'Page number' },
                limit: { type: 'number', description: 'Items per page' }
            }
        },
        handler: async ({ page = 1, limit = 20 }) => {
            return await ordiscanRequest('/v1/runes', { page, limit });
        }
    },
    {
        name: 'ordiscan_address_runes',
        description: 'Get rune balances for a Bitcoin address',
        parameters: {
            type: 'object',
            properties: {
                address: { type: 'string', description: 'Bitcoin address' }
            },
            required: ['address']
        },
        handler: async ({ address }) => {
            return await ordiscanRequest(`/v1/address/${address}/runes`);
        }
    }
];

// Export all tools
module.exports = [
    ...brc20Tools,
    ...inscriptionTools,
    ...runesTools
];
```

**Stock Analysis Tools (src/tools/stock-analysis-tools.js)**:

```javascript
const axios = require('axios');

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

async function alphaVantageRequest(params) {
    try {
        const response = await axios.get(BASE_URL, {
            params: { ...params, apikey: ALPHA_VANTAGE_API_KEY },
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        throw new Error(`Alpha Vantage API error: ${error.message}`);
    }
}

module.exports = [
    {
        name: 'get-stock-data',
        description: 'Get real-time stock market data including price, volume, and market cap',
        parameters: {
            type: 'object',
            properties: {
                symbol: { type: 'string', description: 'Stock symbol (e.g., AAPL, TSLA)' }
            },
            required: ['symbol']
        },
        handler: async ({ symbol }) => {
            const data = await alphaVantageRequest({
                function: 'GLOBAL_QUOTE',
                symbol: symbol.toUpperCase()
            });
            
            const quote = data['Global Quote'];
            if (!quote) {
                throw new Error('Stock symbol not found');
            }
            
            return {
                symbol: quote['01. symbol'],
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                change_percent: quote['10. change percent'],
                volume: parseInt(quote['06. volume']),
                latest_trading_day: quote['07. latest trading day']
            };
        }
    },
    {
        name: 'get-daily-stock-data',
        description: 'Get historical daily stock data for analysis',
        parameters: {
            type: 'object',
            properties: {
                symbol: { type: 'string', description: 'Stock symbol' },
                period: { type: 'string', description: 'Time period (compact or full)', default: 'compact' }
            },
            required: ['symbol']
        },
        handler: async ({ symbol, period = 'compact' }) => {
            const data = await alphaVantageRequest({
                function: 'TIME_SERIES_DAILY',
                symbol: symbol.toUpperCase(),
                outputsize: period
            });
            
            const timeSeries = data['Time Series (Daily)'];
            if (!timeSeries) {
                throw new Error('No data available for this symbol');
            }
            
            // Return last 30 days of data
            const dates = Object.keys(timeSeries).slice(0, 30);
            const chartData = dates.map(date => ({
                date,
                open: parseFloat(timeSeries[date]['1. open']),
                high: parseFloat(timeSeries[date]['2. high']),
                low: parseFloat(timeSeries[date]['3. low']),
                close: parseFloat(timeSeries[date]['4. close']),
                volume: parseInt(timeSeries[date]['5. volume'])
            }));
            
            return {
                symbol: symbol.toUpperCase(),
                data: chartData,
                metadata: data['Meta Data']
            };
        }
    }
];
```

**Web Search Tool (src/tools/brave-search-tool.js)**:

```javascript
const axios = require('axios');

// Smithery MCP integration with fallback to local Brave API
async function performBraveSearch(query, count = 10) {
    // Try Smithery first (preferred)
    if (process.env.SMITHERY_API_KEY) {
        try {
            const response = await axios.post('https://api.smithery.ai/v1/mcp/brave-search', {
                query,
                count
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.SMITHERY_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            return {
                source: 'smithery',
                results: response.data.results || []
            };
        } catch (error) {
            console.log('Smithery unavailable, falling back to local Brave API');
        }
    }
    
    // Fallback to local Brave API
    if (process.env.BRAVE_API_KEY) {
        try {
            const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
                params: { q: query, count },
                headers: {
                    'X-Subscription-Token': process.env.BRAVE_API_KEY
                },
                timeout: 10000
            });
            
            return {
                source: 'brave_local',
                results: response.data.web?.results || []
            };
        } catch (error) {
            throw new Error(`Brave Search error: ${error.message}`);
        }
    }
    
    throw new Error('No search API available. Please configure SMITHERY_API_KEY or BRAVE_API_KEY');
}

module.exports = {
    name: 'brave-search',
    description: 'Search the web using Brave Search (via Smithery or local API)',
    parameters: {
        type: 'object',
        properties: {
            query: { type: 'string', description: 'Search query' },
            count: { type: 'number', description: 'Number of results (max 20)', default: 10 }
        },
        required: ['query']
    },
    handler: async ({ query, count = 10 }) => {
        return await performBraveSearch(query, Math.min(count, 20));
    }
};
```

## 🎨 Step 3: Agent UI Frontend Setup

### 3.1 Initialize Agent UI Project

```bash
cd my-cli-frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 3.2 Install Agent UI Dependencies

```bash
npm install @radix-ui/react-tooltip @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

### 3.3 Enhanced Tool Component with Expandable Results

Create `my-cli-frontend/src/components/playground/ChatArea/Messages/ToolComponent.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ToolCall {
  tool_call_id: string;
  tool_name: string;
  tool_args?: Record<string, any>;
  content?: string;
  tool_call_error?: boolean;
  metrics?: { time?: number };
  created_at?: number;
}

interface ToolComponentProps {
  tools: ToolCall;
}

export default function ToolComponent({ tools }: ToolComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Parse content for display
  let parsedContent;
  let contentPreview = '';
  
  try {
    if (tools.content) {
      parsedContent = JSON.parse(tools.content);
      // Create a preview of the content
      if (typeof parsedContent === 'object') {
        const keys = Object.keys(parsedContent);
        contentPreview = keys.length > 0 ? `${keys.length} properties` : 'Empty object';
      } else {
        contentPreview = String(parsedContent).substring(0, 100);
      }
    }
  } catch {
    parsedContent = tools.content;
    contentPreview = String(tools.content || '').substring(0, 100);
  }

  const isError = tools.tool_call_error;
  const executionTime = tools.metrics?.time;

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${
      isError 
        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' 
        : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
    }`}>
      {/* Tool Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          {isError ? (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          )}
          
          {/* Tool Name */}
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {tools.tool_name}
            </span>
            {!isExpanded && contentPreview && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-md">
                {contentPreview}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Execution Time */}
          {executionTime !== undefined && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{executionTime}ms</span>
            </div>
          )}
          
          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Tool Arguments */}
          {tools.tool_args && Object.keys(tools.tool_args).length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Arguments:
              </h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                <code>{JSON.stringify(tools.tool_args, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* Tool Result */}
          {tools.content && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isError ? 'Error:' : 'Result:'}
              </h4>
              <pre className={`p-3 rounded text-xs overflow-x-auto ${
                isError 
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}>
                <code>
                  {typeof parsedContent === 'object' 
                    ? JSON.stringify(parsedContent, null, 2)
                    : String(parsedContent)
                  }
                </code>
              </pre>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span>ID: {tools.tool_call_id}</span>
            {tools.created_at && (
              <span>
                Executed: {new Date(tools.created_at).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3.4 Enhanced Messages Component

Update `my-cli-frontend/src/components/playground/ChatArea/Messages/Messages.tsx`:

```typescript
'use client';

import React from 'react';
import { Hammer } from 'lucide-react';
import ToolComponent from './ToolComponent';
import { Tooltip } from '@/components/ui/tooltip';
import { Icon } from '@/components/ui/icon';

interface Message {
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  created_at: number;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
  tool_name?: string;
  tool_args?: Record<string, any>;
  tool_call_error?: boolean;
  metrics?: { time?: number };
}

interface MessagesProps {
  messages: Message[];
}

export default function Messages({ messages }: MessagesProps) {
  // Group messages and their associated tool calls
  const groupedMessages = React.useMemo(() => {
    const groups: Array<{
      message: Message;
      toolCalls: Message[];
    }> = [];

    let currentGroup: { message: Message; toolCalls: Message[] } | null = null;

    for (const message of messages) {
      if (message.role === 'tool') {
        // Add to current group if it exists
        if (currentGroup) {
          currentGroup.toolCalls.push(message);
        }
      } else {
        // Start new group
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          message,
          toolCalls: []
        };
      }
    }

    // Add final group
    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  return (
    <div className="space-y-6">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          {/* Main Message */}
          <div className={`flex ${group.message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-4 ${
              group.message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            }`}>
              <div className="whitespace-pre-wrap">{group.message.content}</div>
              
              {/* Tool Calls Indicator */}
              {group.message.tool_calls && group.message.tool_calls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Hammer className="w-4 h-4" />
                    <span>Using {group.message.tool_calls.length} tool(s)...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tool Results */}
          {group.toolCalls.length > 0 && (
            <div className="ml-8 space-y-3">
              <div className="flex items-center gap-3">
                <Tooltip
                  delayDuration={0}
                  content={<p className="text-accent">Tool Results</p>}
                  side="top"
                >
                  <Icon
                    type="hammer"
                    className="rounded-lg bg-background-secondary p-1"
                    size="sm"
                    color="secondary"
                  />
                </Tooltip>
                <p className="text-xs uppercase text-secondary font-medium">
                  Tools Used ({group.toolCalls.length})
                </p>
              </div>

              <div className="space-y-3 pl-8">
                {group.toolCalls.map((toolCall, index) => (
                  <ToolComponent 
                    key={`${toolCall.tool_call_id || toolCall.tool_name}-${index}`} 
                    tools={{
                      tool_call_id: toolCall.tool_call_id || `tool-${index}`,
                      tool_name: toolCall.tool_name || 'unknown',
                      tool_args: toolCall.tool_args,
                      content: toolCall.content,
                      tool_call_error: toolCall.tool_call_error,
                      metrics: toolCall.metrics,
                      created_at: toolCall.created_at
                    }} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 🔄 Step 4: Backend-Frontend Integration

### 4.1 Enhanced Tool Call Processing

The key enhancement is in the backend's `handleAgentUiRequest` function that properly formats tool calls for the frontend:

```javascript
// Enhanced tool call processing with proper formatting
let processedMessages = [];

if (response.messages) {
    for (const msg of response.messages) {
        if (msg.role === 'assistant' && msg.tool_calls) {
            // Process assistant message with tool calls
            processedMessages.push({
                role: 'assistant',
                content: msg.content || '',
                created_at: Date.now(),
                tool_calls: msg.tool_calls.map(tc => ({
                    id: tc.id,
                    type: 'function',
                    function: {
                        name: tc.function.name,
                        arguments: tc.function.arguments
                    }
                }))
            });

            // Execute tools and format results for Agent UI
            for (const toolCall of msg.tool_calls) {
                try {
                    const startTime = Date.now();
                    const tool = allTools.find(t => t.name === toolCall.function.name);
                    
                    if (tool) {
                        const args = JSON.parse(toolCall.function.arguments);
                        const result = await tool.handler(args);
                        const executionTime = Date.now() - startTime;

                        // Format tool result for Agent UI with enhanced display data
                        processedMessages.push({
                            role: 'tool',
                            content: JSON.stringify(result, null, 2), // Properly formatted JSON
                            tool_call_id: toolCall.id,
                            tool_name: toolCall.function.name,
                            tool_args: args,
                            tool_call_error: false,
                            metrics: { time: executionTime },
                            created_at: Date.now()
                        });
                    }
                } catch (error) {
                    console.error('❌ Tool execution error:', error);
                    
                    // Format error result for Agent UI
                    processedMessages.push({
                        role: 'tool',
                        content: JSON.stringify({ 
                            error: error.message,
                            type: 'execution_error'
                        }, null, 2),
                        tool_call_id: toolCall.id,
                        tool_name: toolCall.function.name,
                        tool_call_error: true,
                        metrics: { time: 0 },
                        created_at: Date.now()
                    });
                }
            }
        } else {
            // Regular message without tool calls
            processedMessages.push({
                role: msg.role,
                content: msg.content || '',
                created_at: Date.now()
            });
        }
    }
}
```

### 4.2 Message Format Conversion

The backend includes utility functions to convert between Agent UI and Hustle message formats:

```javascript
// Utility function to convert Agent UI messages to Hustle format
function convertAgentUIToHustle(agentUIMessages) {
    return agentUIMessages.map(msg => {
        // Handle tool messages specially
        if (msg.role === 'tool') {
            return {
                role: 'tool',
                content: msg.content,
                tool_call_id: msg.tool_call_id
            };
        }
        
        // Standard message conversion
        return {
            role: msg.role,
            content: msg.content
        };
    });
}
```

## 🔄 Step 5: Running the Complete System

### 5.1 Start the Backend

```bash
# In the backend directory
npm run start:server
# or
node src/server.js
```

### 5.2 Start the Frontend

```bash
# In the frontend directory
cd my-cli-frontend
npm run dev
# or
pnpm dev
```

### 5.3 Test the Integration

1. Open `http://localhost:3000` in your browser
2. You should see the Agent UI interface
3. The UI should show "Enhanced CLI Backend" as connected
4. Try sending a message to test the integration

## 🛠️ Step 6: Key Integration Points

### 6.1 Message Flow

1. **User Input**: User types in Agent UI
2. **Frontend**: Sends POST to `/api/agentui/chat`
3. **Backend**: Processes with Hustle AI
4. **Tool Execution**: If tools needed, executes and formats results
5. **Response**: Returns formatted messages to Agent UI
6. **Display**: Agent UI renders conversation with tool calls

### 6.2 Critical Response Format

Agent UI expects messages in this format:

```javascript
{
  role: 'assistant' | 'user' | 'tool' | 'system',
  content: string,
  created_at: number, // Unix timestamp
  tool_calls?: [{
    id: string,
    type: 'function',
    function: {
      name: string,
      arguments: string // JSON string
    }
  }],
  tool_call_id?: string, // For tool result messages
  tool_name?: string     // For tool result messages
}
```

### 6.3 CORS Configuration

Essential for frontend-backend communication:

```javascript
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 📝 Step 7: Environment Variables

Create comprehensive `.env` file:

```env
# Hustle AI
HUSTLE_API_KEY=your_api_key_here
VAULT_ID=your_vault_id_here

# Server
MCP_PORT=8081
DEBUG=false

# External APIs (as needed)
BRAVE_API_KEY=your_brave_key
ORDISCAN_API_KEY=your_ordiscan_key

# MCP Servers
SMITHERY_API_KEY=your_smithery_key
```

## 🔍 Step 8: Testing and Debugging

### 8.1 Test Backend Health

```bash
curl http://localhost:8081/health
```

### 8.2 Test Chat Endpoint

```bash
curl -X POST http://localhost:8081/api/agentui/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test message"}'
```

### 8.3 Debug Mode

Set `DEBUG=true` in `.env` for detailed logging.

## 🚨 Common Issues and Solutions

### Issue 1: CORS Errors
**Solution**: Ensure CORS is properly configured with your frontend URL.

### Issue 2: Tool Calls Not Working
**Solution**: Check tool response format matches Agent UI expectations.

### Issue 3: Frontend Can't Connect
**Solution**: Verify backend is running on correct port and endpoint URLs match.

### Issue 4: Hustle AI Errors
**Solution**: Verify API key and vault ID are correct in `.env`.

## 📚 Additional Resources

- [Agent UI Documentation](https://github.com/agno-agi/agent-ui)
- [Hustle Incognito SDK](https://github.com/EmblemCompany/hustle-incognito)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 🎯 Next Steps

1. **Add More Tools**: Implement additional tools in `src/tools/`
2. **MCP Integration**: Connect to external MCP servers
3. **Streaming**: Implement real-time streaming responses
4. **Authentication**: Add user authentication if needed
5. **Deployment**: Deploy to production environment

---

This setup provides a powerful foundation for building AI-powered applications with modern UI and extensive tool capabilities. The modular architecture allows for easy extension and customization.

📖 