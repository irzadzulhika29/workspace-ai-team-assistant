import React, { memo, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Bot, FileText, Mail, User } from 'lucide-react'
import { Avatar, AvatarFallback, Card, CardContent } from '@/components/ui'
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

  const roleLabel = isUser ? 'You' : (message.agentUsed ? `${message.agentUsed} agent` : 'Supervisor Agent')
  const bubbleClassName = isUser
    ? 'bg-primary-500 text-white rounded-[1.4rem] rounded-br-md shadow-stat'
    : 'border border-neutral-200 bg-white text-neutral-800 rounded-[1.4rem] rounded-bl-md shadow-sm'

  return (
    <div className={`flex items-start gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <Avatar size="sm" className={isUser ? 'bg-primary-500 text-white' : 'bg-neutral-900 text-white'}>
        <AvatarFallback className={isUser ? 'bg-primary-500 text-white' : 'bg-neutral-900 text-white'}>
          {isUser ? <User size={14} /> : <Bot size={14} />}
        </AvatarFallback>
      </Avatar>

      {/* Bubble + extras */}
      <div className={`flex max-w-[78%] flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold text-neutral-700">{roleLabel}</span>
          <span className="text-[10px] font-mono text-neutral-400">{timeLabel}</span>
        </div>

        {/* Bubble */}
        <div className={`px-4 py-3 text-sm leading-relaxed ${bubbleClassName}`}>
          {isUser ? (
            <div className="space-y-3">
              <p className="whitespace-pre-wrap break-words text-white">{message.content}</p>
              {message.forwardedEmail && (
                <Card className="rounded-xl border-white/15 bg-white/10 shadow-none hover:shadow-none">
                  <CardContent className="space-y-2 px-3 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                      <Mail size={13} />
                      Email sumber
                    </div>
                    <div className="space-y-1 text-xs leading-relaxed text-white/95">
                      <p className="break-words">
                        <span className="text-white/65">Dari:</span>{' '}
                        {message.forwardedEmail.fromName || message.forwardedEmail.from || '-'}
                      </p>
                      <p className="break-words">
                        <span className="text-white/65">Subject:</span>{' '}
                        {message.forwardedEmail.subject || '(tanpa subjek)'}
                      </p>
                      {message.forwardedEmail.date && (
                        <p className="break-words">
                          <span className="text-white/65">Tanggal:</span>{' '}
                          {message.forwardedEmail.date}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {message.promptCard && (
                <Card className="rounded-xl border-white/15 bg-white/10 shadow-none hover:shadow-none">
                  <CardContent className="space-y-2 px-3 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                      <Mail size={13} />
                      {message.promptCard.badge || 'Prompt Context'}
                    </div>
                    <div className="space-y-1 text-xs leading-relaxed text-white/95">
                      <p className="break-words font-semibold text-white">
                        {message.promptCard.title || '(tanpa judul)'}
                      </p>
                      {message.promptCard.from && (
                        <p className="break-words">
                          <span className="text-white/65">Dari:</span>{' '}
                          {message.promptCard.from}
                        </p>
                      )}
                      {message.promptCard.date && (
                        <p className="break-words">
                          <span className="text-white/65">Tanggal:</span>{' '}
                          {message.promptCard.date}
                        </p>
                      )}
                      {message.promptCard.summary && (
                        <p className="line-clamp-4 break-words text-white/90">
                          {message.promptCard.summary}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {message.documentAttachment?.name && (
                <Card className="rounded-xl border-white/15 bg-white/10 shadow-none hover:shadow-none">
                  <CardContent className="space-y-2 px-3 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                      <FileText size={13} />
                      Dokumen
                    </div>
                    <p className="break-words text-xs leading-relaxed text-white/95">
                      {message.documentAttachment.name}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none
              prose-p:my-1.5 prose-p:leading-relaxed
              prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5
              prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5
              prose-li:my-0.5
              prose-strong:font-bold prose-strong:text-neutral-900
              prose-headings:my-2 prose-headings:font-semibold prose-headings:text-neutral-900
              prose-a:text-primary-500 prose-a:underline
              prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1 prose-code:text-xs
              prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-neutral-900 prose-pre:p-3 prose-pre:text-neutral-100
              prose-blockquote:border-l-2 prose-blockquote:border-neutral-300 prose-blockquote:pl-3 prose-blockquote:text-neutral-500
              prose-table:w-full prose-table:border-collapse prose-table:my-3
              prose-th:border prose-th:border-neutral-300 prose-th:bg-neutral-100 prose-th:px-3 prose-th:py-2 prose-th:text-left
              prose-td:border prose-td:border-neutral-300 prose-td:px-3 prose-td:py-2
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
    <div className="mt-1 flex flex-wrap gap-1.5 px-1">
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
