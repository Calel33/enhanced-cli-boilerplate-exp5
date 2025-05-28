import { PlaygroundChatMessage, ComboboxAgent } from '@/types/playground'

/**
 * API adapter for Enhanced CLI backend
 * Handles communication with the CLI's /api/agentui/chat endpoint
 */

export interface CLIBackendMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string | null
  created_at: number
  tool_calls?: Array<{
    id: string
    type: string
    function: {
      name: string
      arguments: string
    }
  }> | null
  tool_call_id?: string
  tool_name?: string
}

export interface CLIChatRequest {
  message: string
  sessionId?: string
  history?: CLIBackendMessage[]
}

/**
 * Create a CLI agent configuration for the Agent UI
 */
export const createCLIAgent = (endpoint: string): ComboboxAgent => {
  const url = new URL(endpoint)
  return {
    value: 'enhanced-cli-agent',
    label: `Enhanced CLI (${url.hostname}:${url.port})`,
    model: {
      provider: 'Enhanced CLI Backend'
    },
    storage: false // CLI backend handles its own session management
  }
}

/**
 * Check if the CLI backend is available
 */
export const checkCLIBackendStatus = async (endpoint: string): Promise<boolean> => {
  try {
    const response = await fetch(`${endpoint}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.ok
  } catch (error) {
    console.warn('CLI backend health check failed:', error)
    return false
  }
}

/**
 * Send a chat message to the Enhanced CLI backend
 */
export const sendCLIChatMessage = async (
  endpoint: string,
  request: CLIChatRequest
): Promise<CLIBackendMessage[]> => {
  try {
    const response = await fetch(`${endpoint}/api/agentui/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`CLI backend error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    
    // CLI backend returns a single message, but we expect an array
    return Array.isArray(data) ? data : [data]
  } catch (error) {
    console.error('Error sending message to CLI backend:', error)
    throw error
  }
}

/**
 * Get available tools from the CLI backend
 */
export const getCLIBackendTools = async (endpoint: string) => {
  try {
    const response = await fetch(`${endpoint}/api/tools/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.tools || []
  } catch (error) {
    console.error('Error fetching CLI backend tools:', error)
    return []
  }
}

/**
 * Convert CLI backend messages to Agent UI format
 */
export const convertCLIMessagesToAgentUI = (
  cliMessages: CLIBackendMessage[]
): PlaygroundChatMessage[] => {
  return cliMessages.map((msg) => {
    const agentUIMessage: PlaygroundChatMessage = {
      role: msg.role === 'assistant' ? 'agent' : msg.role,
      content: msg.content || '',
      created_at: msg.created_at,
      streamingError: false
    }

    // Handle tool calls - convert to Agent UI ToolCall format
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      agentUIMessage.tool_calls = msg.tool_calls.map(tc => ({
        role: 'tool' as const,
        content: tc.function.arguments,
        tool_call_id: tc.id,
        tool_name: tc.function.name,
        tool_args: JSON.parse(tc.function.arguments),
        tool_call_error: false,
        metrics: { time: 0 },
        created_at: msg.created_at
      }))
    }

    // Handle tool result messages
    if (msg.role === 'tool' && msg.tool_call_id && msg.tool_name) {
      agentUIMessage.tool_calls = [{
        role: 'tool' as const,
        content: msg.content || '',
        tool_call_id: msg.tool_call_id,
        tool_name: msg.tool_name,
        tool_args: {},
        tool_call_error: false,
        metrics: { time: 0 },
        created_at: msg.created_at
      }]
    }

    return agentUIMessage
  })
}

/**
 * Convert Agent UI message history to CLI backend format
 */
export const convertAgentUIHistoryToCLI = (
  agentUIMessages: PlaygroundChatMessage[]
): CLIBackendMessage[] => {
  return agentUIMessages.map((msg) => {
    const cliMessage: CLIBackendMessage = {
      role: msg.role === 'agent' ? 'assistant' : msg.role,
      content: msg.content,
      created_at: typeof msg.created_at === 'number' ? msg.created_at : Date.now()
    }

    // Convert tool calls if present
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      // Check if this is a tool call message (assistant with tool_calls)
      const toolCallMessage = msg.tool_calls.find(tc => tc.role !== 'tool')
      if (toolCallMessage) {
        cliMessage.tool_calls = [{
          id: toolCallMessage.tool_call_id,
          type: 'function',
          function: {
            name: toolCallMessage.tool_name,
            arguments: JSON.stringify(toolCallMessage.tool_args)
          }
        }]
      } else {
        // This is a tool result message
        const toolResult = msg.tool_calls[0]
        cliMessage.role = 'tool'
        cliMessage.tool_call_id = toolResult.tool_call_id
        cliMessage.tool_name = toolResult.tool_name
        cliMessage.content = toolResult.content
      }
    }

    return cliMessage
  })
} 