// Smithery MCP client utility
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createTransport } from '@smithery/sdk/client/transport.js';

export class SmitheryClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.profile = config.profile;
    this._isAvailable = true; // Assume available if credentials are provided
  }

  /**
   * Create a fresh transport and client for each request (stateless)
   * @returns {Promise<{client: Client, transport: Transport}>} Fresh client and transport
   */
  async createFreshConnection() {
    try {
      // Create fresh transport for this request
      const transport = createTransport(this.baseUrl, {
        apiKey: this.apiKey,
        profile: this.profile
      });

      // Create fresh MCP client
      const client = new Client({
        name: 'enhanced-cli-client',
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      // Connect to the transport
      await client.connect(transport);
      
      return { client, transport };
    } catch (error) {
      console.error('Failed to create Smithery connection:', error.message);
      throw error;
    }
  }

  /**
   * Initialize the Smithery client (just validate credentials)
   * @returns {Promise<boolean>} True if credentials are valid
   */
  async initialize() {
    try {
      // Test connection by trying to list tools
      const { client, transport } = await this.createFreshConnection();
      
      try {
        await client.listTools();
        console.log('✓ Connected to Smithery MCP server');
        this._isAvailable = true;
        return true;
      } finally {
        // Always clean up the test connection
        try {
          await client.close();
        } catch (closeError) {
          // Ignore close errors
        }
      }
    } catch (error) {
      console.error('Failed to connect to Smithery:', error.message);
      this._isAvailable = false;
      return false;
    }
  }

  /**
   * List available tools from Smithery
   * @returns {Promise<Array>} List of available tools
   */
  async listTools() {
    if (!this._isAvailable) {
      throw new Error('Smithery client not available');
    }
    
    let client, transport;
    try {
      // Create fresh connection for this request
      ({ client, transport } = await this.createFreshConnection());
      
      const result = await client.listTools();
      return result.tools;
    } catch (error) {
      console.error('Error listing Smithery tools:', error);
      // Mark as unavailable if connection fails
      this._isAvailable = false;
      throw new Error(`Failed to list tools: ${error.message}`);
    } finally {
      // Always clean up the connection
      if (client) {
        try {
          await client.close();
        } catch (closeError) {
          // Ignore close errors
        }
      }
    }
  }

  /**
   * Call a tool via Smithery
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<Object>} Tool execution result
   */
  async callTool(name, args) {
    if (!this._isAvailable) {
      throw new Error('Smithery client not available');
    }
    
    let client, transport;
    try {
      // Create fresh connection for this request
      ({ client, transport } = await this.createFreshConnection());
      
      const result = await client.callTool({
        name,
        arguments: args
      });
      
      return result;
    } catch (error) {
      console.error(`Error calling Smithery tool ${name}:`, error);
      // Mark as unavailable if connection fails
      this._isAvailable = false;
      throw new Error(`Failed to call tool ${name}: ${error.message}`);
    } finally {
      // Always clean up the connection
      if (client) {
        try {
          await client.close();
        } catch (closeError) {
          // Ignore close errors
        }
      }
    }
  }

  /**
   * Check if client is available
   * @returns {boolean} Availability status
   */
  isAvailable() {
    return this._isAvailable && Boolean(this.apiKey && this.profile);
  }

  /**
   * Close any persistent connections (not needed in stateless mode)
   */
  async close() {
    // No persistent connections to close in stateless mode
    console.log('✓ Smithery client closed (stateless mode)');
  }
} 