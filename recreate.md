# Recreating the Enhanced CLI with Agent UI Integration

This guide explains how to implement and integrate a powerful CLI backend with a modern Agent UI frontend, including MCP (Model Context Protocol) tools and Hustle AI integration.

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/WebSocket    ┌──────────────────────────────┐
│   Agent UI      │ ◄─────────────────► │     Enhanced CLI Server      │
│  (Next.js)      │   JSON Messages     │      (Express.js)            │
│  Port: 3000     │                     │      Port: 8081              │
└─────────────────┘                     └──────────────────────────────┘
                                                        │
                                        ┌───────────────┼───────────────┐
                                        │               │               │
                                   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
                                   │Hustle AI│    │MCP Tools│    │Local    │
                                   │Client   │    │(Smithery│    │Tools    │
                                   │         │    │etc.)    │    │         │
                                   └─────────┘    └─────────┘    └─────────┘
```

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- Git for version control
- Hustle AI API key and Vault ID
- Basic understanding of Express.js and Next.js

## 🚀 Step 1: Backend Setup (Enhanced CLI Server)

### 1.1 Initialize the Backend Project

```bash
mkdir enhanced-cli-backend
cd enhanced-cli-backend
npm init -y
```

### 1.2 Install Core Dependencies

```bash
npm install express cors dotenv hustle-incognito
npm install --save-dev nodemon
```

### 1.3 Create Environment Configuration

Create `.env` file:
```env
# Hustle AI Configuration
HUSTLE_API_KEY=your_hustle_api_key_here
VAULT_ID=your_vault_id_here

# Server Configuration
MCP_PORT=8081
DEBUG=false
```

### 1.4 Create the Core Server (`src/server.js`)

```javascript
const express = require('express');
const cors = require('cors');
const { HustleIncognitoClient } = require('hustle-incognito');
require('dotenv').config();

const app = express();
const PORT = process.env.MCP_PORT || 8081;

// Initialize Hustle AI client
const hustleClient = new HustleIncognitoClient({
    apiKey: process.env.HUSTLE_API_KEY,
    debug: process.env.DEBUG === 'true'
});

// CORS configuration for Agent UI
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Enhanced CLI Backend'
    });
});

// Agent UI Chat endpoint - This is the key integration point
app.post('/api/agentui/chat', async (req, res) => {
    try {
        const { message, sessionId, history } = req.body;
        console.log(`[AgentUI] Processing message: "${message}"`);

        const response = await handleAgentUiRequest(message, sessionId, history);
        res.json(response);
    } catch (error) {
        console.error('[AgentUI Error]:', error);
        res.status(500).json({
            role: 'assistant',
            content: `Sorry, an error occurred: ${error.message}`,
            created_at: Date.now()
        });
    }
});

// Playground API endpoints (required by Agent UI)
app.get('/v1/playground/status', (req, res) => {
    res.json({ status: 'active', agents: ['enhanced-cli'] });
});

app.get('/v1/playground/agents', (req, res) => {
    res.json([{
        id: 'enhanced-cli',
        name: 'Enhanced CLI Agent',
        description: 'AI agent with MCP tools and crypto capabilities',
        model: { provider: 'hustle', name: 'enhanced-cli' }
    }]);
});

app.post('/v1/playground/agents/:agent_id/runs', async (req, res) => {
    const { messages } = req.body;
    const lastMessage = messages[messages.length - 1];
    
    try {
        const response = await handleAgentUiRequest(lastMessage.content);
        res.json({ messages: [response] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Core message handling function
async function handleAgentUiRequest(userMessage, sessionId = null, history = []) {
    try {
        // Build conversation context
        const messages = [
            { role: 'system', content: 'You are an enhanced CLI assistant with access to various tools including crypto analysis, web search, and MCP integrations.' },
            ...history,
            { role: 'user', content: userMessage }
        ];

        // Call Hustle AI with proper format
        const aiResponse = await hustleClient.chat(messages, { 
            vaultId: process.env.VAULT_ID 
        });

        // Check if AI wants to use tools
        if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
            return await handleToolCalls(aiResponse, userMessage);
        }

        // Return simple text response
        return {
            role: 'assistant',
            content: aiResponse.content,
            created_at: Date.now()
        };

    } catch (error) {
        console.error('[Hustle AI Error]:', error);
        throw error;
    }
}

// Tool execution handler
async function handleToolCalls(aiResponse, originalMessage) {
    const toolResults = [];
    
    // Execute each tool call
    for (const toolCall of aiResponse.toolCalls) {
        try {
            const result = await executeLocalTool(toolCall.toolName, toolCall.args);
            toolResults.push({
                success: true,
                result: result,
                toolName: toolCall.toolName,
                toolCallId: toolCall.toolCallId
            });
        } catch (error) {
            toolResults.push({
                success: false,
                error: error.message,
                toolName: toolCall.toolName,
                toolCallId: toolCall.toolCallId
            });
        }
    }

    // Format response for Agent UI with tool results in content field
    const finalResponse = {
        role: 'assistant',
        content: aiResponse.content || 'I used some tools to help you.',
        created_at: Date.now()
    };

    // Add tool call information for Agent UI visualization
    finalResponse.tool_calls = toolResults.map((result, index) => ({
        role: 'tool',
        content: result.success ? JSON.stringify(result.result, null, 2) : JSON.stringify({ error: result.error }, null, 2),
        tool_call_id: `tool_${Date.now()}_${index}`,
        tool_name: result.toolName,
        tool_args: aiResponse.toolCalls[index]?.args || {},
        tool_call_error: !result.success,
        metrics: { time: 0 }, // TODO: Add actual execution time tracking
        created_at: Date.now()
    }));

    return finalResponse;
}

// Local tool execution (implement your tools here)
async function executeLocalTool(toolName, args) {
    switch (toolName) {
        case 'brave-search':
            return await require('./tools/brave-search')(args);
        case 'rugcheck':
            return await require('./tools/rugcheck')(args);
        case 'wallet-balance':
            return await require('./tools/wallet-balance')(args);
        // Add more tools as needed
        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

app.listen(PORT, () => {
    console.log(`🚀 Enhanced CLI Server running on port ${PORT}`);
    console.log(`📡 Agent UI can connect to: http://localhost:${PORT}`);
});
```

## 🎨 Step 2: Frontend Setup (Agent UI)

### 2.1 Create Agent UI Project

```bash
npx create-agent-ui@latest my-cli-frontend
cd my-cli-frontend
npm install
```

### 2.2 Configure Agent UI to Connect to Your Backend

Edit `src/store.ts` to point to your backend:

```typescript
// In src/store.ts, find the endpoint configuration
const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set, get) => ({
      // ... other config
      endpoint: 'http://localhost:8081', // Point to your CLI backend
      // ... rest of store
    }),
    {
      name: 'playground-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
```

### 2.3 Update API Client Configuration

In `src/api/cli-backend.ts`, ensure it points to your backend:

```typescript
const API_BASE_URL = 'http://localhost:8081';

export class CliBackendApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async sendMessage(message: string, sessionId?: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/agentui/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
```

## 🔧 Step 3: Tool Integration

### 3.1 Create Tool Directory Structure

```
src/
├── tools/
│   ├── index.js
│   ├── brave-search.js
│   ├── rugcheck.js
│   ├── wallet-balance.js
│   └── trending-tokens.js
└── utils/
    ├── mcp-client.js
    └── smithery-client.js
```

### 3.2 Example Tool Implementation (`src/tools/brave-search.js`)

```javascript
const axios = require('axios');

module.exports = async function braveSearch(args) {
    const { query, count = 5 } = args;
    
    try {
        // Implement your Brave Search API call here
        const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
            headers: {
                'X-Subscription-Token': process.env.BRAVE_API_KEY
            },
            params: {
                q: query,
                count: count
            }
        });

        return {
            success: true,
            results: response.data.web?.results || [],
            query: query
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            query: query
        };
    }
};
```

### 3.3 MCP Integration (`src/utils/mcp-client.js`)

```javascript
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');

class MCPClient {
    constructor() {
        this.clients = new Map();
    }

    async connectToServer(serverName, transport) {
        const client = new Client({
            name: `enhanced-cli-${serverName}`,
            version: "1.0.0"
        }, {
            capabilities: {
                tools: {}
            }
        });

        await client.connect(transport);
        this.clients.set(serverName, client);
        return client;
    }

    async callTool(serverName, toolName, args) {
        const client = this.clients.get(serverName);
        if (!client) {
            throw new Error(`No client connected for server: ${serverName}`);
        }

        return await client.callTool({
            name: toolName,
            arguments: args
        });
    }
}

module.exports = new MCPClient();
```

## 🔄 Step 4: Tool Result Display Implementation

### 4.1 Backend Tool Result Formatting

Update your backend's tool execution handler to properly format tool results for the frontend:

```javascript
// In src/server.js - Enhanced tool execution handler
async function handleToolCalls(aiResponse, originalMessage) {
    const toolResults = [];
    
    // Execute each tool call
    for (const toolCall of aiResponse.toolCalls) {
        try {
            const result = await executeLocalTool(toolCall.toolName, toolCall.args);
            toolResults.push({
                success: true,
                result: result,
                toolName: toolCall.toolName,
                toolCallId: toolCall.toolCallId
            });
        } catch (error) {
            toolResults.push({
                success: false,
                error: error.message,
                toolName: toolCall.toolName,
                toolCallId: toolCall.toolCallId
            });
        }
    }

    // Format response for Agent UI with tool results in content field
    const finalResponse = {
        role: 'assistant',
        content: aiResponse.content || 'I used some tools to help you.',
        created_at: Date.now()
    };

    // Add tool call information for Agent UI visualization
    finalResponse.tool_calls = toolResults.map((result, index) => ({
        role: 'tool',
        content: result.success ? JSON.stringify(result.result, null, 2) : JSON.stringify({ error: result.error }, null, 2),
        tool_call_id: `tool_${Date.now()}_${index}`,
        tool_name: result.toolName,
        tool_args: aiResponse.toolCalls[index]?.args || {},
        tool_call_error: !result.success,
        metrics: { time: 0 }, // TODO: Add actual execution time tracking
        created_at: Date.now()
    }));

    return finalResponse;
}
```

### 4.2 Frontend Tool Result Display Component

Create an enhanced tool display component in your Agent UI:

```typescript
// In my-cli-frontend/src/components/playground/ChatArea/Messages/Messages.tsx

const ToolComponent = memo(({ tools }: ToolCallProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Check if this tool call has results
  const hasResult = tools.content && tools.content.trim() !== ''
  const toolResult = hasResult ? tools.content : null
  
  // Parse tool result if it's a JSON string
  let parsedResult = null
  if (toolResult) {
    try {
      parsedResult = typeof toolResult === 'string' ? JSON.parse(toolResult) : toolResult
    } catch {
      parsedResult = toolResult
    }
  }
  
  // Determine if tool was successful
  const isSuccess = !tools.tool_call_error && (!parsedResult || !parsedResult.error)
  
  // Create summary for collapsed view
  const resultSummary = parsedResult ? 
    (typeof parsedResult === 'object' ? 
      `${Object.keys(parsedResult).length} properties` : 
      String(parsedResult).substring(0, 100) + '...') : 
    'No result'
  
  return (
    <div className="border border-border-primary rounded-lg p-4 bg-background-secondary">
      {/* Tool Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Icon
            type={isSuccess ? "check" : "x"}
            className={`rounded-lg p-1 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
            size="sm"
          />
          <div>
            <p className="font-medium text-primary">{tools.tool_name}</p>
            <p className="text-xs text-secondary">
              {isSuccess ? 'Success' : 'Failed'} • {resultSummary}
            </p>
          </div>
        </div>
        
        <Icon
          type={isExpanded ? "chevron-up" : "chevron-down"}
          size="sm"
          color="secondary"
        />
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Tool Arguments */}
          {tools.tool_args && Object.keys(tools.tool_args).length > 0 && (
            <div>
              <p className="text-sm font-medium text-secondary mb-2">Arguments:</p>
              <pre className="bg-background-tertiary p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(tools.tool_args, null, 2)}
              </pre>
            </div>
          )}

          {/* Tool Results */}
          {hasResult && (
            <div>
              <p className="text-sm font-medium text-secondary mb-2">
                {isSuccess ? 'Result:' : 'Error:'}
              </p>
              <pre className={`p-3 rounded text-xs overflow-x-auto ${
                isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {typeof parsedResult === 'object' ? 
                  JSON.stringify(parsedResult, null, 2) : 
                  String(parsedResult)
                }
              </pre>
            </div>
          )}

          {/* Execution Metrics */}
          {tools.metrics && (
            <div className="text-xs text-secondary">
              Execution time: {tools.metrics.time}ms
            </div>
          )}
        </div>
      )}
    </div>
  )
})
```

### 4.3 CLI Backend Message Conversion

Update the CLI backend adapter to handle tool results properly:

```typescript
// In my-cli-frontend/src/api/cli-backend.ts

export const convertCLIMessagesToAgentUI = (
  cliMessages: CLIBackendMessage[]
): PlaygroundChatMessage[] => {
  return cliMessages.map((msg) => {
    const agentUIMessage: PlaygroundChatMessage = {
      role: msg.role === 'assistant' ? 'agent' : msg.role,
      content: msg.content || '',
      created_at: msg.created_at,
      streamingError: false
    }

    // Handle tool calls - convert to Agent UI ToolCall format
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      agentUIMessage.tool_calls = msg.tool_calls.map(tc => {
        // Handle both OpenAI format and direct format
        if ('function' in tc && tc.function) {
          // OpenAI format
          let parsedArgs = {}
          try {
            parsedArgs = JSON.parse(tc.function.arguments)
          } catch {
            parsedArgs = {}
          }
          
          const convertedArgs: Record<string, string> = {}
          for (const [key, value] of Object.entries(parsedArgs)) {
            convertedArgs[key] = String(value)
          }
          
          return {
            role: 'tool' as const,
            content: '', // Will be filled by tool execution
            tool_call_id: tc.id,
            tool_name: tc.function.name,
            tool_args: convertedArgs,
            tool_call_error: false,
            metrics: { time: 0 },
            created_at: Date.now()
          }
        } else {
          // Direct format - extract properties safely
          const directTc = tc as unknown as Record<string, unknown>
          
          // Convert tool_args to Record<string, string>
          const toolArgs = directTc.tool_args as Record<string, unknown> || {}
          const convertedToolArgs: Record<string, string> = {}
          for (const [key, value] of Object.entries(toolArgs)) {
            convertedToolArgs[key] = String(value)
          }
          
          return {
            role: 'tool' as const,
            content: String(directTc.content || ''),
            tool_call_id: String(directTc.tool_call_id || directTc.id || ''),
            tool_name: String(directTc.tool_name || ''),
            tool_args: convertedToolArgs,
            tool_call_error: Boolean(directTc.tool_call_error),
            metrics: { time: Number(directTc.metrics?.time || 0) },
            created_at: Number(directTc.created_at || Date.now())
          }
        }
      })
    }

    return agentUIMessage
  })
}
```

### 4.4 Enhanced Tool Display in Messages

Update the Messages component to show tool calls in a dedicated section:

```typescript
// In my-cli-frontend/src/components/playground/ChatArea/Messages/Messages.tsx

// Add tool calls section after the main message content
{message.tool_calls && message.tool_calls.length > 0 && (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <Tooltip
        delayDuration={0}
        content={<p className="text-accent">Tool Calls</p>}
        side="top"
      >
        <Icon
          type="hammer"
          className="rounded-lg bg-background-secondary p-1"
          size="sm"
          color="secondary"
        />
      </Tooltip>
      <p className="text-xs uppercase text-secondary">Tools Used ({message.tool_calls.length})</p>
    </div>

    <div className="flex flex-col gap-3 pl-8">
      {message.tool_calls.map((toolCall, index) => (
        <ToolComponent key={`${toolCall.tool_call_id}-${index}`} tools={toolCall} />
      ))}
    </div>
  </div>
)}
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