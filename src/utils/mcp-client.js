// MCP Client utility for interacting with the MCP server
import axios from 'axios';

export class MCPClient {
  constructor(config) {
    this.serverUrl = config.serverUrl;
    this.axios = axios.create({
      baseURL: this.serverUrl,
      timeout: 30000
    });
  }

  /**
   * List all available tools from the MCP server
   * @returns {Promise<Array>} List of available tools
   */
  async listTools() {
    try {
      const response = await this.axios.post('/api/tools/list');
      return response.data.tools || [];
    } catch (error) {
      throw new Error(`Failed to list tools: ${error.message}`);
    }
  }

  /**
   * Call a specific tool with parameters
   * @param {string} toolName - Name of the tool to call
   * @param {Object} params - Tool parameters
   * @returns {Promise<any>} Tool execution result
   */
  async callTool(toolName, params) {
    try {
      const response = await this.axios.post('/api/tools/call', {
        name: toolName,
        params
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to call tool ${toolName}: ${error.message}`);
    }
  }

  /**
   * Check if the MCP server is available
   * @returns {Promise<boolean>} True if server is available
   */
  async isAvailable() {
    try {
      await this.axios.get('/health');
      return true;
    } catch {
      return false;
    }
  }
} 