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
  const [emailExpanded, setEmailExpanded] = useState(true)

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
    <Card className="mt-2 animate-fade-in border-neutral-200 bg-white shadow-sm hover:shadow-md">
      <CardContent className="space-y-3 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {agentUsed ?? 'pm'} agent
          </Badge>
          <span className="text-[11px] text-neutral-400">Action results</span>
        </div>

        {jiraUrl && (
          <a
            href={jiraUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-info/20 bg-info-bg/45 p-3 transition-colors duration-150 hover:bg-info-bg/70"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-info shadow-sm">
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
            className="group flex items-center gap-3 rounded-xl border border-success/20 bg-success-bg/50 p-3 transition-colors duration-150 hover:bg-success-bg/70"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-success shadow-sm">
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
          <section className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/70">
            <button
              type="button"
              onClick={() => setEmailExpanded((current) => !current)}
              className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-neutral-100/80"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-warning-bg text-warning">
                <Mail size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-neutral-900">Draft Email</p>
                  <Badge variant="warning" className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                    Review
                  </Badge>
                </div>
                <p className="mt-1 truncate text-sm text-neutral-700">
                  {emailDraft.subject || '(tanpa subjek)'}
                </p>
                <p className="mt-1 truncate text-xs text-neutral-500">
                  Kepada: {emailDraft.to || 'belum ditentukan'}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`mt-1 flex-shrink-0 text-neutral-400 transition-transform ${emailExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {emailExpanded && (
              <>
                <div className="border-t border-neutral-200 bg-white px-4 py-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-600">
                      Subject: {emailDraft.subject || '(tanpa subjek)'}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-600">
                      To: {emailDraft.to || 'belum ditentukan'}
                    </span>
                  </div>

                  <div
                    className="max-h-80 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-700"
                    dangerouslySetInnerHTML={{ __html: safeEmailHtml }}
                  />

                  {!emailDraft.to ? (
                    <p className="mt-3 text-xs text-warning">
                      Alamat tujuan belum tersedia. Lengkapi penerima sebelum mengirim email.
                    </p>
                  ) : null}
                </div>

                <div className="border-t border-neutral-200 bg-neutral-50/80 px-4 py-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Perbaikan Draft
                    </label>
                    <Input
                      type="text"
                      value={improvementText}
                      onChange={(event) => setImprovementText(event.target.value)}
                      placeholder="Contoh: Buat lebih formal, ringkas, atau tambahkan CTA."
                      className="bg-white"
                      disabled={isSending || isRegenerating}
                    />
                    {validationError ? (
                      <p className="text-xs text-error">{validationError}</p>
                    ) : null}
                  </div>

                  <div className="mt-3 flex gap-2">
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
                          <span>Kirim Email</span>
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
                          <span>Revisi Draft</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </CardContent>
    </Card>
  )
}
