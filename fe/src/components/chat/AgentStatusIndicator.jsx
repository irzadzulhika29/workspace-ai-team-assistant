import React from 'react'
import { Badge } from '@/components/ui'

/**
 * AgentStatusIndicator — shows which sub-agent is currently processing
 * Displayed between user message send and AI response arrival.
 * @param {string} props.agentName - e.g. "Project Manager Agent"
 */
export default function AgentStatusIndicator({ agentName = 'Supervisor Agent' }) {
  return (
    <div className="animate-fade-in px-1 py-1">
      <div className="inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-1" aria-label="Memproses">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary-500"
              style={{
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <span className="text-xs text-neutral-500">
          Mendelegasikan ke
        </span>
        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
          {agentName}
        </Badge>
      </div>
    </div>
  )
}
