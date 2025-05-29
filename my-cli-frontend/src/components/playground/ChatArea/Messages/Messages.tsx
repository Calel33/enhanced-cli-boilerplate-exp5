import type { PlaygroundChatMessage } from '@/types/playground'

import { AgentMessage, UserMessage } from './MessageItem'
import Tooltip from '@/components/ui/tooltip'
import { memo, useState } from 'react'
import {
  ToolCallProps,
  ReasoningStepProps,
  ReasoningProps,
  ReferenceData,
  Reference
} from '@/types/playground'
import React, { type FC } from 'react'
import ChatBlankState from './ChatBlankState'
import Icon from '@/components/ui/icon'

interface MessageListProps {
  messages: PlaygroundChatMessage[]
}

interface MessageWrapperProps {
  message: PlaygroundChatMessage
  isLastMessage: boolean
}

interface ReferenceProps {
  references: ReferenceData[]
}

interface ReferenceItemProps {
  reference: Reference
}

const ReferenceItem: FC<ReferenceItemProps> = ({ reference }) => (
  <div className="relative flex h-[63px] w-[190px] cursor-default flex-col justify-between overflow-hidden rounded-md bg-background-secondary p-3 transition-colors hover:bg-background-secondary/80">
    <p className="text-sm font-medium text-primary">{reference.name}</p>
    <p className="truncate text-xs text-primary/40">{reference.content}</p>
  </div>
)

const References: FC<ReferenceProps> = ({ references }) => (
  <div className="flex flex-col gap-4">
    {references.map((referenceData, index) => (
      <div
        key={`${referenceData.query}-${index}`}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-wrap gap-3">
          {referenceData.references.map((reference, refIndex) => (
            <ReferenceItem
              key={`${reference.name}-${reference.meta_data.chunk}-${refIndex}`}
              reference={reference}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
)

const AgentMessageWrapper = ({ message }: MessageWrapperProps) => {
  return (
    <div className="flex flex-col gap-y-9">
      {message.extra_data?.reasoning_steps &&
        message.extra_data.reasoning_steps.length > 0 && (
          <div className="flex items-start gap-4">
            <Tooltip
              delayDuration={0}
              content={<p className="text-accent">Reasoning</p>}
              side="top"
            >
              <Icon type="reasoning" size="sm" />
            </Tooltip>
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase">Reasoning</p>
              <Reasonings reasoning={message.extra_data.reasoning_steps} />
            </div>
          </div>
        )}
      {message.extra_data?.references &&
        message.extra_data.references.length > 0 && (
          <div className="flex items-start gap-4">
            <Tooltip
              delayDuration={0}
              content={<p className="text-accent">References</p>}
              side="top"
            >
              <Icon type="references" size="sm" />
            </Tooltip>
            <div className="flex flex-col gap-3">
              <References references={message.extra_data.references} />
            </div>
          </div>
        )}
      {message.tool_calls && message.tool_calls.length > 0 && (
        <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Tooltip
            delayDuration={0}
            content={<p className="text-accent">Tool Calls</p>}
            side="top"
          >
            <Icon
              type="hammer"
              className="rounded-lg bg-background-secondary p-1"
              size="sm"
              color="secondary"
            />
          </Tooltip>
            <p className="text-xs uppercase text-secondary">Tools Used ({message.tool_calls.length})</p>
          </div>

          <div className="flex flex-col gap-3 pl-8">
            {message.tool_calls.map((toolCall, index) => (
              <ToolComponent
                key={
                  toolCall.tool_call_id ||
                  `${toolCall.tool_name}-${toolCall.created_at}-${index}`
                }
                tools={toolCall}
              />
            ))}
          </div>
        </div>
      )}
      <AgentMessage message={message} />
    </div>
  )
}
const Reasoning: FC<ReasoningStepProps> = ({ index, stepTitle }) => (
  <div className="flex items-center gap-2 text-secondary">
    <div className="flex h-[20px] items-center rounded-md bg-background-secondary p-2">
      <p className="text-xs">STEP {index + 1}</p>
    </div>
    <p className="text-xs">{stepTitle}</p>
  </div>
)
const Reasonings: FC<ReasoningProps> = ({ reasoning }) => (
  <div className="flex flex-col items-start justify-center gap-2">
    {reasoning.map((title, index) => (
      <Reasoning
        key={`${title.title}-${title.action}-${index}`}
        stepTitle={title.title}
        index={index}
      />
    ))}
  </div>
)

const ToolComponent = memo(({ tools }: ToolCallProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Check if this tool call has results (from backend)
  // The content field contains the tool result when available
  const hasResult = tools.content && tools.content.trim() !== ''
  const toolResult = hasResult ? tools.content : null
  
  // Parse tool result if it's a JSON string
  let parsedResult = null
  if (toolResult) {
    try {
      parsedResult = typeof toolResult === 'string' ? JSON.parse(toolResult) : toolResult
    } catch {
      parsedResult = toolResult
    }
  }
  
  // Determine if tool was successful (check for error indicators)
  const isSuccess = !tools.tool_call_error && (!parsedResult || !parsedResult.error)
  
  // Create a brief summary of the result for display
  const getResultSummary = () => {
    if (!hasResult) return 'No result available'
    
    if (typeof parsedResult === 'object' && parsedResult !== null) {
      if (parsedResult.error) return `Error: ${parsedResult.error}`
      
      // Try to extract meaningful summary from object
      const keys = Object.keys(parsedResult)
      if (keys.length === 0) return 'Empty result'
      if (keys.length === 1) return `${keys[0]}: ${String(parsedResult[keys[0]]).substring(0, 50)}...`
      return `${keys.length} properties returned`
    }
    
    const resultStr = String(parsedResult)
    return resultStr.length > 100 ? `${resultStr.substring(0, 100)}...` : resultStr
  }
  
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Tool name and status */}
      <div 
        className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 ${
          isSuccess 
            ? 'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/30 dark:hover:bg-green-950/50' 
            : 'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-950/50'
        } ${isExpanded ? 'shadow-sm' : ''}`}
        onClick={() => hasResult && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon type="hammer" size="xs" className="text-gray-500" />
            <p className={`font-dmmono text-sm font-medium ${
              isSuccess ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {tools.tool_name}
            </p>
            {isSuccess ? (
              <Icon type="check" size="xs" className="text-green-600 dark:text-green-400" />
            ) : (
              <Icon type="x" size="xs" className="text-red-600 dark:text-red-400" />
            )}
          </div>
          
          {hasResult && (
            <Icon 
              type={isExpanded ? "chevron-up" : "chevron-down"} 
              size="xs" 
              className="text-gray-500"
            />
          )}
        </div>
        
        {/* Show summary when collapsed */}
        {hasResult && !isExpanded && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {getResultSummary()}
            </p>
          </div>
        )}
      </div>
      
      {/* Tool result display */}
      {hasResult && isExpanded && (
        <div className="ml-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Icon type="hammer" size="xs" className="text-gray-500" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
              Tool Result
            </p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {typeof parsedResult === 'object' ? (
              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words font-mono bg-white dark:bg-gray-900 p-3 rounded border">
                {JSON.stringify(parsedResult, null, 2)}
              </pre>
            ) : (
              <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words bg-white dark:bg-gray-900 p-3 rounded border">
                {String(parsedResult)}
              </div>
            )}
          </div>
          
          {/* Tool execution time if available */}
          {tools.metrics?.time && tools.metrics.time > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500">
                Execution time: {tools.metrics.time}ms
              </p>
            </div>
          )}
        </div>
      )}
  </div>
  )
})
ToolComponent.displayName = 'ToolComponent'

const Messages = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return <ChatBlankState />
  }

  return (
    <>
      {messages.map((message, index) => {
        const key = `${message.role}-${message.created_at}-${index}`
        const isLastMessage = index === messages.length - 1

        if (message.role === 'agent') {
          return (
            <AgentMessageWrapper
              key={key}
              message={message}
              isLastMessage={isLastMessage}
            />
          )
        }
        return <UserMessage key={key} message={message} />
      })}
    </>
  )
}

export default Messages
