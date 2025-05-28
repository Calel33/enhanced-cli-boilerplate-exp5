import { useCallback } from 'react'
import { toast } from 'sonner'
import { useQueryState } from 'nuqs'

import { usePlaygroundStore } from '../store'
import useChatActions from '@/hooks/useChatActions'
import { 
  sendCLIChatMessage, 
  convertCLIMessagesToAgentUI, 
  convertAgentUIHistoryToCLI,
  checkCLIBackendStatus 
} from '@/api/cli-backend'

/**
 * Custom hook for handling CLI backend communication
 * Unlike the standard Agent UI streaming, our CLI backend returns complete responses
 */
const useCLIStreamHandler = () => {
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const messages = usePlaygroundStore((state) => state.messages)
  const { addMessage, focusChatInput } = useChatActions()
  const [sessionId] = useQueryState('session')
  const selectedEndpoint = usePlaygroundStore((state) => state.selectedEndpoint)
  const setStreamingErrorMessage = usePlaygroundStore(
    (state) => state.setStreamingErrorMessage
  )
  const setIsStreaming = usePlaygroundStore((state) => state.setIsStreaming)

  const updateMessagesWithErrorState = useCallback(() => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages]
      const lastMessage = newMessages[newMessages.length - 1]
      if (lastMessage && lastMessage.role === 'agent') {
        lastMessage.streamingError = true
      }
      return newMessages
    })
  }, [setMessages])

  const handleStreamResponse = useCallback(
    async (input: string | FormData) => {
      setIsStreaming(true)
      setStreamingErrorMessage('')

      // Extract message from input
      const message = input instanceof FormData ? 
        (input.get('message') as string) : input

      if (!message?.trim()) {
        setIsStreaming(false)
        return
      }

      // Check if CLI backend is available
      const isBackendAvailable = await checkCLIBackendStatus(selectedEndpoint)
      if (!isBackendAvailable) {
        toast.error('CLI backend is not available. Please ensure the server is running on the configured endpoint.')
        setIsStreaming(false)
        return
      }

      // Clean up any previous error messages
      setMessages((prevMessages) => {
        if (prevMessages.length >= 2) {
          const lastMessage = prevMessages[prevMessages.length - 1]
          const secondLastMessage = prevMessages[prevMessages.length - 2]
          if (
            lastMessage.role === 'agent' &&
            lastMessage.streamingError &&
            secondLastMessage.role === 'user'
          ) {
            return prevMessages.slice(0, -2)
          }
        }
        return prevMessages
      })

      // Add user message
      addMessage({
        role: 'user',
        content: message,
        created_at: Date.now()
      })

      // Add placeholder agent message
      addMessage({
        role: 'agent',
        content: '',
        tool_calls: [],
        streamingError: false,
        created_at: Date.now() + 1
      })

      try {
        // Convert conversation history to CLI format
        const history = convertAgentUIHistoryToCLI(messages.slice(-10)) // Last 10 messages for context

        // Send message to CLI backend
        const response = await sendCLIChatMessage(selectedEndpoint, {
          message,
          sessionId: sessionId || undefined,
          history
        })

        // Convert CLI response to Agent UI format
        const agentUIMessages = convertCLIMessagesToAgentUI(response)

        // Update messages with the response
        setMessages((prevMessages) => {
          // Remove the placeholder agent message
          const messagesWithoutPlaceholder = prevMessages.slice(0, -1)
          
          // Add all response messages
          return [...messagesWithoutPlaceholder, ...agentUIMessages]
        })

      } catch (error) {
        console.error('Error in CLI chat:', error)
        updateMessagesWithErrorState()
        setStreamingErrorMessage(
          error instanceof Error ? error.message : 'An unknown error occurred'
        )
        toast.error(`Chat error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        focusChatInput()
        setIsStreaming(false)
      }
    },
    [
      setMessages,
      messages,
      addMessage,
      updateMessagesWithErrorState,
      selectedEndpoint,
      sessionId,
      setStreamingErrorMessage,
      setIsStreaming,
      focusChatInput
    ]
  )

  return { handleStreamResponse }
}

export default useCLIStreamHandler 