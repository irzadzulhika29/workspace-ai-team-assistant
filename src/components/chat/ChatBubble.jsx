import React, { memo, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Bot, User } from 'lucide-react'
import AgentCard from '../ui/AgentCard'
import SourceCitation from './SourceCitation'

const MARKDOWN_SYNTAX_RE = /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|>\s)|\|.*\||```|\*\*|__/

const normalizeAiContent = (content) => {
  if (typeof content !== 'string' || content.length === 0) {
    return content
  }

  if (MARKDOWN_SYNTAX_RE.test(content)) {
    return content
  }

  return content
    .split('\n')
    .map((line) => line.trimEnd())
    .join('  \n')
}

/**
 * ChatBubble — renders a single chat message (user or AI)
 * @param {import('../../store/chatStore').ChatMessage} props.message
 * @param {Function} props.onSendEmail - callback untuk kirim email
 * @param {Function} props.onRegenerateEmail - callback untuk buat ulang draft
 */
function ChatBubble({ message, onSendEmail, onRegenerateEmail }) {
  const isUser = message.role === 'user'

  const renderedAiContent = useMemo(
    () => (isUser ? '' : normalizeAiContent(message.content)),
    [isUser, message.content],
  )

  const hasActions = Boolean(
    message.actionResults?.jira_ticket_url ||
    message.actionResults?.calendar_event_url ||
    message.actionResults?.email_draft,
  )
  const hasSources = (message.sources?.length ?? 0) > 0
  const timeLabel = useMemo(() => {
    const time = new Date(message.timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })

    if (!message.processingTime) {
      return time
    }

    return `${time} · ${(message.processingTime / 1000).toFixed(1)}s`
  }, [message.processingTime, message.timestamp])

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
          px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-brand-600 text-white rounded-2xl rounded-tr-md shadow-[0_12px_24px_rgba(0,97,132,0.18)]'
            : 'bg-surface-raised text-slateui-900 rounded-2xl rounded-tl-md shadow-[0_14px_30px_rgba(25,28,29,0.05)]'
          }
        `}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-white">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none
              prose-p:my-1.5 prose-p:leading-relaxed
              prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5
              prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5
              prose-li:my-0.5
              prose-strong:font-bold prose-strong:text-gray-900
              prose-headings:font-semibold prose-headings:my-2
              prose-a:text-brand-600 prose-a:underline
              prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:text-xs
              prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-3 prose-pre:overflow-x-auto
              prose-blockquote:border-l-2 prose-blockquote:border-slate-300 prose-blockquote:pl-3 prose-blockquote:text-slate-500
              prose-table:w-full prose-table:border-collapse prose-table:my-3
              prose-th:bg-slate-100 prose-th:border prose-th:border-slate-300 prose-th:px-3 prose-th:py-2 prose-th:text-left
              prose-td:border prose-td:border-slate-300 prose-td:px-3 prose-td:py-2
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {renderedAiContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp + processing time */}
        <span className="text-[10px] text-slate-400 px-1 font-mono">
          {timeLabel}
        </span>

        {/* Source citations (RAG) */}
        {hasSources && (
          <MemoSourceList sources={message.sources} />
        )}

        {/* Action result card (PM Agent) */}
        {hasActions && (
          <AgentCard
            jiraUrl={message.actionResults.jira_ticket_url}
            calendarUrl={message.actionResults.calendar_event_url}
            emailDraft={message.actionResults.email_draft}
            agentUsed={message.agentUsed}
            onSendEmail={onSendEmail}
            onRegenerateEmail={onRegenerateEmail}
          />
        )}
      </div>
    </div>
  )
}

function SourceList({ sources }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {sources.map((src, i) => (
        <SourceCitation key={i} filename={src.filename} page={src.page} />
      ))}
    </div>
  )
}

const MemoSourceList = memo(SourceList)

function areMessagePropsEqual(prevProps, nextProps) {
  return (
    prevProps.message === nextProps.message &&
    prevProps.onSendEmail === nextProps.onSendEmail &&
    prevProps.onRegenerateEmail === nextProps.onRegenerateEmail
  )
}

export default memo(ChatBubble, areMessagePropsEqual)
