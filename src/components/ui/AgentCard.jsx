import React from 'react'
import DOMPurify from 'dompurify'
import { ChevronDown, ExternalLink, Calendar, Mail, Ticket } from 'lucide-react'

/**
 * AgentCard — displays structured results from PM Agent (Jira + Google Calendar)
 * @param {Object} props
 * @param {string} props.jiraUrl
 * @param {string} props.calendarUrl
 * @param {string} props.agentUsed
 * @param {Object} props.emailDraft
 */
export default function AgentCard({ jiraUrl, calendarUrl, emailDraft, agentUsed }) {
  if (!jiraUrl && !calendarUrl && !emailDraft) return null

  const safeEmailHtml = emailDraft?.message
    ? DOMPurify.sanitize(emailDraft.message)
    : ''

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

      {emailDraft && (
        <details className="rounded-md border border-amber-100 bg-amber-50">
          <summary className="
            flex cursor-pointer list-none items-center gap-3 p-3
            text-left marker:content-none
          ">
            <Mail size={16} className="text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">Draft Email Siap Direview</p>
              <p className="text-xs text-amber-700 truncate">
                Subject: {emailDraft.subject || '(tanpa subjek)'}
              </p>
              <p className="text-xs text-amber-600 truncate">
                To: {emailDraft.to || 'belum ditentukan'}
              </p>
            </div>
            <ChevronDown size={14} className="text-amber-500 flex-shrink-0" />
          </summary>

          <div className="border-t border-amber-100 px-3 py-3">
            <div
              className="
                max-h-80 overflow-auto rounded-md border border-amber-100 bg-white p-3
                text-sm leading-relaxed
              "
              dangerouslySetInnerHTML={{ __html: safeEmailHtml }}
            />
          </div>
        </details>
      )}
    </div>
  )
}
