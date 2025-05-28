# Integrating Agent UI with Your Enhanced CLI

This tutorial guides you on how to use Agent UI, a modern chat interface, as a frontend for your Enhanced CLI application. This allows for a richer, visual interaction while retaining all the powerful features of your CLI, including its Model Context Protocol (MCP) integration and diverse toolset.

## Table of Contents

1.  [Introduction](#introduction)
    *   What is Agent UI?
    *   Benefits of using Agent UI with your CLI
2.  [Prerequisites](#prerequisites)
3.  [Core Concept: Connecting UI to CLI Backend](#core-concept)
4.  [Step 1: Setting Up Agent UI](#step-1-setting-up-agent-ui)
5.  [Step 2: Configuring Agent UI to Connect to Your CLI's Server](#step-2-configuring-agent-ui)
6.  [Step 3: Adapting Your CLI's `server.js` to Communicate with Agent UI](#step-3-adapting-server-js)
    *   Creating a new API endpoint for Agent UI
    *   Processing requests from Agent UI
    *   Formatting responses for Agent UI (Chat messages, Tool Calls, Errors)
    *   Reusing existing tool logic and MCP integrations
7.  [How Features are Maintained](#how-features-are-maintained)
    *   Chat Mode
    *   Tool Calls Visualization (Brave Search, Ordiscan, Stock Analysis, etc.)
    *   MCP Integrations (Smithery, local tools)
    *   Streaming Responses (Optional Enhancement)
8.  [Example: A Chat Interaction with Tool Call](#example-interaction)
9.  [Conclusion](#conclusion)

---

## 1. Introduction

### What is Agent UI?
Agent UI is a modern chat interface built with Next.js, Tailwind CSS, and TypeScript. As per its documentation, it's designed for interacting with AI agents and offers features like:
- Real-time message streaming
- Visualization of agent tool calls and their results
- Display of agent reasoning steps (if provided by the backend)
- Support for multi-modal content (images, video, audio)

### Benefits of using Agent UI with your CLI
Integrating Agent UI provides a graphical user interface for your powerful CLI, offering:
- **Enhanced User Experience**: A more intuitive and visual way to interact compared to a command-line interface.
- **Clearer Tool Usage**: See exactly which tools are being called by the AI, their inputs, and outputs.
- **Better Debugging/Understanding**: Visualize the agent's process, if your AI provides reasoning steps.
- **Accessibility**: Easier for users less comfortable with CLIs.
- **All Existing Power**: Retain all backend capabilities of your CLI, including complex tool chains and MCP integrations handled by `server.js`.

## 2. Prerequisites

- Your Enhanced CLI project is set up and running (ensure `npm run start:server` works and you understand its current API, e.g., `/api/tools/call`).
- You have Node.js and a package manager (npm or pnpm) installed.
- Familiarity with JavaScript/TypeScript and basic Express.js concepts will be helpful.
- Access to the Agent UI's source code, particularly its type definitions in `src/types/playground.ts` (e.g., `ModelMessage`, `ToolCall`), will be essential for formatting responses correctly.

## 3. Core Concept: Connecting UI to CLI Backend

The central idea is to use your existing `server.js` (which currently serves the `cli.js` and handles tool execution) as the "agent backend" for the Agent UI.

- Agent UI will send user messages via HTTP POST to a new endpoint you'll create in `server.js`.
- `server.js` will process these messages. This involves:
    - Interacting with the Hustle AI (using `hustle-incognito` or similar).
    - Managing any tool calls triggered by the AI (using your existing local tools, Smithery MCP tools, Ordiscan tools, etc.).
    - Formatting the AI's responses, tool call information, and tool results into a JSON structure that Agent UI can understand and display.

Essentially, Agent UI becomes the new "face" of your CLI, while `server.js` remains the "brain."

```
+-------------------+       HTTP POST        +---------------------------------------------+
|    Agent UI       | <--------------------> |                 server.js                   |
| (Next.js Frontend)|    (JSON Messages)     |  (Express.js - Your CLI's Backend Logic)    |
+-------------------+                        +---------------------------------------------+
                                                 |        |         |            |
                                                 |        |       Hustle AI    Smithery/MCP
                                                 |        |                      Tools
                                                 +--------+----------------------+
                                                 Local Tools (e.g. rugcheck)
```

## 4. Step 1: Setting Up Agent UI

Follow the Agent UI documentation to set up a new Agent UI project. Typically, this involves:

```bash
# Using the recommended automatic installation
npx create-agent-ui@latest my-cli-frontend
cd my-cli-frontend
pnpm install # or npm install / yarn install
# pnpm dev # or npm run dev / yarn dev
```
This will scaffold a new Next.js project that will serve as your CLI's frontend.

## 5. Step 2: Configuring Agent UI to Connect to Your CLI's Server

By default, Agent UI attempts to connect to `http://localhost:7777`. Your CLI's `server.js` runs on a port defined in your `.env` file (e.g., `MCP_PORT=8081` by default in `env.example`).

1.  **Start your CLI's server**:
    ```bash
    npm run start:server
    ```
    Make a note of the port it's running on (e.g., 8081).

2.  **Start the Agent UI development server**:
    ```bash
    cd my-cli-frontend
    pnpm dev # or your equivalent start script
    ```

3.  **Configure the Endpoint in Agent UI**:
    Open Agent UI in your browser (usually `http://localhost:3000`). The Agent UI documentation mentions: "You can easily change this by hovering over the endpoint URL and clicking the edit option."
    Change this URL to point to your `server.js` and the new endpoint you'll create (e.g., `http://localhost:8081/api/agentui/chat`).

## 6. Step 3: Adapting Your CLI's `server.js` to Communicate with Agent UI

This is the most critical part. Your `server.js` needs a new HTTP endpoint to:
1.  Receive chat messages from Agent UI.
2.  Orchestrate interactions with Hustle AI and your tools.
3.  Send back responses formatted according to Agent UI's expected data structures. Refer to Agent UI's `src/types/playground.ts` for `ModelMessage`, `ToolCall`, and other relevant interfaces.

### 6.1. Creating a new API endpoint for Agent UI

In your `enhanced-cli-boilerplate-exp5/src/server.js`, add a new Express route. This route will handle chat interactions from Agent UI.

```javascript
// In src/server.js, alongside other app.post(), app.get() routes

// ... (other imports and Express app setup)

// New endpoint for Agent UI
app.post('/api/agentui/chat', async (req, res) => {
    // Agent UI will likely send the user's message and possibly a session ID.
    // Adjust req.body destructuring based on what Agent UI actually sends.
    const { message, sessionId, history } = req.body; 

    console.log(`[AgentUI Interaction] Received message: "${message}" for session: ${sessionId}`);

    try {
        // This function will encapsulate the logic for getting AI responses
        // and handling tool calls, then formatting for Agent UI.
        const agentUiResponse = await handleAgentUiRequest(message, sessionId, history);
        
        res.json(agentUiResponse);
    } catch (error) {
        console.error('[AgentUI Chat Error] Failed to process request:', error);
        // Format a generic error message for Agent UI
        // Consult Agent UI's types for how it expects errors.
        res.status(500).json({
            role: 'assistant', // Or 'system'
            content: `Sorry, an error occurred on the server: ${error.message}`,
            created_at: Date.now(),
            // Potentially other fields Agent UI might expect for an error message
        });
    }
});

// You will need to implement this new handler function:
async function handleAgentUiRequest(userMessage, sessionId, history) {
    // 1. Interact with Hustle AI:
    //    - You'll likely use your existing Hustle AI client setup.
    //    - Pass the userMessage and potentially conversation history.
    //    - Example: const aiRawResponse = await hustleAiClient.chat({ message: userMessage, ... });

    // 2. Process AI Response and Handle Tools:
    //    - Your CLI's server.js already has sophisticated logic for parsing tool calls
    //      from the AI's response and executing them (local, Smithery/MCP).
    //    - REUSE THIS LOGIC. The primary change is how you package the *results* for Agent UI.

    //    Let's assume Hustle AI responds with text and potentially tool_calls.
    //    If aiRawResponse.tool_calls exist:
    //      a. Construct an "assistant" message for Agent UI indicating tool usage.
    //         This message should include the `tool_calls` array formatted as Agent UI expects.
    //         (See Agent UI's `ModelMessage` and `ToolCall` types).
    //      b. Execute the tools using your existing switch/case or lookup logic in server.js.
    //         Remember to await results.
    //      c. For each tool executed, construct a "tool" result message for Agent UI.
    //         This message should include `tool_call_id`, `tool_name`, and `content` (the tool's output).
    //      d. Optionally, send tool results back to Hustle AI for summarization.
    //      e. Construct the final "assistant" message with the summarized answer.
    //
    //    If no tool_calls, just format the AI's text response as an "assistant" message.

    // 3. Format for Agent UI:
    //    The function should return an object (or an array of message objects if streaming/multiple steps)
    //    that conforms to Agent UI's `ModelMessage` structure.

    // Placeholder for the actual implementation:
    // This is a simplified example. A real implementation would involve multiple steps
    // and potentially return an array of messages to show the "thought process" or tool calls.

    // Example: AI decides to call a tool
    if (userMessage.toLowerCase().includes("search for cats")) {
        const toolCallId = `tool-${Date.now()}`;
        return [ // Agent UI might expect an array of messages to render sequentially
            {
                role: 'assistant',
                content: "Okay, I will search for cats.",
                tool_calls: [{
                    id: toolCallId,
                    type: 'function', // Per Agent UI's types
                    function: {
                        name: 'brave-search', // Your tool name
                        arguments: JSON.stringify({ query: "images of cats" })
                    }
                }],
                created_at: Date.now(),
            },
            // Your server would then execute brave-search.
            // After execution, it would send the tool result:
            {
                role: 'tool',
                tool_call_id: toolCallId,
                tool_name: 'brave-search',
                content: JSON.stringify([{title: "Cute Cat", url: "..."}]), // Actual tool output
                created_at: Date.now() + 1000, // Simulate time passing
            },
            // Then, a final response from the assistant after processing the tool result:
            {
                role: 'assistant',
                content: "I found some images of cats for you!",
                created_at: Date.now() + 2000,
            }
        ];
    }
    
    // Simple text response
    return {
        role: 'assistant',
        content: `Your CLI backend received: "${userMessage}". I am responding now!`,
        created_at: Date.now(),
        // tool_calls: null, // Explicitly null if no tools called
    };
}
```

### 6.2. Processing requests from Agent UI
Agent UI will `POST` a JSON payload to your `/api/agentui/chat` endpoint. The `req.body` in your Express handler will contain this payload. You'll typically expect `message` (the user's input) and potentially `sessionId` or `history` for context.

### 6.3. Formatting responses for Agent UI
This is paramount. Agent UI's frontend components (like those in `src/components/playground/ChatArea/Messages/`) will expect data in a specific format.
- **Consult Agent UI's `src/types/playground.ts`**: This file is your source of truth. Look for interfaces like `ModelMessage`, `ToolCall`, and `ReasoningSteps`.
- **Basic Message (`ModelMessage`)**:
    ```typescript
    // Simplified from a typical Agent UI's playground.ts
    export interface ModelMessage {
      role: 'user' | 'assistant' | 'system' | 'tool';
      content: string | null;
      created_at: number; // Unix timestamp (milliseconds)
      tool_calls?: Array<{ // If the assistant decided to call tools
        id: string; // A unique ID for this tool call instance
        type: string; // Usually 'function'
        function: {
          name: string; // Name of your tool (e.g., 'brave-search', 'ordiscan_brc20_info')
          arguments: string; // JSON string of arguments for the tool
        };
      }> | null;
      tool_call_id?: string; // If this message IS A TOOL RESULT, this links to tool_calls.id
      tool_name?: string; // If this message IS A TOOL RESULT, the name of the tool
      // Potentially other fields: metrics, name, context, etc.
    }
    ```
- **Responding to Agent UI**: Your `/api/agentui/chat` endpoint should `res.json()` an object matching `ModelMessage`, or an array of `ModelMessage` objects if the interaction involves multiple steps (e.g., AI thinking -> tool call -> tool result -> final AI response).

### 6.4. Reusing existing tool logic and MCP integrations
Your `server.js` already contains robust logic for:
- Parsing tool call requests from Hustle AI.
- A `switch` statement or similar mechanism to route to the correct tool function.
- Functions for calling local tools (e.g., `rugcheck.js`).
- Functions for calling Smithery/MCP tools via `smithery-client.js` and `mcp-client.js`.

**You do not need to rewrite this core tool execution logic.** Instead, your new `handleAgentUiRequest` function will:
1.  Call Hustle AI.
2.  If Hustle AI indicates a tool call, extract the tool name and arguments.
3.  **Signal the tool call to Agent UI**: Send a `ModelMessage` with `role: 'assistant'` and a populated `tool_calls` array.
4.  **Execute the tool**: Call your existing tool execution functions (e.g., `smitheryClient.callTool(...)`, or your local tool functions).
5.  **Signal the tool result to Agent UI**: Send a `ModelMessage` with `role: 'tool'`, the `tool_call_id`, `tool_name`, and the `content` being the tool's actual output (often a JSON string).
6.  Optionally, send this raw tool output back to Hustle AI for summarization, then send that summary as a final `role: 'assistant'` message.

## 7. How Features are Maintained

### Chat Mode
- User types in Agent UI.
- Agent UI POSTs to `/api/agentui/chat` on your `server.js`.
- `server.js`'s `handleAgentUiRequest` uses Hustle AI and formats the response.
- Agent UI displays the chat.

### Tool Calls Visualization
- When Hustle AI (via `server.js`) decides to use a tool:
    - `server.js` formats its response to Agent UI to include the `tool_calls` array in an "assistant" message.
    - Agent UI is built to recognize this structure and can visually represent that a tool is being called (e.g., "Using tool: `brave-search`...").
    - After `server.js` executes the tool, it sends another message with `role: 'tool'` and the `content` being the tool's output. Agent UI will display this result, typically associated with the specific tool call.
- All your existing tools (Brave Search, Ordiscan, Stock Analysis, custom tools) can be visualized this way.

### MCP Integrations
- The MCP communication (e.g., `smitheryClient.callTool` in `src/utils/smithery-client.js`, or direct MCP calls via `mcp-client.js`) is handled entirely within `server.js`.
- Agent UI is oblivious to the specifics of MCP; it only cares about the structured data (tool calls, tool results) it receives from `server.js`. Your MCP integrations are fully preserved and utilized.

### Streaming Responses (Optional Enhancement)
- Agent UI supports real-time streaming. Your CLI also has a "stream" mode.
- To enable full streaming in Agent UI, `server.js`'s `/api/agentui/chat` endpoint would need to support a streaming protocol like Server-Sent Events (SSE).
- Instead of `res.json()`, you would write event streams. Each event would be a `ModelMessage` chunk.
- This is more advanced but provides the best UX. Your current `handleAgentUiRequest` can be adapted to `async* function*` (async generator) to `yield` messages as they become available.

## 8. Example: A Chat Interaction with Tool Call

1.  **User in Agent UI types**: "What is the BRC-20 balance for address `bc1p...?`"
2.  **Agent UI `POSTS` to `http://localhost:8081/api/agentui/chat`**:
    ```json
    { "message": "What is the BRC-20 balance for address bc1p...?", "sessionId": "s123" }
    ```
3.  **`server.js` (`handleAgentUiRequest`)**:
    *   Sends query to Hustle AI.
    *   Hustle AI responds, intending to call `ordiscan_address_brc20`.
    *   `server.js` sends a message to Agent UI (or the first part of a message array):
        ```json
        {
            "role": "assistant",
            "content": "Let me check the BRC-20 balance for that Bitcoin address...",
            "tool_calls": [{
                "id": "tool_call_abc123",
                "type": "function",
                "function": { "name": "ordiscan_address_brc20", "arguments": "{\"address\":\"bc1p...\"}" }
            }],
            "created_at": 1678886400000 
        }
        ```
    *   Agent UI displays "Let me check..." and might show a "Using tool: `ordiscan_address_brc20`" indicator.
4.  **`server.js` executes `ordiscan_address_brc20("bc1p...")`** using its existing Smithery/MCP logic.
    *   Gets the result, e.g., `[{ "ticker": "ordi", "overall_balance": "10.5" }]`.
5.  **`server.js` sends the tool result message to Agent UI** (second part of message array or a separate streamed message):
    ```json
    {
        "role": "tool",
        "tool_call_id": "tool_call_abc123", 
        "tool_name": "ordiscan_address_brc20",
        "content": "[{\"ticker\":\"ordi\",\"overall_balance\":\"10.5\"}]", // Tool output stringified
        "created_at": 1678886401000
    }
    ```
6.  **Agent UI displays the raw tool output (or can be styled to parse it).**
7.  **`server.js` (optionally) sends the tool result back to Hustle AI for a natural language summary.**
    *   Hustle AI responds: "The address `bc1p...` holds 10.5 ORDI tokens."
8.  **`server.js` sends the final assistant message to Agent UI** (third part of message array or final streamed message):
    ```json
    {
        "role": "assistant",
        "content": "The address bc1p... holds 10.5 ORDI tokens.",
        "created_at": 1678886402000
    }
    ```
9.  **Agent UI displays the final answer.**

## 9. Conclusion

By adapting your `server.js` to expose a new API endpoint and format messages according to Agent UI's expectations (chiefly its `ModelMessage` and `ToolCall` structures), you can seamlessly integrate this modern, visual frontend with your powerful CLI backend. This approach preserves all your existing backend logic, tool integrations (including Ordiscan, Brave Search, Stock Analysis), and MCP capabilities while significantly enhancing the user experience.

The key to success is a careful study of Agent UI's data structures (found in its `src/types/playground.ts`) and thoughtful adaptation of your `server.js` to produce responses in that format. 