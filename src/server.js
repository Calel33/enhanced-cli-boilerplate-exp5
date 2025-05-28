// ESM-compatible MCP server
import express from 'express';
import { HustleIncognitoClient } from 'hustle-incognito';
import dotenv from 'dotenv';
import axios from 'axios';
import { SmitheryClient } from './utils/smithery-client.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['HUSTLE_API_KEY', 'VAULT_ID'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please create a .env file based on env.example');
  process.exit(1);
}

// Warn about missing optional API keys
function checkOptionalApiKeys() {
  const warnings = [];
  
  if (!process.env.SMITHERY_API_KEY || !process.env.SMITHERY_PROFILE) {
    warnings.push('⚠ Smithery credentials not configured - hosted tools will be unavailable');
  }
  
  if (!process.env.ORDISCAN_API_KEY) {
    warnings.push('⚠ ORDISCAN_API_KEY not configured - Bitcoin ordinals tools will be unavailable');
  }
  
  if (!process.env.ALPHA_VANTAGE_API_KEY) {
    warnings.push('⚠ ALPHA_VANTAGE_API_KEY not configured - stock analysis tools will be unavailable');
  }
  
  if (!process.env.BRAVE_API_KEY) {
    warnings.push('⚠ BRAVE_API_KEY not configured - local search fallback will be unavailable');
  }
  
  if (warnings.length > 0) {
    console.log('\n' + warnings.join('\n'));
    console.log('\nTo enable all features, please configure the missing API keys in your .env file\n');
  }
}

checkOptionalApiKeys();

// Create Express app
const app = express();

// Add CORS middleware to allow frontend connections
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Initialize the AgentHustle client
const client = new HustleIncognitoClient({
  apiKey: process.env.HUSTLE_API_KEY,
  debug: true
});

// Store the vault ID for use in API calls
const vaultId = process.env.VAULT_ID;

// Initialize Smithery client for Brave Search
const smitheryClient = new SmitheryClient({
  baseUrl: 'https://server.smithery.ai/@smithery-ai/brave-search',
  apiKey: process.env.SMITHERY_API_KEY,
  profile: process.env.SMITHERY_PROFILE
});

// Initialize Smithery client for Ordiscan (only if API key is available)
let ordiscanClient = null;
if (process.env.ORDISCAN_API_KEY) {
  ordiscanClient = new SmitheryClient({
    baseUrl: `https://server.smithery.ai/@Calel33/ordiscan-mcp-v1/mcp?api_key=${process.env.ORDISCAN_API_KEY}`,
    apiKey: process.env.SMITHERY_API_KEY,
    profile: process.env.SMITHERY_PROFILE
  });
}

// Initialize Smithery client for Stock Analysis (Alpha Vantage)
let stockAnalysisClient = null;
if (process.env.ALPHA_VANTAGE_API_KEY) {
  stockAnalysisClient = new SmitheryClient({
    baseUrl: `https://server.smithery.ai/@qubaomingg/stock-analysis-mcp/mcp?api_key=${process.env.ALPHA_VANTAGE_API_KEY}&profile=${process.env.SMITHERY_PROFILE || 'glad-squid-LrsVYY'}`,
    apiKey: process.env.SMITHERY_API_KEY,
    profile: process.env.SMITHERY_PROFILE
  });
}

// Initialize Smithery connections on startup
let smitheryConnected = false;
let ordiscanConnected = false;
let stockAnalysisConnected = false;

async function initializeSmithery() {
  if (!process.env.SMITHERY_API_KEY || !process.env.SMITHERY_PROFILE) {
    console.log('⚠ Smithery credentials not configured, skipping Smithery integration');
    return false;
  }

  try {
    const success = await smitheryClient.initialize();
    smitheryConnected = success;
    if (success) {
      console.log('✓ Smithery Brave Search integration ready');
    } else {
      console.log('⚠ Smithery connection failed, falling back to local tools');
    }
    return success;
  } catch (error) {
    console.error('Error initializing Smithery:', error.message);
    smitheryConnected = false;
    return false;
  }
}

async function initializeOrdiscan() {
  if (!process.env.SMITHERY_API_KEY || !process.env.SMITHERY_PROFILE) {
    console.log('⚠ Smithery credentials not configured, skipping Ordiscan integration');
    return false;
  }

  if (!process.env.ORDISCAN_API_KEY) {
    console.log('⚠ ORDISCAN_API_KEY not configured, skipping Ordiscan integration');
    console.log('  Please set ORDISCAN_API_KEY in your .env file to use Ordiscan tools');
    return false;
  }

  if (!ordiscanClient) {
    console.log('⚠ Ordiscan client not initialized, skipping Ordiscan integration');
    return false;
  }

  try {
    const success = await ordiscanClient.initialize();
    ordiscanConnected = success;
    if (success) {
      console.log('✓ Ordiscan MCP integration ready');
    } else {
      console.log('⚠ Ordiscan connection failed');
    }
    return success;
  } catch (error) {
    console.error('Error initializing Ordiscan:', error.message);
    ordiscanConnected = false;
    return false;
  }
}

async function initializeStockAnalysis() {
  if (!process.env.SMITHERY_API_KEY || !process.env.SMITHERY_PROFILE) {
    console.log('⚠ Smithery credentials not configured, skipping Stock Analysis integration');
    return false;
  }

  if (!process.env.ALPHA_VANTAGE_API_KEY) {
    console.log('⚠ ALPHA_VANTAGE_API_KEY not configured, skipping Stock Analysis integration');
    console.log('  Please set ALPHA_VANTAGE_API_KEY in your .env file to use stock analysis tools');
    return false;
  }

  if (!stockAnalysisClient) {
    console.log('⚠ Stock Analysis client not initialized, skipping Stock Analysis integration');
    return false;
  }

  try {
    const success = await stockAnalysisClient.initialize();
    stockAnalysisConnected = success;
    if (success) {
      console.log('✓ Stock Analysis MCP integration ready');
    } else {
      console.log('⚠ Stock Analysis connection failed');
    }
    return success;
  } catch (error) {
    console.error('Error initializing Stock Analysis:', error.message);
    stockAnalysisConnected = false;
    return false;
  }
}

// Initialize on startup - await the results
await initializeSmithery();
await initializeOrdiscan();
await initializeStockAnalysis();

/**
 * Brave Search API client
 */
class BraveSearchClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.search.brave.com/res/v1';
  }

  /**
   * Search the web using Brave Search API
   * @param query Search query
   * @param options Search options
   * @returns Search results
   */
  async search(query, options = {}) {
    const params = {
      q: query,
      count: options.count || 10,
      offset: options.offset || 0,
      country: options.country || 'US',
      safesearch: options.safesearch || 'moderate'
    };

    try {
      const response = await axios.get(`${this.baseUrl}/web/search`, {
        params,
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error searching with Brave:', error);
      throw new Error(`Brave Search API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Define API endpoints
app.post('/api/tools/list', async (req, res) => {
  const tools = [
    {
      name: 'rugcheck',
      description: 'Perform a security analysis (rugcheck) on a specific token',
      parameters: {
        type: 'object',
        required: ['token'],
        properties: {
          token: {
            type: 'string',
            description: 'The token symbol or address to analyze'
          },
          chain: {
            type: 'string',
            description: 'The blockchain network (defaults to Solana)',
            default: 'solana'
          }
        }
      }
    },
    {
      name: 'trending-tokens',
      description: 'Get trending tokens on a specific blockchain',
      parameters: {
        type: 'object',
        properties: {
          chain: {
            type: 'string',
            description: 'The blockchain network (defaults to Solana)',
            default: 'solana'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of tokens to return',
            default: 10
          }
        }
      }
    },
    {
      name: 'wallet-balance',
      description: 'Check wallet balance for a specific address',
      parameters: {
        type: 'object',
        required: ['address'],
        properties: {
          address: {
            type: 'string',
            description: 'The wallet address to check'
          },
          chain: {
            type: 'string',
            description: 'The blockchain network (defaults to Solana)',
            default: 'solana'
          }
        }
      }
    },
    {
      name: 'crypto-chat',
      description: 'Chat with the AgentHustle AI about crypto and web3 topics',
      parameters: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            description: 'The message to send to the crypto assistant'
          }
        }
      }
    }
  ];

  // Add Smithery Brave Search if connected
  if (smitheryConnected && smitheryClient.isAvailable()) {
    try {
      const smitheryTools = await smitheryClient.listTools();
      // Add Smithery tools to our tools list
      smitheryTools.forEach(tool => {
        tools.push({
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
          source: 'smithery' // Mark as Smithery tool for identification
        });
      });
      console.log(`✓ Added ${smitheryTools.length} Smithery tools to the list`);
    } catch (error) {
      console.error('Error fetching Smithery tools:', error.message);
      // Try to reconnect for next time
      smitheryConnected = false;
      console.log('⚠ Marking Smithery as disconnected, will attempt reconnection on next tool call');
    }
  }

  // Add Ordiscan tools if connected
  if (ordiscanConnected && ordiscanClient.isAvailable()) {
    try {
      const ordiscanTools = await ordiscanClient.listTools();
      // Add Ordiscan tools to our tools list
      ordiscanTools.forEach(tool => {
        tools.push({
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
          source: 'ordiscan' // Mark as Ordiscan tool for identification
        });
      });
      console.log(`✓ Added ${ordiscanTools.length} Ordiscan tools to the list`);
    } catch (error) {
      console.error('Error fetching Ordiscan tools:', error.message);
      // Try to reconnect for next time
      ordiscanConnected = false;
      console.log('⚠ Marking Ordiscan as disconnected, will attempt reconnection on next tool call');
    }
  }

  // Add Stock Analysis tools if connected
  if (stockAnalysisConnected && stockAnalysisClient.isAvailable()) {
    try {
      const stockTools = await stockAnalysisClient.listTools();
      // Add Stock Analysis tools to our tools list
      stockTools.forEach(tool => {
        tools.push({
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
          source: 'stock-analysis' // Mark as Stock Analysis tool for identification
        });
      });
      console.log(`✓ Added ${stockTools.length} Stock Analysis tools to the list`);
    } catch (error) {
      console.error('Error fetching Stock Analysis tools:', error.message);
      // Try to reconnect for next time
      stockAnalysisConnected = false;
      console.log('⚠ Marking Stock Analysis as disconnected, will attempt reconnection on next tool call');
    }
  }

  // Add local Brave Search tool if API key is provided (fallback)
  if (process.env.BRAVE_API_KEY && !smitheryConnected) {
    tools.push({
      name: 'brave-search',
      description: 'Search the web using Brave Search API',
      parameters: {
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
      },
      source: 'local' // Mark as local tool
    });
  }

  res.json({ tools });
});

app.post('/api/tools/call', async (req, res) => {
  const { name, params } = req.body;
  
  try {
    let result;

    switch (name) {
      case 'brave-search':
      case 'brave_web_search': // Handle Smithery tool name
        // Use Smithery if connected, otherwise fall back to local implementation
        if ((smitheryConnected || await initializeSmithery()) && name === 'brave_web_search') {
          console.log(`Executing Smithery Brave search for query: ${params.query}`);
          try {
            const smitheryResult = await smitheryClient.callTool('brave_web_search', params);
            
            // Parse the result from Smithery
            // Smithery returns results as formatted text, not JSON
            let parsedResults = [];
            if (smitheryResult.content && smitheryResult.content[0] && smitheryResult.content[0].text) {
              const text = smitheryResult.content[0].text;
              
              // Parse the text format: Title: ... Description: ... URL: ...
              const resultBlocks = text.split('\n\n').filter(block => block.trim());
              
              for (const block of resultBlocks) {
                const lines = block.split('\n');
                let title = '', description = '', url = '';
                
                for (const line of lines) {
                  if (line.startsWith('Title: ')) {
                    title = line.substring(7).trim();
                  } else if (line.startsWith('Description: ')) {
                    description = line.substring(13).trim();
                    // Remove HTML tags and decode entities
                    description = description
                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                      .replace(/&quot;/g, '"')
                      .replace(/&#x27;/g, "'")
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/&amp;/g, '&');
                  } else if (line.startsWith('URL: ')) {
                    url = line.substring(5).trim();
                  }
                }
                
                if (title && url) {
                  parsedResults.push({ title, description, url });
                }
              }
            }
            
            // Format the results consistently
            result = {
              query: params.query,
              total: parsedResults.length,
              results: parsedResults,
              source: 'smithery'
            };
          } catch (error) {
            console.error('Error in Smithery Brave search:', error);
            smitheryConnected = false; // Mark as disconnected
            
            // Try local fallback if available
            if (process.env.BRAVE_API_KEY) {
              console.log('Falling back to local Brave Search...');
              const braveClient = new BraveSearchClient(process.env.BRAVE_API_KEY);
              const searchResult = await braveClient.search(params.query, {
                count: params.count || 5,
                safesearch: params.safesearch || 'moderate'
              });
              
              result = {
                query: params.query,
                total: searchResult.web?.total || 0,
                results: searchResult.web?.results?.map(r => ({
                  title: r.title,
                  description: r.description,
                  url: r.url
                })) || [],
                source: 'local-fallback'
              };
            } else {
              throw new Error(`Smithery Brave Search failed and no local API key available: ${error.message}`);
            }
          }
        } else if (process.env.BRAVE_API_KEY) {
          // Fallback to local Brave Search implementation
          console.log(`Executing local Brave search for query: ${params.query}`);
          try {
            const braveClient = new BraveSearchClient(process.env.BRAVE_API_KEY);
            const searchResult = await braveClient.search(params.query, {
              count: params.count || 5,
              safesearch: params.safesearch || 'moderate'
            });
            
            // Format the results in a more usable way
            result = {
              query: params.query,
              total: searchResult.web?.total || 0,
              results: searchResult.web?.results?.map(r => ({
                title: r.title,
                description: r.description,
                url: r.url
              })) || [],
              source: 'local'
            };
          } catch (error) {
            console.error('Error in local Brave search:', error);
            throw new Error(`Local Brave Search failed: ${error.message}`);
          }
        } else {
          throw new Error('Brave Search not available - no Smithery connection and no local API key configured');
        }
        break;

      case 'brave_local_search': // Handle Smithery local search
        if (smitheryConnected || await initializeSmithery()) {
          console.log(`Executing Smithery local search for query: ${params.query}`);
          try {
            const smitheryResult = await smitheryClient.callTool('brave_local_search', params);
            
            // Parse the result from Smithery
            // Smithery returns results as formatted text, not JSON
            let parsedResults = [];
            if (smitheryResult.content && smitheryResult.content[0] && smitheryResult.content[0].text) {
              const text = smitheryResult.content[0].text;
              
              // Parse the text format: Title: ... Description: ... URL: ...
              const resultBlocks = text.split('\n\n').filter(block => block.trim());
              
              for (const block of resultBlocks) {
                const lines = block.split('\n');
                let title = '', description = '', url = '';
                
                for (const line of lines) {
                  if (line.startsWith('Title: ')) {
                    title = line.substring(7).trim();
                  } else if (line.startsWith('Description: ')) {
                    description = line.substring(13).trim();
                    // Remove HTML tags and decode entities
                    description = description
                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                      .replace(/&quot;/g, '"')
                      .replace(/&#x27;/g, "'")
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/&amp;/g, '&');
                  } else if (line.startsWith('URL: ')) {
                    url = line.substring(5).trim();
                  }
                }
                
                if (title && url) {
                  parsedResults.push({ title, description, url });
                }
              }
            }
            
            result = {
              query: params.query,
              total: parsedResults.length,
              results: parsedResults,
              source: 'smithery'
            };
          } catch (error) {
            console.error('Error in Smithery local search:', error);
            smitheryConnected = false; // Mark as disconnected
            throw new Error(`Smithery Local Search failed: ${error.message}`);
          }
        } else {
          throw new Error('Smithery Local Search not available - no Smithery connection');
        }
        break;

      case 'rugcheck':
        console.log(`Executing rugcheck for token: ${params.token}`);
        const rugcheckResponse = await client.headlessChat(
          `Run a rugcheck for ${params.token}`, 
          {
            'rugcheck': async (p) => p
          },
          { vaultId }
        );
        result = rugcheckResponse.toolResults[0] || { error: 'No results from rugcheck' };
        break;

      case 'trending-tokens':
        console.log(`Fetching trending tokens on chain: ${params.chain || 'solana'}`);
        try {
          const trendingResponse = await client.headlessChat(
            `Show me trending tokens on ${params.chain || 'solana'}`, 
            {
              'birdeye-trending': async (p) => p
            },
            { vaultId }
          );
          result = trendingResponse.toolResults[0] || { 
            tokens: [],
            message: 'Unable to fetch trending tokens'
          };
        } catch (error) {
          console.error('Error in trending-tokens:', error);
          result = { 
            tokens: [],
            message: `Error: ${error.message}`
          };
        }
        break;

      case 'wallet-balance':
        console.log(`Checking wallet balance for: ${params.address}`);
        try {
          const balanceResponse = await client.headlessChat(
            `Check wallet balance for ${params.address}`, 
            {
              'wallet-balance': async (p) => p
            },
            { vaultId }
          );
          result = balanceResponse.toolResults[0] || { 
            address: params.address,
            balances: [],
            message: 'Unable to fetch wallet balance'
          };
        } catch (error) {
          console.error('Error in wallet-balance:', error);
          result = { 
            address: params.address,
            balances: [],
            message: `Error: ${error.message}`
          };
        }
        break;

      case 'crypto-chat':
        console.log(`Crypto chat: ${params.message}`);
        try {
          const response = await client.chat([
            {
              role: 'system',
              content: 'You are a helpful crypto and web3 expert. Provide informative and accurate responses about cryptocurrency, blockchain technology, DeFi, NFTs, and related topics.'
            },
            {
              role: 'user',
              content: params.message || params.query
            }
          ], { vaultId });
          
          result = {
            response: response.content,
            toolsUsed: response.toolCalls ? response.toolCalls.map(tool => tool.name) : []
          };
        } catch (error) {
          console.error('Error in crypto-chat:', error);
          result = {
            response: `Sorry, I encountered an error: ${error.message}`,
            toolsUsed: []
          };
        }
        break;

      // Ordiscan tools - Handle all 29 Ordiscan MCP tools
      case 'ordiscan_address_brc20_activity':
      case 'ordiscan_address_brc20':
      case 'ordiscan_brc20_info':
      case 'ordiscan_brc20_list':
      case 'ordiscan_collection_info':
      case 'ordiscan_collection_inscriptions':
      case 'ordiscan_collections_list':
      case 'ordiscan_inscription_info':
      case 'ordiscan_inscription_traits':
      case 'ordiscan_inscription_transfers':
      case 'ordiscan_inscriptions_activity':
      case 'ordiscan_inscriptions_detail':
      case 'ordiscan_inscriptions_list':
      case 'ordiscan_address_inscriptions':
      case 'ordiscan_address_rare_sats':
      case 'ordiscan_rune_market':
      case 'ordiscan_rune_name_unlock':
      case 'ordiscan_runes_activity':
      case 'ordiscan_address_runes':
      case 'ordiscan_runes_list':
      case 'ordiscan_sat_info':
      case 'ordiscan_tx_info':
      case 'ordiscan_tx_inscription_transfers':
      case 'ordiscan_tx_inscriptions':
      case 'ordiscan_tx_runes':
      case 'ordiscan_utxo_rare_sats':
      case 'ordiscan_utxo_sat_ranges':
      case 'ordiscan_address_utxos':
      case 'ordiscan_main':
        if (ordiscanConnected || await initializeOrdiscan()) {
          console.log(`Executing Ordiscan ${name} with params:`, params);
          try {
            // Add API key to params if available
            const ordiscanParams = { ...params };
            if (process.env.ORDISCAN_API_KEY) {
              ordiscanParams.apiKey = process.env.ORDISCAN_API_KEY;
              console.log(`✓ Adding API key to Ordiscan request: ${process.env.ORDISCAN_API_KEY.substring(0, 8)}...`);
            } else {
              throw new Error('ORDISCAN_API_KEY environment variable is required but not set');
            }
            
            const ordiscanResult = await ordiscanClient.callTool(name, ordiscanParams);
            
            // Parse the result from Ordiscan
            // Reason: Ordiscan returns structured data, usually as JSON text
            let parsedData = {};
            if (ordiscanResult.content && ordiscanResult.content[0] && ordiscanResult.content[0].text) {
              const text = ordiscanResult.content[0].text;
              try {
                // Try to parse as JSON first
                parsedData = JSON.parse(text);
              } catch (jsonError) {
                // If not JSON, return as text
                parsedData = { data: text };
              }
            }
            
            // Format the result consistently based on tool type
            if (name.includes('address')) {
              result = {
                address: params.address,
                data: parsedData,
                tool: name,
                source: 'ordiscan'
              };
            } else if (name.includes('inscription')) {
              result = {
                inscription: params.id || params.number,
                data: parsedData,
                tool: name,
                source: 'ordiscan'
              };
            } else if (name.includes('brc20')) {
              result = {
                token: params.tick,
                data: parsedData,
                tool: name,
                source: 'ordiscan'
              };
            } else if (name.includes('rune')) {
              result = {
                rune: params.name || params.runeName,
                data: parsedData,
                tool: name,
                source: 'ordiscan'
              };
            } else if (name.includes('collection')) {
              result = {
                collection: params.slug,
                data: parsedData,
                tool: name,
                source: 'ordiscan'
              };
            } else if (name.includes('tx')) {
              result = {
                transaction: params.txid,
                data: parsedData,
                tool: name,
                source: 'ordiscan'
              };
            } else if (name.includes('utxo')) {
              result = {
                utxo: params.utxo,
                data: parsedData,
                tool: name,
                source: 'ordiscan'
              };
            } else if (name.includes('sat')) {
              result = {
                satoshi: params.ordinal,
                data: parsedData,
                tool: name,
                source: 'ordiscan'
              };
            } else {
              // Generic format for other tools
              result = {
                data: parsedData,
                tool: name,
                source: 'ordiscan'
              };
            }
          } catch (error) {
            console.error(`Error in Ordiscan ${name}:`, error);
            ordiscanConnected = false; // Mark as disconnected
            throw new Error(`Ordiscan ${name} failed: ${error.message}`);
          }
        } else {
          throw new Error(`${name} not available - no Ordiscan connection`);
        }
        break;

      // Stock Analysis tools - Handle Alpha Vantage stock analysis tools
      case 'get-stock-data':
      case 'get_stock_data':
      case 'get-stock-alerts':
      case 'get_stock_alerts':
      case 'get-daily-stock-data':
      case 'get_daily_stock_data':
        if (stockAnalysisConnected || await initializeStockAnalysis()) {
          console.log(`Executing Stock Analysis ${name} with params:`, params);
          try {
            // Add API key to params if available
            const stockParams = { ...params };
            if (process.env.ALPHA_VANTAGE_API_KEY) {
              stockParams.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY;
              console.log(`✓ Adding Alpha Vantage API key to request: ${process.env.ALPHA_VANTAGE_API_KEY.substring(0, 8)}...`);
            } else {
              throw new Error('ALPHA_VANTAGE_API_KEY environment variable is required but not set');
            }
            
            // Normalize tool name for Smithery (use hyphen format)
            const normalizedName = name.replace(/_/g, '-');
            const stockResult = await stockAnalysisClient.callTool(normalizedName, stockParams);
            
            // Parse the result from Stock Analysis
            // Reason: Stock analysis returns structured data, usually as JSON text
            let parsedData = {};
            if (stockResult.content && stockResult.content[0] && stockResult.content[0].text) {
              const text = stockResult.content[0].text;
              try {
                // Try to parse as JSON first
                parsedData = JSON.parse(text);
              } catch (jsonError) {
                // If not JSON, return as text
                parsedData = { data: text };
              }
            }
            
            // Format the result consistently based on tool type
            if (name.includes('stock-data') || name.includes('daily')) {
              result = {
                symbol: params.symbol,
                data: parsedData,
                tool: name,
                source: 'stock-analysis'
              };
            } else if (name.includes('alerts')) {
              result = {
                symbol: params.symbol,
                alerts: parsedData,
                tool: name,
                source: 'stock-analysis'
              };
            } else {
              // Generic format for other stock tools
              result = {
                data: parsedData,
                tool: name,
                source: 'stock-analysis'
              };
            }
          } catch (error) {
            console.error(`Error in Stock Analysis ${name}:`, error);
            stockAnalysisConnected = false; // Mark as disconnected
            throw new Error(`Stock Analysis ${name} failed: ${error.message}`);
          }
        } else {
          throw new Error(`${name} not available - no Stock Analysis connection`);
        }
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    res.json({ 
      success: true, 
      result,
      tool: name
    });
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message || `Failed to execute tool ${name}`,
      tool: name
    });
  }
});

// Agent UI Integration Endpoint
app.post('/api/agentui/chat', async (req, res) => {
  const { message, sessionId, history } = req.body;
  
  console.log(`[AgentUI Interaction] Received message: "${message}" for session: ${sessionId || 'default'}`);
  
  try {
    const agentUiResponse = await handleAgentUiRequest(message, sessionId, history);
    
    // Check if the response contains an error
    if (agentUiResponse.error) {
      console.error('[AgentUI Chat] Response contains error:', agentUiResponse);
      res.status(500).json(agentUiResponse);
    } else {
    res.json(agentUiResponse);
    }
  } catch (error) {
    console.error('[AgentUI Chat Error] Failed to process request:', error);
    res.status(500).json({
      role: 'assistant',
      content: `Sorry, an error occurred on the server: ${error.message}`,
      created_at: Date.now(),
    });
  }
});

/**
 * Handle Agent UI chat requests
 * @param {string} userMessage - The user's message
 * @param {string} sessionId - Session identifier
 * @param {Array} history - Conversation history
 * @returns {Object|Array} - Formatted response for Agent UI
 */
async function handleAgentUiRequest(userMessage, sessionId, history) {
  try {
    console.log('[AgentUI] Processing message:', userMessage);
    console.log('[AgentUI] Environment check:');
    console.log('  - HUSTLE_API_KEY:', process.env.HUSTLE_API_KEY ? `${process.env.HUSTLE_API_KEY.substring(0, 8)}...` : 'NOT SET');
    console.log('  - VAULT_ID:', process.env.VAULT_ID || 'NOT SET');
    console.log('  - vaultId variable:', vaultId || 'NOT SET');
    
    // Step 1: Send simple message to Hustle AI
    console.log('[AgentUI] Sending message to Hustle AI...');
    console.log('[AgentUI] Using vaultId:', vaultId);
    
    // Use simple chat format with explicit vaultId
    const aiResponse = await client.chat([
      {
      role: 'user',
      content: userMessage
      }
    ], { 
      vaultId: vaultId || process.env.VAULT_ID || '6888216545'  // Explicit fallback
    });
    
    console.log('[AgentUI] Received AI response:', aiResponse);
    
    // Step 2: Format response for Agent UI
    // The Hustle API returns an object with content, messageId, usage, etc.
    const responseContent = aiResponse.content || aiResponse.message || 'I received your message and I\'m here to help!';
    
    return {
        role: 'assistant',
      content: responseContent,
      created_at: Date.now(),
      messageId: aiResponse.messageId || `msg-${Date.now()}`,
      usage: aiResponse.usage || null
    };
          
  } catch (error) {
    console.error('[AgentUI] Error in handleAgentUiRequest:', error);
    console.error('[AgentUI] Error details:', {
      message: error.message,
      stack: error.stack,
          vaultId: vaultId,
      envVaultId: process.env.VAULT_ID
    });
    
    // Return a proper error response instead of throwing
      return {
        role: 'assistant',
      content: `Sorry, I encountered an error: ${error.message}`,
      created_at: Date.now(),
      error: true
    };
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add Agno Playground API endpoints for frontend compatibility
app.get('/v1/playground/status', (req, res) => {
  res.json({ 
    status: 'ok',
    version: '1.0.0',
    agents_available: true
  });
});

app.get('/v1/playground/agents', (req, res) => {
  res.json([
    {
      agent_id: 'crypto-agent',
      name: 'Crypto & Web3 Agent',
        model: 'gpt-4o-mini',
      storage: false,
      description: 'AI assistant with crypto tools, web search, and stock analysis'
    }
  ]);
});

app.post('/v1/playground/agents/:agent_id/runs', async (req, res) => {
  const { agent_id } = req.params;
  const { message, stream, session_id } = req.body;
  
  console.log(`[Playground API] Agent run request for ${agent_id}:`, { message, stream, session_id });
  
  if (stream === 'true' || stream === true) {
    // Handle streaming response
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });

    try {
      // Use the existing AgentUI chat handler
      const result = await handleAgentUiRequest(message, session_id || 'default', []);
      
      // Send the response in the expected format
      const response = {
        event: 'run_completed',
        content: result.content,
        created_at: Math.floor(Date.now() / 1000),
        tools: result.tool_calls || [],
        extra_data: {
          reasoning_steps: result.reasoning_steps || [],
          references: result.references || []
        }
      };
      
      res.write(`data: ${JSON.stringify(response)}\n\n`);
      res.end();
    } catch (error) {
      console.error('[Playground API] Error:', error);
      const errorResponse = {
        event: 'run_error',
        content: `Error: ${error.message}`,
        created_at: Math.floor(Date.now() / 1000)
      };
      res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
      res.end();
    }
        } else {
    // Handle non-streaming response
    try {
      const result = await handleAgentUiRequest(message, session_id || 'default', []);
      res.json({
        content: result.content,
        tool_calls: result.tool_calls || [],
        created_at: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('[Playground API] Error:', error);
      res.status(500).json({
        error: error.message,
        created_at: Math.floor(Date.now() / 1000)
      });
  }
}
});

// Sessions endpoints (optional - for storage support)
app.get('/v1/playground/agents/:agent_id/sessions', (req, res) => {
  // Return empty array since storage is not implemented
  res.json([]);
});

app.get('/v1/playground/agents/:agent_id/sessions/:session_id', (req, res) => {
  res.status(404).json({ error: 'Session not found' });
});

app.delete('/v1/playground/agents/:agent_id/sessions/:session_id', (req, res) => {
  res.status(404).json({ error: 'Session not found' });
});

// Start server
const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`MCP Server running on port ${port}`);
  console.log('\nAvailable tools:');
  
  if (smitheryConnected) {
    console.log('- brave-search: Search the web using Smithery hosted Brave Search');
  } else if (process.env.BRAVE_API_KEY) {
    console.log('- brave-search: Search the web using local Brave Search API');
  }
  
  console.log('- rugcheck: Perform a security analysis on a specific token');
  console.log('- trending-tokens: Get trending tokens on a specific blockchain');
  console.log('- wallet-balance: Check wallet balance for a specific address');
  console.log('- crypto-chat: Chat with the AgentHustle AI about crypto and web3 topics');
  
  if (ordiscanConnected) {
    console.log('\n🔗 Ordiscan Bitcoin Tools (29 tools available):');
    console.log('- ordiscan_address_brc20: Get BRC-20 token balances for a Bitcoin address');
    console.log('- ordiscan_inscription_info: Get detailed information about a specific inscription');
    console.log('- ordiscan_address_inscriptions: Get all inscriptions owned by a Bitcoin address');
    console.log('- ordiscan_runes_list: Get a paginated list of all runes');
    console.log('- ordiscan_collection_info: Get detailed information about a specific collection');
    console.log('- ordiscan_tx_info: Get information about a Bitcoin transaction');
    console.log('- And 23 more Bitcoin ordinals, inscriptions, BRC-20, and runes tools...');
  }
  
  if (stockAnalysisConnected) {
    console.log('\n📈 Stock Analysis Tools (3 tools available):');
    console.log('- get-stock-data: Get real-time stock market data');
    console.log('- get-stock-alerts: Generate stock alerts based on price movements');
    console.log('- get-daily-stock-data: Get daily historical stock data');
  }
  
  console.log(`\nSmithery Integration: ${smitheryConnected ? '✓ Connected' : '✗ Not connected'}`);
  console.log(`Ordiscan Integration: ${ordiscanConnected ? '✓ Connected' : '✗ Not connected'}`);
  console.log(`Stock Analysis Integration: ${stockAnalysisConnected ? '✓ Connected' : '✗ Not connected'}`);
}); 