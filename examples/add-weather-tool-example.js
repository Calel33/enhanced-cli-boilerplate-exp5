/**
 * 🌤️ Example: Adding a Weather Tool from Smithery
 * This is a complete working example of how to integrate a weather tool
 */

// ============================================================================
// STEP 1: Add to smithery-client.js
// ============================================================================

// Add this to the TOOL_CONFIGS object in src/utils/smithery-client.js:
const WEATHER_TOOL_CONFIG = {
  'weather-forecast': 'https://server.smithery.ai/@weather/forecast'
};

// ============================================================================
// STEP 2: Add to server.js
// ============================================================================

// Add this case to the switch statement in src/server.js:
const WEATHER_TOOL_CASE = `
case 'weather-forecast':
case 'weather_forecast':
  if (smitheryConnected || await initializeSmithery()) {
    console.log(\`Executing Smithery weather forecast for location: \${params.location}\`);
    try {
      const smitheryResult = await smitheryClient.callTool('weather_forecast', params);
      
      // Parse weather data from Smithery response
      let weatherData = {};
      if (smitheryResult.content && smitheryResult.content[0] && smitheryResult.content[0].text) {
        const text = smitheryResult.content[0].text;
        
        // Parse weather response format
        const lines = text.split('\\n');
        weatherData = {
          location: params.location,
          temperature: extractTemperature(lines),
          conditions: extractConditions(lines),
          forecast: extractForecast(lines),
          humidity: extractHumidity(lines),
          windSpeed: extractWindSpeed(lines)
        };
      }
      
      result = {
        location: params.location,
        weather: weatherData,
        days: params.days || 5,
        source: 'smithery'
      };
    } catch (error) {
      console.error('Error in Smithery weather forecast:', error);
      smitheryConnected = false;
      throw new Error(\`Smithery Weather Forecast failed: \${error.message}\`);
    }
  } else {
    throw new Error('Weather Forecast not available - no Smithery connection');
  }
  break;
`;

// ============================================================================
// STEP 3: Helper Functions
// ============================================================================

// Add these helper functions to parse weather data:
function extractTemperature(lines) {
  const tempLine = lines.find(line => line.includes('Temperature:'));
  return tempLine ? tempLine.split(':')[1].trim() : 'N/A';
}

function extractConditions(lines) {
  const condLine = lines.find(line => line.includes('Conditions:'));
  return condLine ? condLine.split(':')[1].trim() : 'N/A';
}

function extractForecast(lines) {
  const forecastStart = lines.findIndex(line => line.includes('Forecast:'));
  if (forecastStart === -1) return [];
  
  const forecast = [];
  for (let i = forecastStart + 1; i < lines.length; i++) {
    if (lines[i].trim() && !lines[i].includes(':')) {
      forecast.push(lines[i].trim());
    }
  }
  return forecast;
}

function extractHumidity(lines) {
  const humidityLine = lines.find(line => line.includes('Humidity:'));
  return humidityLine ? humidityLine.split(':')[1].trim() : 'N/A';
}

function extractWindSpeed(lines) {
  const windLine = lines.find(line => line.includes('Wind:'));
  return windLine ? windLine.split(':')[1].trim() : 'N/A';
}

// ============================================================================
// STEP 4: Test Script
// ============================================================================

// Create test-weather.js:
import axios from 'axios';

async function testWeatherTool() {
  console.log('🌤️ Testing Weather Forecast Tool...');
  
  const testCases = [
    {
      name: 'New York Weather',
      params: {
        location: 'New York, NY',
        days: 3
      }
    },
    {
      name: 'London Weather',
      params: {
        location: 'London, UK',
        days: 5
      }
    },
    {
      name: 'Tokyo Weather',
      params: {
        location: 'Tokyo, Japan',
        days: 7
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📍 Testing: ${testCase.name}`);
      
      const response = await axios.post('http://localhost:8081/api/tools/call', {
        name: 'weather-forecast',
        params: testCase.params
      });
      
      console.log('✅ Success:');
      console.log(`   Location: ${response.data.result.location}`);
      console.log(`   Temperature: ${response.data.result.weather.temperature}`);
      console.log(`   Conditions: ${response.data.result.weather.conditions}`);
      console.log(`   Humidity: ${response.data.result.weather.humidity}`);
      console.log(`   Wind: ${response.data.result.weather.windSpeed}`);
      console.log(`   Forecast Days: ${response.data.result.days}`);
      
    } catch (error) {
      console.error(`❌ ${testCase.name} failed:`, error.response?.data || error.message);
    }
  }
}

// Run the test
testWeatherTool();

// ============================================================================
// STEP 5: CLI Integration (Optional)
// ============================================================================

// Add to src/cli.js if you want different CLI naming:
const WEATHER_CLI_MAPPING = {
  'weather': 'weather-forecast',
  'forecast': 'weather-forecast'
};

// ============================================================================
// STEP 6: Environment Variables (if needed)
// ============================================================================

// Add to .env if the tool requires additional configuration:
const WEATHER_ENV_VARS = `
# Weather Tool Configuration (if needed)
WEATHER_API_KEY=your_weather_api_key_here
WEATHER_UNITS=metric
WEATHER_LANGUAGE=en
`;

// ============================================================================
// COMPLETE INTEGRATION EXAMPLE
// ============================================================================

/**
 * Here's what your files should look like after integration:
 * 
 * 1. src/utils/smithery-client.js:
 * ```javascript
 * const TOOL_CONFIGS = {
 *   'brave-search': 'https://server.smithery.ai/@smithery-ai/brave-search',
 *   'weather-forecast': 'https://server.smithery.ai/@weather/forecast', // Added
 * };
 * ```
 * 
 * 2. src/server.js (in the switch statement):
 * ```javascript
 * case 'weather-forecast':
 * case 'weather_forecast':
 *   // ... implementation from WEATHER_TOOL_CASE above
 *   break;
 * ```
 * 
 * 3. test-weather.js:
 * ```javascript
 * // ... implementation from test script above
 * ```
 */

export {
  WEATHER_TOOL_CONFIG,
  WEATHER_TOOL_CASE,
  extractTemperature,
  extractConditions,
  extractForecast,
  extractHumidity,
  extractWindSpeed
}; 