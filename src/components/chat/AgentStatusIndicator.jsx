/**
 * AgentStatusIndicator — shows which sub-agent is currently processing
 * Displayed between user message send and AI response arrival.
 * @param {string} props.agentName - e.g. "Project Manager Agent"
 */
export default function AgentStatusIndicator({ agentName = 'Supervisor Agent' }) {
  return (
    <div className="flex items-center gap-2.5 px-1 py-1 text-sm text-slate-500 animate-fade-in">
      {/* Animated triple-dot */}
      <div className="flex gap-1 items-center" aria-label="Memproses">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-brand-500 rounded-full"
            style={{
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <span className="text-xs font-medium">
        Mendelegasikan ke <span className="text-brand-600 font-semibold">{agentName}…</span>
      </span>
    </div>
  )
}
