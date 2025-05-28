# 🚀 Quick Reference: Adding Smithery Tools

## 5-Minute Integration Checklist

### ✅ Step 1: Find Your Tool
- Visit [smithery.ai](https://smithery.ai)
- Note the tool name and URL format

### ✅ Step 2: Configure Tool
Add to `src/utils/smithery-client.js`:
```javascript
const TOOL_CONFIGS = {
  'brave-search': 'https://server.smithery.ai/@smithery-ai/brave-search',
  'YOUR_TOOL': 'https://server.smithery.ai/@AUTHOR/TOOL_NAME', // Add this
};
```

### ✅ Step 3: Add Execution Logic
Add to `src/server.js` switch statement:
```javascript
case 'YOUR_TOOL':
  if (smitheryConnected || await initializeSmithery()) {
    try {
      const smitheryResult = await smitheryClient.callTool('YOUR_TOOL', params);
      result = {
        data: smitheryResult.content[0].text,
        source: 'smithery'
      };
    } catch (error) {
      console.error('Error:', error);
      throw new Error(`Tool failed: ${error.message}`);
    }
  }
  break;
```

### ✅ Step 4: Test
Create `test-YOUR_TOOL.js`:
```javascript
import axios from 'axios';

async function test() {
  const response = await axios.post('http://localhost:8081/api/tools/call', {
    name: 'YOUR_TOOL',
    params: { /* your params */ }
  });
  console.log(response.data);
}

test();
```

### ✅ Step 5: Run Test
```bash
node test-YOUR_TOOL.js
```

## 📋 Common Patterns

### Text Processing Tool
```javascript
result = {
  input: params.text,
  output: smitheryResult.content[0].text,
  source: 'smithery'
};
```

### Search Tool
```javascript
const results = parseSearchResults(smitheryResult.content[0].text);
result = {
  query: params.query,
  results: results,
  total: results.length,
  source: 'smithery'
};
```

### Data Analysis Tool
```javascript
const analysis = JSON.parse(smitheryResult.content[0].text);
result = {
  data: params.data,
  analysis: analysis,
  insights: analysis.insights || [],
  source: 'smithery'
};
```

## 🔧 Need Help?

- **Full Guide**: [SMITHERY_INTEGRATION_GUIDE.md](SMITHERY_INTEGRATION_GUIDE.md)
- **Template**: [templates/new-smithery-tool-template.js](templates/new-smithery-tool-template.js)
- **Example**: [examples/add-weather-tool-example.js](examples/add-weather-tool-example.js)

## 🎯 Pro Tips

1. **Copy the Brave Search pattern** - it works for most tools
2. **Test early and often** - create test scripts for each tool
3. **Handle errors gracefully** - always include try/catch blocks
4. **Parse responses carefully** - each tool may have different output formats
5. **Use consistent naming** - follow the existing naming conventions

---

**That's it!** 🎉 Your new Smithery tool should now work seamlessly with your CLI boilerplate. 