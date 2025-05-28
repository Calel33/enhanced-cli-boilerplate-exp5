'use client'

import * as React from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { usePlaygroundStore } from '@/store'
import { useQueryState } from 'nuqs'
import Icon from '@/components/ui/icon'
import { useEffect } from 'react'
import useChatActions from '@/hooks/useChatActions'
import { createCLIAgent } from '@/api/cli-backend'

export function AgentSelector() {
  const { setMessages, setSelectedModel, setHasStorage, selectedEndpoint } =
    usePlaygroundStore()
  const { focusChatInput } = useChatActions()
  const [agentId, setAgentId] = useQueryState('agent', {
    parse: (value) => value || undefined,
    history: 'push'
  })
  const [, setSessionId] = useQueryState('session')

  // Create CLI agent based on current endpoint
  const cliAgent = React.useMemo(() => {
    if (!selectedEndpoint) return null
    return createCLIAgent(selectedEndpoint)
  }, [selectedEndpoint])

  // Auto-select CLI agent when component mounts or endpoint changes
  useEffect(() => {
    if (cliAgent && (!agentId || agentId !== cliAgent.value)) {
      setAgentId(cliAgent.value)
      setSelectedModel(cliAgent.model.provider)
      setHasStorage(!!cliAgent.storage)
      focusChatInput()
    }
  }, [cliAgent, agentId, setAgentId, setSelectedModel, setHasStorage, focusChatInput])

  const handleOnValueChange = (value: string) => {
    if (!cliAgent) return
    
    // For CLI backend, we only have one agent, so just ensure it's selected
    if (value === cliAgent.value) {
      setSelectedModel(cliAgent.model.provider)
      setHasStorage(!!cliAgent.storage)
      setMessages([])
      setSessionId(null)
      focusChatInput()
    }
  }

  if (!selectedEndpoint) {
    return (
      <div className="h-9 w-full rounded-xl border border-primary/15 bg-primaryAccent px-3 py-2 text-xs font-medium uppercase text-primary/50">
        Configure endpoint first
      </div>
    )
  }

  if (!cliAgent) {
    return (
      <div className="h-9 w-full rounded-xl border border-primary/15 bg-primaryAccent px-3 py-2 text-xs font-medium uppercase text-primary/50">
        Loading CLI agent...
      </div>
    )
  }

  return (
    <Select
      value={agentId || ''}
      onValueChange={(value) => handleOnValueChange(value)}
    >
      <SelectTrigger className="h-9 w-full rounded-xl border border-primary/15 bg-primaryAccent text-xs font-medium uppercase">
        <SelectValue placeholder="Select Agent" />
      </SelectTrigger>
      <SelectContent className="border-none bg-primaryAccent font-dmmono shadow-lg">
        <SelectItem
          className="cursor-pointer"
          key={cliAgent.value}
          value={cliAgent.value}
        >
          <div className="flex items-center gap-3 text-xs font-medium uppercase">
            <Icon type={'agent'} size="xs" />
            {cliAgent.label}
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
