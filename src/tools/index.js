// Tools setup and initialization
import { BraveSearchTool } from './brave-search.js';
import { RugcheckTool } from './rugcheck.js';
import { WalletBalanceTool } from './wallet-balance.js';
import { TrendingTokensTool } from './trending-tokens.js';

/**
 * Setup and initialize all available tools
 * @param {MCPClient} mcpClient - MCP client instance
 * @returns {Promise<Array>} List of initialized tools
 */
export async function setupTools(mcpClient) {
  // Check MCP server availability
  const isServerAvailable = await mcpClient.isAvailable();
  if (!isServerAvailable) {
    throw new Error('MCP server is not available');
  }

  // Initialize tool instances with their canonical names
  const tools = [
    { instance: new BraveSearchTool(), name: 'brave-search' },
    { instance: new RugcheckTool(), name: 'rugcheck' },
    { instance: new WalletBalanceTool(), name: 'wallet-balance' },
    { instance: new TrendingTokensTool(), name: 'trending-tokens' }
  ];

  try {
    // Fetch tool configurations from server
    const serverTools = await mcpClient.listTools();

    // Map server configurations to tool instances
    return tools
      .map(tool => {
        const serverTool = serverTools.find(t => t.name === tool.name);
        if (serverTool) {
          return {
            ...tool.instance,
            ...serverTool,
            name: tool.name, // Ensure the name is preserved
            isAvailable: () => true // Mark as available if we found a server match
          };
        }
        return null;
      })
      .filter(Boolean); // Remove any tools that weren't found on the server
  } catch (error) {
    console.error('Error setting up tools:', error);
    return []; // Return empty array if tool setup fails
  }
} 