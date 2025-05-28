# 🔧 Smithery Tool Integration Guide

This guide will walk you through adding any Smithery tool to your enhanced CLI boilerplate project. We'll use the same pattern that was successfully implemented for Brave Search.

## 📋 Prerequisites

Before adding Smithery tools, ensure you have:

1. **Smithery API credentials** configured in your `.env` file:
   ```env
   SMITHERY_API_KEY=your_smithery_api_key_here
   SMITHERY_PROFILE=your_smithery_profile_here
   ```

2. **Project dependencies** installed:
   ```bash
   npm install
   ```

## 🎯 Quick Start: Adding Any Smithery Tool

### Step 1: Find Your Tool on Smithery

1. Visit [https://smithery.ai/](https://smithery.ai/)
2. Browse or search for the tool you want to integrate
3. Note the tool's **exact name** and **base URL**
4. Check the tool's **input schema** (parameters it accepts)

### Step 2: Update Smithery Client Configuration

Open `src/utils/smithery-client.js` and add your new tool's base URL:

```javascript
// Add your new tool configuration
const TOOL_CONFIGS = {
  'brave-search': 'https://server.smithery.ai/@smithery-ai/brave-search',
  'your-new-tool': 'https://server.smithery.ai/@author/tool-name', // Add this line
  // Add more tools as needed
};
```

### Step 3: Add Tool to Server Configuration

In `src/server.js`, locate the tools list section and add your new tool:

```javascript
// In the /api/tools/list endpoint, add your tool to the tools array
if (smitheryConnected && smitheryClient.isAvailable()) {
  try {
    const smitheryTools = await smitheryClient.listTools();
    smitheryTools.forEach(tool => {
      tools.push({
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
        source: 'smithery'
      });
    });
  } catch (error) {
    // Error handling...
  }
}
```

### Step 4: Add Tool Execution Logic

In the same `src/server.js` file, add a case for your new tool in the `/api/tools/call` endpoint:

```javascript
// In src/server.js, add to the switch statement
case 'your-tool-name': // Use the exact tool name from Smithery
  if (smitheryConnected || await initializeSmithery()) {
    console.log(`Executing Smithery ${toolName} with params:`, params);
    try {
      const smitheryResult = await smitheryClient.callTool('your-tool-name', params);
      
      // Parse the result based on your tool's output format
      result = {
        // Format the result according to your tool's response
        data: smitheryResult.content,
        source: 'smithery'
      };
    } catch (error) {
      console.error(`Error in Smithery ${toolName}:`, error);
      smitheryConnected = false;
      throw new Error(`Smithery ${toolName} failed: ${error.message}`);
    }
  } else {
    throw new Error(`${toolName} not available - no Smithery connection`);
  }
  break;
```

### Step 5: Update CLI Tool Mapping (Optional)

If your tool has different naming conventions, update `src/cli.js`:

```javascript
// Add tool name mapping if needed
const TOOL_NAME_MAPPING = {
  'cli-name': 'smithery-name',
  'your-cli-name': 'your-smithery-name', // Add this line
  // Add more mappings as needed
};
```

## 📚 Detailed Example: Adding a Weather Tool

Let's walk through a complete example of adding a hypothetical weather tool from Smithery.

### 1. Tool Discovery
- **Tool Name**: `weather-forecast`
- **Base URL**: `https://server.smithery.ai/@weather/forecast`
- **Parameters**: `{ location: string, days?: number }`

### 2. Update Smithery Client

```javascript
// In src/utils/smithery-client.js
const TOOL_CONFIGS = {
  'brave-search': 'https://server.smithery.ai/@smithery-ai/brave-search',
  'weather-forecast': 'https://server.smithery.ai/@weather/forecast', // New tool
};
```

### 3. Add Tool Execution

```javascript
// In src/server.js, add to the switch statement
case 'weather-forecast':
case 'weather_forecast': // Handle both naming conventions
  if (smitheryConnected || await initializeSmithery()) {
    console.log(`Executing Smithery weather forecast for location: ${params.location}`);
    try {
      const smitheryResult = await smitheryClient.callTool('weather_forecast', params);
      
      // Parse weather data (adjust based on actual response format)
      let weatherData = {};
      if (smitheryResult.content && smitheryResult.content[0] && smitheryResult.content[0].text) {
        const text = smitheryResult.content[0].text;
        // Parse the weather response format
        weatherData = {
          location: params.location,
          forecast: text,
          days: params.days || 5
        };
      }
      
      result = {
        location: params.location,
        weather: weatherData,
        source: 'smithery'
      };
    } catch (error) {
      console.error('Error in Smithery weather forecast:', error);
      smitheryConnected = false;
      throw new Error('Smithery Weather Forecast failed: ${error.message}');
    }
  } else {
    throw new Error('Weather Forecast not available - no Smithery connection');
  }
  break;
```

### 4. Test Your Integration

Create a test script to verify your tool works:

```javascript
// test-weather.js
import axios from 'axios';

async function testWeatherTool() {
  try {
    const response = await axios.post('http://localhost:8081/api/tools/call', {
      name: 'weather-forecast',
      params: {
        location: 'New York',
        days: 3
      }
    });
    
    console.log('Weather forecast result:', response.data);
  } catch (error) {
    console.error('Error testing weather tool:', error.response?.data || error.message);
  }
}

testWeatherTool();
```

## 🔍 Common Tool Types and Patterns

### Text Processing Tools
```javascript
// For tools that return formatted text
result = {
  input: params.text,
  output: smitheryResult.content[0].text,
  source: 'smithery'
};
```

### Data Analysis Tools
```javascript
// For tools that return structured data
let parsedData = [];
if (smitheryResult.content && smitheryResult.content[0]) {
  const text = smitheryResult.content[0].text;
  // Parse based on tool's output format (JSON, CSV, etc.)
  parsedData = parseToolOutput(text);
}

result = {
  analysis: parsedData,
  metadata: {
    tool: toolName,
    timestamp: new Date().toISOString()
  },
  source: 'smithery'
};
```

### Search/Query Tools
```javascript
// For search-like tools (similar to Brave Search)
let searchResults = [];
if (smitheryResult.content && smitheryResult.content[0]) {
  const text = smitheryResult.content[0].text;
  searchResults = parseSearchResults(text);
}

result = {
  query: params.query,
  total: searchResults.length,
  results: searchResults,
  source: 'smithery'
};
```

## 🛠️ Advanced Configuration

### Multiple Tool Instances

If you need multiple instances of the same tool type:

```javascript
// In smithery-client.js
const TOOL_CONFIGS = {
  'weather-current': 'https://server.smithery.ai/@weather/current',
  'weather-forecast': 'https://server.smithery.ai/@weather/forecast',
  'weather-historical': 'https://server.smithery.ai/@weather/historical',
};
```

### Custom Response Parsing

Create helper functions for complex response parsing:

```javascript
// In src/utils/response-parsers.js
export function parseWeatherResponse(text) {
  // Custom parsing logic for weather data
  const lines = text.split('\n');
  return {
    temperature: extractTemperature(lines),
    conditions: extractConditions(lines),
    forecast: extractForecast(lines)
  };
}

export function parseFinancialData(text) {
  // Custom parsing for financial tools
  // Implementation depends on tool's output format
}
```

### Error Handling and Fallbacks

```javascript
case 'your-tool-name':
  if (smitheryConnected || await initializeSmithery()) {
    try {
      const smitheryResult = await smitheryClient.callTool('your-tool-name', params);
      result = processToolResult(smitheryResult);
    } catch (error) {
      console.error(`Error in Smithery ${toolName}:`, error);
      smitheryConnected = false;
      
      // Optional: Implement local fallback
      if (hasLocalFallback(toolName)) {
        console.log(`Falling back to local ${toolName}...`);
        result = await executeLocalFallback(toolName, params);
      } else {
        throw new Error(`Smithery ${toolName} failed: ${error.message}`);
      }
    }
  } else {
    throw new Error(`${toolName} not available - no Smithery connection`);
  }
  break;
```

## 🧪 Testing Your Integration

### 1. Unit Testing

```javascript
// test/smithery-tools.test.js
import { SmitheryClient } from '../src/utils/smithery-client.js';

describe('Smithery Tool Integration', () => {
  test('should connect to new tool', async () => {
    const client = new SmitheryClient({
      baseUrl: 'https://server.smithery.ai/@author/tool-name',
      apiKey: process.env.SMITHERY_API_KEY,
      profile: process.env.SMITHERY_PROFILE
    });
    
    const success = await client.initialize();
    expect(success).toBe(true);
  });
  
  test('should execute tool with valid parameters', async () => {
    // Test implementation
  });
});
```

### 2. Integration Testing

```javascript
// test-integration.js
async function testAllTools() {
  const tools = ['brave_web_search', 'your-new-tool'];
  
  for (const tool of tools) {
    try {
      const response = await axios.post('http://localhost:8081/api/tools/call', {
        name: tool,
        params: getTestParams(tool)
      });
      console.log(`✓ ${tool}: Success`);
    } catch (error) {
      console.log(`✗ ${tool}: Failed - ${error.message}`);
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Tool Not Found**
   - Verify the tool name matches exactly
   - Check the base URL is correct
   - Ensure Smithery credentials are valid

2. **Connection Errors**
   - Check internet connectivity
   - Verify Smithery API key and profile
   - Check if the tool is available on Smithery

3. **Parsing Errors**
   - Log the raw response to understand the format
   - Adjust parsing logic based on actual output
   - Handle edge cases (empty responses, errors)

### Debug Mode

Enable debug logging in your Smithery client:

```javascript
const smitheryClient = new SmitheryClient({
  baseUrl: 'your-tool-url',
  apiKey: process.env.SMITHERY_API_KEY,
  profile: process.env.SMITHERY_PROFILE,
  debug: true // Enable debug logging
});
```

## 📝 Best Practices

1. **Always handle errors gracefully**
2. **Implement proper response parsing for each tool type**
3. **Add comprehensive logging for debugging**
4. **Test tools individually before integration**
5. **Document tool-specific parameters and responses**
6. **Consider implementing local fallbacks where possible**
7. **Use consistent naming conventions**
8. **Validate input parameters before calling tools**

## 🎉 Conclusion

You now have everything you need to integrate any Smithery tool into your CLI boilerplate! The pattern is consistent:

1. **Configure** the tool in smithery-client.js
2. **Add** tool execution logic in server.js
3. **Test** the integration
4. **Document** any special requirements

Happy coding! 🚀

---

**Need Help?** 
- Check the existing Brave Search implementation as a reference
- Review the Smithery documentation at [smithery.ai](https://smithery.ai)
- Test with the provided test scripts 