// Brave Search tool implementation
import axios from 'axios';

export class BraveSearchTool {
  constructor() {
    this.name = 'brave-search';
    this.description = 'Search the web using Brave Search API';
    this.apiKey = process.env.BRAVE_API_KEY;
    this.baseUrl = 'https://api.search.brave.com/res/v1';
  }

  /**
   * Check if the tool is available (has API key)
   * @returns {boolean}
   */
  isAvailable() {
    return Boolean(this.apiKey);
  }

  /**
   * Get tool parameters schema
   * @returns {Object}
   */
  getParameters() {
    return {
      type: 'object',
      required: ['query'],
      properties: {
        query: {
          type: 'string',
          description: 'The search query'
        },
        count: {
          type: 'number',
          description: 'Number of results to return (max 20)',
          default: 5
        },
        safesearch: {
          type: 'string',
          enum: ['strict', 'moderate', 'off'],
          description: 'SafeSearch filter level',
          default: 'moderate'
        }
      }
    };
  }

  /**
   * Execute the search
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async execute(params) {
    if (!this.isAvailable()) {
      throw new Error('Brave Search API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/web/search`, {
        params: {
          q: params.query,
          count: params.count || 5,
          safesearch: params.safesearch || 'moderate'
        },
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': this.apiKey
        }
      });

      return {
        results: response.data.web.results,
        total: response.data.web.total
      };
    } catch (error) {
      throw new Error(`Brave Search API error: ${error.message}`);
    }
  }
} 