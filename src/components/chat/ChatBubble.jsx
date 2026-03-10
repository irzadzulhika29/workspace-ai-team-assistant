import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import { Bot, User } from 'lucide-react'
import AgentCard from '../ui/AgentCard'
import SourceCitation from './SourceCitation'

/**
 * ChatBubble — renders a single chat message (user or AI)
 * @param {import('../../store/chatStore').ChatMessage} props.message
 */
export default function ChatBubble({ message }) {
  const isUser = message.role === 'user'

  const safeContent = isUser
    ? DOMPurify.sanitize(message.content)
    : message.content // react-markdown handles its own escaping

  const hasActions = message.actionResults?.jira_ticket_url || message.actionResults?.calendar_event_url
  const hasSources = message.sources?.length > 0

  return (
    <div className={`flex gap-3 items-start animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white
        ${isUser ? 'bg-brand-600' : 'bg-slate-700'}
      `}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble + extras */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div className={`
          px-4 py-2.5 text-sm leading-relaxed shadow-sm
          ${isUser
            ? 'bg-brand-600 text-white rounded-l-xl rounded-tr-xl'
            : 'bg-white border border-gray-200 text-gray-800 rounded-r-xl rounded-tl-xl'
          }
        `}>
          {isUser ? (
            <p dangerouslySetInnerHTML={{ __html: safeContent }} />
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-brand-600">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp + processing time */}
        <span className="text-[10px] text-slate-400 px-1 font-mono">
          {new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          {message.processingTime && ` · ${(message.processingTime / 1000).toFixed(1)}s`}
        </span>

        {/* Source citations (RAG) */}
        {hasSources && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {message.sources.map((src, i) => (
              <SourceCitation key={i} filename={src.filename} page={src.page} />
            ))}
          </div>
        )}

        {/* Action result card (PM Agent) */}
        {hasActions && (
          <AgentCard
            jiraUrl={message.actionResults.jira_ticket_url}
            calendarUrl={message.actionResults.calendar_event_url}
            agentUsed={message.agentUsed}
          />
        )}
      </div>
    </div>
  )
}
