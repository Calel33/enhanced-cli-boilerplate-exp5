# 🔄 Tool Flow Integration Guide

This guide documents the complete flow pattern used in our enhanced CLI boilerplate for seamless tool integration with AgentHustle AI. Follow this pattern to ensure any tool (Smithery or local) provides the same excellent user experience.

## 📋 Overview

Our tool integration follows a 6-step flow that ensures:
- **Automatic tool selection** (Smithery preferred, local fallback)
- **Transparent execution** with clear source indicators
- **Raw tool response display** for user visibility
- **AI-powered summarization** of results
- **Interactive follow-up** suggestions
- **Graceful error handling** with AI guidance

## 🔄 The Complete Flow

### Step 1: User Question → AgentHustle Tool Decision
```
User: "What are the latest developments in Solana?"
↓
AgentHustle: <tool>brave_web_search({query: "latest Solana developments", count: 5})</tool>
```

### Step 2: CLI Tool Call Detection & Mapping
```javascript
// In src/cli.js - parseToolCalls()
const toolCalls = parseToolCalls(response.content);
// Detects: <tool>brave_web_search(...)</tool>

// Smart tool mapping handles naming conventions
if (toolName === 'brave_web_search' || toolName === 'brave-search') {
  const smitheryTool = availableTools.find(t => t.name === 'brave_web_search');
  const localTool = availableTools.find(t => t.name === 'brave-search');
  mappedToolName = smitheryTool ? 'brave_web_search' : (localTool ? 'brave-search' : toolName);
}
```

### Step 3: Tool Execution with Source Indicator
```javascript
// Shows clear source indicator to user
const toolSource = (tool.source === 'smithery' || tool.source === 'ordiscan' || tool.source === 'stock-analysis') ? '🌐 Smithery' : '📦 Local';
console.log(chalk.blue(`\n🔧 Using ${toolCall.name} (${toolSource})...`));

// Collect all tool results first
const toolResults = [];
let hasErrors = false;

try {
  // Execute tool
  const toolResponse = await axios.post(`${MCP_SERVER_URL}/api/tools/call`, {
    name: toolCall.name,
    params: toolCall.arguments
  });
  
  if (toolResponse.data && toolResponse.data.success) {
    console.log(chalk.green('✅ Tool executed successfully'));
    
    // 3. Show brief result summary (customize based on your tool's output format)
    if (toolResponse.data.result) {
      const result = toolResponse.data.result;
      // Customize this section for your tool's specific output format
      if (result.query && result.results) {
        console.log(chalk.cyan(`📊 Found ${result.results.length} results for: "${result.query}"`));
      } else if (result.data) {
        console.log(chalk.cyan(`📈 Processed ${result.data.length} items`));
      } else if (result.response) {
        console.log(chalk.cyan(`💬 Response: ${result.response.substring(0, 100)}...`));
      }
    }
    
    // 4. Display the actual tool response data to the user
    console.log(chalk.white('\n📋 Tool Response Data:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    try {
      // Format and display the tool response in a readable way
      const formattedResult = JSON.stringify(toolResponse.data.result, null, 2);
      
      // Truncate very long responses for readability
      if (formattedResult.length > 2000) {
        const truncated = formattedResult.substring(0, 2000);
        console.log(chalk.white(truncated));
        console.log(chalk.yellow('\n... (response truncated for readability)'));
        console.log(chalk.gray(`Full response: ${formattedResult.length} characters`));
      } else {
        console.log(chalk.white(formattedResult));
      }
    } catch (jsonError) {
      // Fallback for non-JSON responses
      console.log(chalk.white(String(toolResponse.data.result)));
    }
    
    console.log(chalk.gray('─'.repeat(50)));
    
    // Collect successful result
    toolResults.push({
      toolName: toolCall.name,
      success: true,
      result: toolResponse.data.result
    });
  } else {
    console.log(chalk.red(`❌ Tool execution failed: ${toolResponse.data?.error || 'Unknown error'}`));
    hasErrors = true;
    
    // Collect error result
    toolResults.push({
      toolName: toolCall.name,
      success: false,
      error: toolResponse.data?.error || 'Unknown error'
    });
  }
} catch (error) {
  console.error(chalk.red(`❌ Error using ${toolCall.name}:`), error.message);
  hasErrors = true;
  
  // Collect error result
  toolResults.push({
    toolName: toolCall.name,
    success: false,
    error: error.message
  });
}

// 5. After ALL tools are executed, send single summarization request
if (toolResults.length > 0) {
  console.log(chalk.yellow('\n🤖 Asking Agent Hustle to analyze all results...'));
  
  let followUpPrompt;
  if (hasErrors) {
    // Handle mixed success/error results
    const successfulResults = toolResults.filter(r => r.success);
    const failedResults = toolResults.filter(r => !r.success);
    
    followUpPrompt = `I executed ${toolResults.length} tool(s) with the following results:

SUCCESSFUL TOOLS (${successfulResults.length}):
${successfulResults.map(r => `- ${r.toolName}: ${JSON.stringify(r.result, null, 2)}`).join('\n')}

FAILED TOOLS (${failedResults.length}):
${failedResults.map(r => `- ${r.toolName}: ${r.error}`).join('\n')}

Please summarize the successful results for the user, acknowledge any failures, and ask if they would like to do anything further with the data or try alternative approaches for the failed tools.`;
  } else {
    // All tools succeeded
    const resultsString = toolResults.map(r => 
      `${r.toolName} results: ${JSON.stringify(r.result, null, 2)}`
    ).join('\n\n');
    
    followUpPrompt = `I successfully executed ${toolResults.length} tool(s) and got the following results:

${resultsString}

Please summarize this data for the user and then ask if they would like to do anything further with it.`;
  }
  
  const summaryResponse = await client.chat([
    { role: 'user', content: followUpPrompt }
  ], { vaultId });
  
  // 5. Display AI summary and follow-up
  console.log(chalk.magentaBright('\n🤖 Agent Hustle Summary & Follow-up:'));
  console.log(summaryResponse.content);
}
```

## 🛠️ Implementation Template

### For Any New Tool Integration

```javascript
// 1. Tool Call Detection (add to parseToolCalls function)
if (toolName === 'your_tool_name' || toolName === 'your-tool-name') {
  const smitheryTool = availableTools.find(t => t.name === 'your_tool_name');
  const localTool = availableTools.find(t => t.name === 'your-tool-name');
  mappedToolName = smitheryTool ? 'your_tool_name' : (localTool ? 'your-tool-name' : toolName);
}

// 2. Tool Execution (add to handleChatMode function)
const toolSource = (tool.source === 'smithery' || tool.source === 'ordiscan' || tool.source === 'stock-analysis') ? '🌐 Smithery' : '📦 Local';
console.log(chalk.blue(`\n🔧 Using ${toolCall.name} (${toolSource})...`));

// Collect all tool results first
const toolResults = [];
let hasErrors = false;

try {
  // Execute tool
  const toolResponse = await axios.post(`${MCP_SERVER_URL}/api/tools/call`, {
    name: toolCall.name,
    params: toolCall.arguments
  });
  
  if (toolResponse.data && toolResponse.data.success) {
    console.log(chalk.green('✅ Tool executed successfully'));
    
    // 3. Show brief result summary (customize based on your tool's output)
    if (toolResponse.data.result) {
      const result = toolResponse.data.result;
      // Customize this section for your tool's specific output format
      if (result.query && result.results) {
        console.log(chalk.cyan(`📊 Found ${result.results.length} results for: "${result.query}"`));
      } else if (result.data) {
        console.log(chalk.cyan(`📈 Processed ${result.data.length} items`));
      } else if (result.response) {
        console.log(chalk.cyan(`💬 Response: ${result.response.substring(0, 100)}...`));
      }
    }
    
    // 4. Display the actual tool response data to the user
    console.log(chalk.white('\n📋 Tool Response Data:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    try {
      // Format and display the tool response in a readable way
      const formattedResult = JSON.stringify(toolResponse.data.result, null, 2);
      
      // Truncate very long responses for readability
      if (formattedResult.length > 2000) {
        const truncated = formattedResult.substring(0, 2000);
        console.log(chalk.white(truncated));
        console.log(chalk.yellow('\n... (response truncated for readability)'));
        console.log(chalk.gray(`Full response: ${formattedResult.length} characters`));
      } else {
        console.log(chalk.white(formattedResult));
      }
    } catch (jsonError) {
      // Fallback for non-JSON responses
      console.log(chalk.white(String(toolResponse.data.result)));
    }
    
    console.log(chalk.gray('─'.repeat(50)));
    
    // Collect successful result
    toolResults.push({
      toolName: toolCall.name,
      success: true,
      result: toolResponse.data.result
    });
  } else {
    console.log(chalk.red(`❌ Tool execution failed: ${toolResponse.data?.error || 'Unknown error'}`));
    hasErrors = true;
    
    // Collect error result
    toolResults.push({
      toolName: toolCall.name,
      success: false,
      error: toolResponse.data?.error || 'Unknown error'
    });
  }
} catch (error) {
  console.error(chalk.red(`❌ Error using ${toolCall.name}:`), error.message);
  hasErrors = true;
  
  // Collect error result
  toolResults.push({
    toolName: toolCall.name,
    success: false,
    error: error.message
  });
}

// 5. After ALL tools are executed, send single summarization request
if (toolResults.length > 0) {
  console.log(chalk.yellow('\n🤖 Asking Agent Hustle to analyze all results...'));
  
  let followUpPrompt;
  if (hasErrors) {
    // Handle mixed success/error results
    const successfulResults = toolResults.filter(r => r.success);
    const failedResults = toolResults.filter(r => !r.success);
    
    followUpPrompt = `I executed ${toolResults.length} tool(s) with the following results:

SUCCESSFUL TOOLS (${successfulResults.length}):
${successfulResults.map(r => `- ${r.toolName}: ${JSON.stringify(r.result, null, 2)}`).join('\n')}

FAILED TOOLS (${failedResults.length}):
${failedResults.map(r => `- ${r.toolName}: ${r.error}`).join('\n')}

Please summarize the successful results for the user, acknowledge any failures, and ask if they would like to do anything further with the data or try alternative approaches for the failed tools.`;
  } else {
    // All tools succeeded
    const resultsString = toolResults.map(r => 
      `${r.toolName} results: ${JSON.stringify(r.result, null, 2)}`
    ).join('\n\n');
    
    followUpPrompt = `I successfully executed ${toolResults.length} tool(s) and got the following results:

${resultsString}

Please summarize this data for the user and then ask if they would like to do anything further with it.`;
  }
  
  const summaryResponse = await client.chat([
    { role: 'user', content: followUpPrompt }
  ], { vaultId });
  
  // 5. Display AI summary and follow-up
  console.log(chalk.magentaBright('\n🤖 Agent Hustle Summary & Follow-up:'));
  console.log(summaryResponse.content);
}
```

## 📊 Tool-Specific Result Summary Examples

### Search Tools (like Brave Search)
```javascript
if (result.query && result.results) {
  console.log(chalk.cyan(`📊 Found ${result.results.length} results for: "${result.query}"`));
}
```

### Data Analysis Tools
```javascript
if (result.analysis && result.insights) {
  console.log(chalk.cyan(`📈 Analysis complete: ${result.insights.length} insights found`));
}
```

### Financial Tools
```javascript
if (result.symbol && result.price) {
  console.log(chalk.cyan(`💰 ${result.symbol}: $${result.price} (${result.change > 0 ? '+' : ''}${result.change}%)`));
}
```

### Weather Tools
```javascript
if (result.location && result.weather) {
  console.log(chalk.cyan(`🌤️ ${result.location}: ${result.weather.temperature}°F, ${result.weather.conditions}`));
}
```

### Text Processing Tools
```javascript
if (result.input && result.output) {
  console.log(chalk.cyan(`📝 Processed ${result.input.length} characters → ${result.output.length} characters`));
}
```

### Blockchain/Crypto Tools
```javascript
if (result.address && result.balance) {
  console.log(chalk.cyan(`🔗 Balance: ${result.balance} ${result.token || 'ETH'}`));
} else if (result.token && result.security_score) {
  console.log(chalk.cyan(`🛡️ Security Score: ${result.security_score}/100 for ${result.token}`));
}
```

## 🎯 Key Benefits of This Flow

### 1. **Seamless User Experience**
- User doesn't need to know which implementation is being used
- Consistent interface regardless of tool source
- Clear visual indicators for transparency
- **Raw tool data visibility** for complete transparency

### 2. **Intelligent Tool Selection**
- Automatically prefers Smithery (hosted, no API key management)
- Falls back to local implementations when needed
- Handles naming convention differences transparently

### 3. **AI-Powered Enhancement**
- AgentHustle provides intelligent summarization
- Contextual follow-up suggestions
- Natural conversation flow continuation

### 4. **Robust Error Handling**
- Graceful degradation when tools fail
- AI-powered error guidance and suggestions
- Clear error communication to users

### 5. **Extensible Architecture**
- Easy to add new tools following the same pattern
- Consistent behavior across all tool types
- Maintainable and scalable codebase

## 🔧 Implementation Checklist

When adding a new tool, ensure you implement:

- [ ] **Tool name mapping** in `parseToolCalls()` function
- [ ] **Source indicator** display (🌐 Smithery or 📦 Local)
- [ ] **Tool-specific result summary** for immediate feedback
- [ ] **Raw tool response display** for user visibility
- [ ] **AgentHustle summarization** with proper prompt formatting
- [ ] **Error handling** with AI guidance fallback
- [ ] **Consistent visual styling** using chalk colors
- [ ] **JSON result formatting** for AgentHustle analysis

## 📝 Best Practices

### 1. **Result Summary Guidelines**
- Keep summaries brief (1-2 lines max)
- Include key metrics or counts
- Use appropriate emojis for visual clarity
- Show the most important information first

### 2. **Tool Response Display**
- Always show the raw tool response to users
- Truncate very long responses (>2000 chars) for readability
- Use consistent formatting with separators
- Handle both JSON and non-JSON responses gracefully

### 3. **AgentHustle Prompt Format**
```javascript
const followUpPrompt = `The ${toolCall.name} tool has returned the following data based on the request:

\`\`\`json
${resultsString}
\`\`\`

Please summarize this data for the user and then ask if they would like to do anything further with it.`;
```

### 4. **Error Handling**
- Always provide AI guidance for errors
- Include specific error details in prompts
- Maintain conversation flow even during failures
- Suggest alternative approaches when possible

### 5. **Visual Consistency**
- Use `chalk.blue()` for tool execution messages
- Use `chalk.green()` for success indicators
- Use `chalk.cyan()` for result summaries
- Use `chalk.white()` for raw tool response data
- Use `chalk.gray()` for separators and metadata
- Use `chalk.magentaBright()` for AgentHustle responses
- Use `chalk.red()` for errors
- Use `chalk.yellow()` for processing messages

## 🎉 Conclusion

This enhanced 6-step flow pattern ensures that every tool integration provides:
- **Consistent user experience** across all tools
- **Complete transparency** with raw tool response visibility
- **Intelligent AI enhancement** of tool results
- **Graceful error handling** with helpful guidance
- **Clear visual feedback** throughout the process
- **Seamless conversation flow** with natural follow-ups

By following this pattern, any tool (whether Smithery-hosted or local) will integrate seamlessly into the CLI boilerplate and provide an excellent user experience powered by AgentHustle AI.

---

**Related Documentation:**
- [Smithery Integration Guide](SMITHERY_INTEGRATION_GUIDE.md) - How to add Smithery tools
- [Quick Reference](QUICK_REFERENCE.md) - 5-minute integration checklist
- [Tool Templates](templates/) - Copy-paste templates for quick integration
- [Examples](examples/) - Working examples of tool integrations