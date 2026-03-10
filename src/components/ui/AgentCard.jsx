import { ExternalLink, Calendar, Ticket } from 'lucide-react'

/**
 * AgentCard — displays structured results from PM Agent (Jira + Google Calendar)
 * @param {Object} props
 * @param {string} props.jiraUrl
 * @param {string} props.calendarUrl
 * @param {string} props.agentUsed
 */
export default function AgentCard({ jiraUrl, calendarUrl, agentUsed }) {
  if (!jiraUrl && !calendarUrl) return null

  return (
    <div className="
      border border-gray-200 rounded-lg p-4 bg-white shadow-sm
      mt-2 space-y-3 animate-fade-in
    ">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
        {agentUsed ?? 'pm'} agent — action results
      </div>

      {jiraUrl && (
        <a
          href={jiraUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-3 p-3 rounded-md
            bg-blue-50 border border-blue-100
            hover:bg-blue-100 transition-colors duration-150
            group
          "
        >
          <Ticket size={16} className="text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-700">Jira Ticket Dibuat</p>
            <p className="text-xs text-blue-500 truncate">{jiraUrl}</p>
          </div>
          <ExternalLink size={14} className="text-blue-400 flex-shrink-0 group-hover:text-blue-600" />
        </a>
      )}

      {calendarUrl && (
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-3 p-3 rounded-md
            bg-green-50 border border-green-100
            hover:bg-green-100 transition-colors duration-150
            group
          "
        >
          <Calendar size={16} className="text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-700">Event Kalender Dibuat</p>
            <p className="text-xs text-green-500 truncate">{calendarUrl}</p>
          </div>
          <ExternalLink size={14} className="text-green-400 flex-shrink-0 group-hover:text-green-600" />
        </a>
      )}
    </div>
  )
}
