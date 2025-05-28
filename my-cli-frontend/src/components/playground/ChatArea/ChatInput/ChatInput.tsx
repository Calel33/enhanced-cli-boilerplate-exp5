'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { TextArea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { usePlaygroundStore } from '@/store'
import useCLIStreamHandler from '@/hooks/useCLIStreamHandler'
import Icon from '@/components/ui/icon'

const ChatInput = () => {
  const { chatInputRef } = usePlaygroundStore()

  const { handleStreamResponse } = useCLIStreamHandler()
  const [inputMessage, setInputMessage] = useState('')
  const isStreaming = usePlaygroundStore((state) => state.isStreaming)
  const selectedEndpoint = usePlaygroundStore((state) => state.selectedEndpoint)
  
  const handleSubmit = async () => {
    if (!inputMessage.trim()) return

    const currentMessage = inputMessage
    setInputMessage('')

    try {
      await handleStreamResponse(currentMessage)
    } catch (error) {
      toast.error(
        `Error in handleSubmit: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  // For CLI backend, we don't need agent selection - always enabled if endpoint is set
  const isInputDisabled = !selectedEndpoint || isStreaming

  return (
    <div className="relative mx-auto mb-1 flex w-full max-w-2xl items-end justify-center gap-x-2 font-geist">
      <TextArea
        placeholder={isInputDisabled ? 'Configure CLI backend endpoint first...' : 'Ask anything about crypto, stocks, or use any available tools...'}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === 'Enter' &&
            !e.nativeEvent.isComposing &&
            !e.shiftKey &&
            !isStreaming
          ) {
            e.preventDefault()
            handleSubmit()
          }
        }}
        className="w-full border border-accent bg-primaryAccent px-4 text-sm text-primary focus:border-accent"
        disabled={isInputDisabled}
        ref={chatInputRef}
      />
      <Button
        onClick={handleSubmit}
        disabled={isInputDisabled || !inputMessage.trim()}
        size="icon"
        className="rounded-xl bg-primary p-5 text-primaryAccent"
      >
        <Icon type="send" color="primaryAccent" />
      </Button>
    </div>
  )
}

export default ChatInput
