// Rugcheck tool implementation
import { HustleIncognitoClient } from 'hustle-incognito';

export class RugcheckTool {
  constructor() {
    this.name = 'rugcheck';
    this.description = 'Perform a security analysis (rugcheck) on a specific token';
    this.client = new HustleIncognitoClient({
      apiKey: process.env.HUSTLE_API_KEY,
      hustleApiUrl: process.env.HUSTLE_API_URL || 'https://agenthustle.ai',
      debug: process.env.DEBUG === 'true'
    });
  }

  /**
   * Check if the tool is available
   * @returns {boolean}
   */
  isAvailable() {
    return Boolean(process.env.HUSTLE_API_KEY && process.env.VAULT_ID);
  }

  /**
   * Get tool parameters schema
   * @returns {Object}
   */
  getParameters() {
    return {
      type: 'object',
      required: ['token'],
      properties: {
        token: {
          type: 'string',
          description: 'The token symbol or address to analyze'
        },
        chain: {
          type: 'string',
          description: 'The blockchain network',
          enum: ['solana', 'ethereum', 'binance'],
          default: 'solana'
        }
      }
    };
  }

  /**
   * Execute the rugcheck analysis
   * @param {Object} params - Analysis parameters
   * @returns {Promise<Object>} Analysis results
   */
  async execute(params) {
    try {
      const response = await this.client.headlessChat(
        `Run a rugcheck for ${params.token}`,
        {
          'rugcheck': async (p) => p
        },
        { vaultId: process.env.VAULT_ID }
      );

      const result = response.toolResults[0] || {
        token: params.token,
        score: 0,
        risk: 'unknown',
        message: 'Unable to perform rugcheck'
      };

      return {
        token: params.token,
        chain: params.chain,
        ...result
      };
    } catch (error) {
      throw new Error(`Rugcheck analysis failed: ${error.message}`);
    }
  }
} 