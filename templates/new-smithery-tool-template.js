/**
 * 🔧 New Smithery Tool Template
 * Copy this template and modify it to add any new Smithery tool
 */

// ============================================================================
// STEP 1: Update smithery-client.js
// ============================================================================
// Add your tool configuration to the TOOL_CONFIGS object:

/**
 * Example configuration:
 * 
 * const TOOL_CONFIGS = {
 *   'brave-search': 'https://server.smithery.ai/@smithery-ai/brave-search',
 *   'YOUR_TOOL_NAME': 'https://server.smithery.ai/@AUTHOR/TOOL_NAME', // Add this line
 * };
 */

// ============================================================================
// STEP 2: Add tool execution logic to server.js
// ============================================================================
// Add this case to the switch statement in /api/tools/call endpoint:

/**
 * Example tool execution case:
 * 
 * case 'YOUR_TOOL_NAME':
 * case 'your_tool_name': // Handle both naming conventions if needed
 *   if (smitheryConnected || await initializeSmithery()) {
 *     console.log(`Executing Smithery YOUR_TOOL_NAME with params:`, params);
 *     try {
 *       const smitheryResult = await smitheryClient.callTool('YOUR_TOOL_NAME', params);
 *       
 *       // 🔍 CUSTOMIZE THIS SECTION based on your tool's response format
 *       let parsedResult = {};
 *       if (smitheryResult.content && smitheryResult.content[0] && smitheryResult.content[0].text) {
 *         const text = smitheryResult.content[0].text;
 *         
 *         // Option A: For simple text responses
 *         parsedResult = {
 *           input: params,
 *           output: text,
 *           source: 'smithery'
 *         };
 *         
 *         // Option B: For structured data (uncomment and modify as needed)
 *         // parsedResult = {
 *         //   data: parseYourToolResponse(text), // Implement this function
 *         //   metadata: {
 *         //     tool: 'YOUR_TOOL_NAME',
 *         //     timestamp: new Date().toISOString(),
 *         //     params: params
 *         //   },
 *         //   source: 'smithery'
 *         // };
 *         
 *         // Option C: For search-like tools (uncomment and modify as needed)
 *         // const results = parseSearchResults(text); // Implement this function
 *         // parsedResult = {
 *         //   query: params.query,
 *         //   total: results.length,
 *         //   results: results,
 *         //   source: 'smithery'
 *         // };
 *       }
 *       
 *       result = parsedResult;
 *     } catch (error) {
 *       console.error('Error in Smithery YOUR_TOOL_NAME:', error);
 *       smitheryConnected = false;
 *       
 *       // Optional: Add local fallback if available
 *       // if (process.env.YOUR_TOOL_LOCAL_API_KEY) {
 *       //   console.log('Falling back to local YOUR_TOOL_NAME...');
 *       //   result = await executeLocalYourTool(params);
 *       // } else {
 *       //   throw new Error(`Smithery YOUR_TOOL_NAME failed: ${error.message}`);
 *       // }
 *       
 *       throw new Error(`Smithery YOUR_TOOL_NAME failed: ${error.message}`);
 *     }
 *   } else {
 *     throw new Error('YOUR_TOOL_NAME not available - no Smithery connection');
 *   }
 *   break;
 */

// ============================================================================
// STEP 3: Create custom parsing functions (if needed)
// ============================================================================
// Add these functions to src/utils/response-parsers.js or inline:

/**
 * Example parsing functions:
 * 
 * function parseYourToolResponse(text) {
 *   // Implement parsing logic based on your tool's output format
 *   // Examples:
 *   
 *   // For JSON-like responses:
 *   try {
 *     return JSON.parse(text);
 *   } catch (e) {
 *     // Handle non-JSON responses
 *     return { raw: text };
 *   }
 *   
 *   // For structured text responses:
 *   const lines = text.split('\n');
 *   const result = {};
 *   
 *   lines.forEach(line => {
 *     if (line.startsWith('Field: ')) {
 *       result.field = line.substring(7).trim();
 *     }
 *     // Add more parsing rules as needed
 *   });
 *   
 *   return result;
 * }
 * 
 * function parseSearchResults(text) {
 *   // For search-like tools, parse results similar to Brave Search
 *   const results = [];
 *   const blocks = text.split('\n\n').filter(block => block.trim());
 *   
 *   for (const block of blocks) {
 *     const lines = block.split('\n');
 *     let title = '', description = '', url = '';
 *     
 *     for (const line of lines) {
 *       if (line.startsWith('Title: ')) {
 *         title = line.substring(7).trim();
 *       } else if (line.startsWith('Description: ')) {
 *         description = line.substring(13).trim()
 *           .replace(/<[^>]*>/g, '') // Remove HTML tags
 *           .replace(/&quot;/g, '"')
 *           .replace(/&#x27;/g, "'")
 *           .replace(/&lt;/g, '<')
 *           .replace(/&gt;/g, '>')
 *           .replace(/&amp;/g, '&');
 *       } else if (line.startsWith('URL: ')) {
 *         url = line.substring(5).trim();
 *       }
 *     }
 *     
 *     if (title && url) {
 *       results.push({ title, description, url });
 *     }
 *   }
 *   
 *   return results;
 * }
 */

// ============================================================================
// STEP 4: Create a test script
// ============================================================================
// Create test-YOUR_TOOL_NAME.js:

/**
 * Example test script:
 * 
 * import axios from 'axios';
 * 
 * async function testYourTool() {
 *   try {
 *     console.log('Testing YOUR_TOOL_NAME...');
 *     
 *     const response = await axios.post('http://localhost:8081/api/tools/call', {
 *       name: 'YOUR_TOOL_NAME',
 *       params: {
 *         // Add your tool's required parameters here
 *         // Example:
 *         // query: 'test query',
 *         // option: 'value'
 *       }
 *     });
 *     
 *     console.log('✓ YOUR_TOOL_NAME test successful:');
 *     console.log(JSON.stringify(response.data, null, 2));
 *   } catch (error) {
 *     console.error('✗ YOUR_TOOL_NAME test failed:');
 *     console.error(error.response?.data || error.message);
 *   }
 * }
 * 
 * // Run the test
 * testYourTool();
 */

// ============================================================================
// STEP 5: Update CLI tool mapping (if needed)
// ============================================================================
// If your tool has different naming conventions, add to src/cli.js:

/**
 * Example CLI mapping:
 * 
 * const TOOL_NAME_MAPPING = {
 *   'cli-name': 'smithery-name',
 *   'your-cli-name': 'YOUR_TOOL_NAME', // Add this line
 * };
 */

// ============================================================================
// CHECKLIST
// ============================================================================
/**
 * Integration Checklist:
 * □ Added tool configuration to smithery-client.js
 * □ Added tool execution case to server.js
 * □ Implemented custom response parsing (if needed)
 * □ Created test script
 * □ Updated CLI tool mapping (if needed)
 * □ Tested the integration
 * □ Updated documentation
 */

// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Pattern 1: Simple text processing tool
const SIMPLE_TEXT_PATTERN = `
case 'text-processor':
  if (smitheryConnected || await initializeSmithery()) {
    try {
      const smitheryResult = await smitheryClient.callTool('text-processor', params);
      result = {
        input: params.text,
        processed: smitheryResult.content[0].text,
        source: 'smithery'
      };
    } catch (error) {
      // Error handling...
    }
  }
  break;
`;

// Pattern 2: Data analysis tool
const DATA_ANALYSIS_PATTERN = `
case 'data-analyzer':
  if (smitheryConnected || await initializeSmithery()) {
    try {
      const smitheryResult = await smitheryClient.callTool('data-analyzer', params);
      const analysis = parseAnalysisResult(smitheryResult.content[0].text);
      result = {
        dataset: params.data,
        analysis: analysis,
        insights: analysis.insights || [],
        source: 'smithery'
      };
    } catch (error) {
      // Error handling...
    }
  }
  break;
`;

// Pattern 3: API wrapper tool
const API_WRAPPER_PATTERN = `
case 'api-wrapper':
  if (smitheryConnected || await initializeSmithery()) {
    try {
      const smitheryResult = await smitheryClient.callTool('api-wrapper', params);
      const apiResponse = JSON.parse(smitheryResult.content[0].text);
      result = {
        endpoint: params.endpoint,
        response: apiResponse,
        status: 'success',
        source: 'smithery'
      };
    } catch (error) {
      // Error handling...
    }
  }
  break;
`;

export {
  SIMPLE_TEXT_PATTERN,
  DATA_ANALYSIS_PATTERN,
  API_WRAPPER_PATTERN
}; 