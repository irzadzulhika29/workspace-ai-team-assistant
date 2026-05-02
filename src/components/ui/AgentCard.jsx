import React, { useState } from 'react'
import DOMPurify from 'dompurify'
import { ChevronDown, ExternalLink, Calendar, Mail, Ticket, Send, RefreshCw } from 'lucide-react'
import { Badge, Button, Card, CardContent, Input } from '@/components/ui'

/**
 * AgentCard — displays structured results from PM Agent (Jira + Google Calendar)
 * @param {Object} props
 * @param {string} props.jiraUrl
 * @param {string} props.calendarUrl
 * @param {string} props.agentUsed
 * @param {Object} props.emailDraft
 * @param {Function} props.onSendEmail - callback untuk kirim email
 * @param {Function} props.onRegenerateEmail - callback untuk buat ulang draft
 */
export default function AgentCard({ jiraUrl, calendarUrl, emailDraft, agentUsed, onSendEmail, onRegenerateEmail }) {
  const [improvementText, setImprovementText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [validationError, setValidationError] = useState('')

  if (!jiraUrl && !calendarUrl && !emailDraft) return null

  const safeEmailHtml = emailDraft?.message
    ? DOMPurify.sanitize(emailDraft.message)
    : ''

  const handleSendEmail = async () => {
    if (!onSendEmail || !emailDraft) return

    setValidationError('')
    setIsSending(true)
    try {
      await onSendEmail(emailDraft)
    } finally {
      setIsSending(false)
    }
  }

  const handleRegenerateEmail = async () => {
    if (!onRegenerateEmail || !emailDraft) return

    if (!improvementText.trim()) {
      setValidationError('Silakan masukkan perbaikan yang diinginkan.')
      return
    }

    setValidationError('')
    setIsRegenerating(true)
    try {
      await onRegenerateEmail(emailDraft, improvementText)
      setImprovementText('') // Clear input after regenerate
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <Card className="mt-2 animate-fade-in rounded-2xl hover:shadow-sm">
      <CardContent className="space-y-3 px-4 py-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {agentUsed ?? 'pm'} agent
          </Badge>
          <span className="text-xs text-neutral-400">action results</span>
        </div>

        {jiraUrl && (
          <a
            href={jiraUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-info/20 bg-info-bg/50 p-3 transition-colors duration-150 hover:bg-info-bg"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-info shadow-sm">
              <Ticket size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900">Jira Ticket Dibuat</p>
              <p className="truncate text-xs text-neutral-500">{jiraUrl}</p>
            </div>
            <ExternalLink size={14} className="flex-shrink-0 text-info transition-colors group-hover:text-neutral-900" />
          </a>
        )}

        {calendarUrl && (
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-success/20 bg-success-bg/60 p-3 transition-colors duration-150 hover:bg-success-bg"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-success shadow-sm">
              <Calendar size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900">Event Kalender Dibuat</p>
              <p className="truncate text-xs text-neutral-500">{calendarUrl}</p>
            </div>
            <ExternalLink size={14} className="flex-shrink-0 text-success transition-colors group-hover:text-neutral-900" />
          </a>
        )}

        {emailDraft && (
          <div className="rounded-2xl border border-warning/25 bg-warning-bg/55">
            <details>
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-left marker:content-none">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-warning shadow-sm">
                  <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900">Draft Email Siap Direview</p>
                  <p className="truncate text-xs text-neutral-600">
                    Subject: {emailDraft.subject || '(tanpa subjek)'}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    To: {emailDraft.to || 'belum ditentukan'}
                  </p>
                </div>
                <ChevronDown size={14} className="flex-shrink-0 text-warning" />
              </summary>

              <div className="border-t border-warning/20 px-4 py-4">
                <div
                  className="max-h-80 overflow-auto rounded-xl border border-warning/20 bg-white p-3 text-sm leading-relaxed text-neutral-700"
                  dangerouslySetInnerHTML={{ __html: safeEmailHtml }}
                />
              </div>
            </details>

            <div className="space-y-3 border-t border-warning/20 px-4 py-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700">
                  Perbaikan
                </label>
                <Input
                  type="text"
                  value={improvementText}
                  onChange={(event) => setImprovementText(event.target.value)}
                  placeholder="Contoh: Buat lebih formal, tambahkan salam pembuka..."
                  className="rounded-xl border-warning/25 bg-white"
                  disabled={isSending || isRegenerating}
                />
                {validationError ? (
                  <p className="text-xs text-error">{validationError}</p>
                ) : null}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendEmail}
                  disabled={isSending || isRegenerating || !emailDraft.to}
                  className="flex-1"
                  title={!emailDraft.to ? 'Email tujuan belum ditentukan' : 'Kirim email sekarang'}
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Kirim</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleRegenerateEmail}
                  disabled={isSending || isRegenerating}
                  variant="outline"
                  className="flex-1"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Membuat...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>Buat Ulang</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
