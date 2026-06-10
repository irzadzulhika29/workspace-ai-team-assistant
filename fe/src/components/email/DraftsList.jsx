import React, { useEffect, useState } from 'react';
import { Send, Edit3, Trash2, Mail, Clock, Save, Check, AlertTriangle, Sparkles } from 'lucide-react';
import { useEmailStore } from '../../store/emailStore';
import axios from 'axios';
import { urls } from '../../services/api';
import { getAuthenticatedUser, getWebhookUserIdentity } from '../../services/authService';
import { Modal, Button } from '@/components/ui';

const htmlToPlainText = (html) =>
  String(html || '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const getEditableBody = (draft) => {
  if (draft.body_text) return draft.body_text;
  if (draft.body_html) return htmlToPlainText(draft.body_html);
  return '';
};

const buildEditedBodyHtml = (plainText) =>
  String(plainText || '')
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');

const buttonClassName = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50',
  danger:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50',
  ghost:
    'inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
  icon:
    'inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50',
  iconDanger:
    'inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600',
};

function SendDraftModal({ open, draft, onClose, onConfirm, sending }) {
  if (!draft) return null;

  const handleConfirm = async () => {
    await onConfirm(draft);
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Modal.Header onClose={onClose}>
        <Modal.Title>Send this email?</Modal.Title>
        <Modal.Description>
          Email ini akan dikirim ke <span className="font-medium text-neutral-700">{draft.to_email || '—'}</span>.
        </Modal.Description>
      </Modal.Header>
      <Modal.Body>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">To</dt>
            <dd className="mt-1 text-neutral-900">{draft.to_email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Subject</dt>
            <dd className="mt-1 text-neutral-900">{draft.subject || '(No subject)'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Body</dt>
            <dd className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-neutral-700 custom-scrollbar">
              {getEditableBody(draft) || '(empty)'}
            </dd>
          </div>
        </dl>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" onClick={onClose} disabled={sending}>
          Cancel
        </Button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={sending || !draft.to_email}
          className={buttonClassName.primary}
        >
          <Send className="h-4 w-4" />
          <span>{sending ? 'Sending...' : 'Send'}</span>
        </button>
      </Modal.Footer>
    </Modal>
  );
}

function DeleteDraftModal({ open, draft, onClose, onConfirm, deleting }) {
  if (!draft) return null;

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <Modal.Body>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-neutral-900">Delete this draft?</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Tindakan ini tidak dapat dibatalkan. Draft
              {draft.subject ? (
                <>
                  {' '}
                  <span className="font-medium text-neutral-700">&ldquo;{draft.subject}&rdquo;</span>
                </>
              ) : (
                ' ini'
              )}{' '}
              akan dihapus secara permanen.
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <button
          type="button"
          onClick={() => onConfirm(draft.id)}
          disabled={deleting}
          className={buttonClassName.danger}
        >
          <Trash2 className="h-4 w-4" />
          <span>{deleting ? 'Deleting...' : 'Delete'}</span>
        </button>
      </Modal.Footer>
    </Modal>
  );
}

function ReviseDraftModal({ open, draft, onClose, onConfirm, revising }) {
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (open) setInstructions('');
  }, [open, draft?.id]);

  if (!draft) return null;

  const canSubmit = instructions.trim().length > 0 && !revising;

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        <Modal.Title>Revise draft with AI</Modal.Title>
        <Modal.Description>
          Berikan instruksi revisi untuk AI. Draft akan diperbarui sesuai permintaan Anda.
        </Modal.Description>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 custom-scrollbar">
          {getEditableBody(draft) || '(empty draft body)'}
        </div>
        <label
          htmlFor="revise-instructions"
          className="mb-2 block text-sm font-medium text-neutral-700"
        >
          Revision instructions
        </label>
        <textarea
          id="revise-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder='Contoh: "Make it more formal", "Add deadline information", atau instruksi bahasa Indonesia.'
          rows={4}
          disabled={revising}
          className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" onClick={onClose} disabled={revising}>
          Cancel
        </Button>
        <button
          type="button"
          onClick={() => onConfirm(draft, instructions)}
          disabled={!canSubmit}
          className={buttonClassName.primary}
        >
          <Sparkles className={`h-4 w-4 ${revising ? 'animate-pulse' : ''}`} />
          <span>{revising ? 'Revising...' : 'Revise with AI'}</span>
        </button>
      </Modal.Footer>
    </Modal>
  );
}

const DraftCard = ({ draft, onSend, onRevise, onDelete, onSave, saving }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [editedSubject, setEditedSubject] = useState(draft.subject || '');
  const [editedToEmail, setEditedToEmail] = useState(draft.to_email || '');
  const [editedBody, setEditedBody] = useState(getEditableBody(draft));
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setEditedSubject(draft.subject || '');
    setEditedToEmail(draft.to_email || '');
    setEditedBody(getEditableBody(draft));
  }, [draft]);

  const isDirty =
    editedSubject !== (draft.subject || '') ||
    editedToEmail !== (draft.to_email || '') ||
    editedBody !== getEditableBody(draft);

  const handleSave = async () => {
    if (!isDirty || saving) return;
    const updates = {
      subject: editedSubject,
      to_email: editedToEmail,
      body_text: editedBody,
      body_html: buildEditedBodyHtml(editedBody)
    };
    await onSave(draft.id, updates);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const getEditedDraft = () => ({
    ...draft,
    subject: editedSubject,
    to_email: editedToEmail,
    body_text: editedBody,
    body_html: buildEditedBodyHtml(editedBody)
  });

  const handleSendClick = () => {
    if (onSend) onSend(getEditedDraft(), { isDirty });
  };

  const handleReviseClick = () => {
    if (onRevise) onRevise(getEditedDraft());
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors flex flex-col">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              placeholder="(No subject)"
              className="flex-1 min-w-0 text-sm font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none px-1 py-0.5"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span className="font-medium text-gray-600">To:</span>
            <input
              type="email"
              value={editedToEmail}
              onChange={(e) => setEditedToEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none px-1 py-0.5"
            />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              Created {formatDate(draft.created_at)}
            </span>
            {isDirty ? (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                • unsaved
              </span>
            ) : null}
          </div>
        </div>

        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full whitespace-nowrap">
          {draft.status === 'draft' ? 'Draft' : draft.status}
        </span>
      </div>

      <div className="flex-1 mb-3 min-h-[200px]">
        <textarea
          value={editedBody}
          onChange={(e) => setEditedBody(e.target.value)}
          placeholder="Draft body..."
          className="h-full w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed focus:border-blue-400 focus:bg-white focus:outline-none"
          style={{ minHeight: '200px' }}
        />
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className={buttonClassName.secondary}
          title={isDirty ? 'Save manual edits' : 'No changes to save'}
        >
          {savedFlash ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
          <span className="text-sm font-medium">Save</span>
        </button>

        <button
          onClick={handleSendClick}
          className={`${buttonClassName.primary} flex-1`}
        >
          <Send className="w-4 h-4" />
          <span className="text-sm font-medium">Send</span>
        </button>

        <button
          onClick={handleReviseClick}
          className={buttonClassName.icon}
          title="Revise with AI"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(draft)}
          className={buttonClassName.iconDanger}
          title="Delete draft"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function DraftsList({ onRevise, draftsOverride = null }) {
  const { drafts, fetchDrafts, deleteDraft, updateDraft, reviseDraft, loading } = useEmailStore();
  const displayDrafts = Array.isArray(draftsOverride) ? draftsOverride : drafts;

  const [savingDraftId, setSavingDraftId] = useState(null);
  const [sendModal, setSendModal] = useState({ open: false, draft: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, draft: null });
  const [reviseModal, setReviseModal] = useState({ open: false, draft: null });
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [revising, setRevising] = useState(false);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const persistEdits = async (draft) => {
    try {
      await updateDraft(draft.id, {
        subject: draft.subject,
        to_email: draft.to_email,
        body_text: draft.body_text,
        body_html: draft.body_html
      });
    } catch (error) {
      // ignore
    }
  };

  const handleSendRequest = (draft, { isDirty } = {}) => {
    setSendModal({ open: true, draft, isDirty });
  };

  const closeSendModal = () => {
    if (sending) return;
    setSendModal({ open: false, draft: null });
  };

  const handleSendConfirm = async (draft) => {
    setSending(true);
    try {
      if (sendModal.isDirty) {
        await persistEdits(draft);
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const currentUser = await getAuthenticatedUser();
      const userIdentity = await getWebhookUserIdentity(currentUser);
      if (!userIdentity.user_id) {
        throw new Error('User not authenticated');
      }

      const tokenResponse = await axios.get(`${backendUrl}/api/google/token`, {
        withCredentials: true
      });
      const googleToken = tokenResponse.data;

      const recipientEmail = draft.to_email ||
                            draft.source_email_payload?.from?.match(/<(.+?)>/)?.[1] ||
                            draft.source_email_payload?.from ||
                            '';

      if (!recipientEmail) {
        throw new Error('No recipient email found');
      }

      const webhookUrl = urls.getEmail();

      const payload = {
        ...userIdentity,
        draft_id: draft.id,
        action: 'send',
        current_draft: {
          to: recipientEmail,
          subject: draft.subject,
          body_text: draft.body_text,
          body_html: draft.body_html
        },
        source_email: {
          from: draft.source_email_payload?.from || '',
          id: draft.source_message_id || '',
          threadId: draft.source_thread_id || ''
        },
        google_token: googleToken
      };

      await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      setSendModal({ open: false, draft: null });
      await fetchDrafts();
    } finally {
      setSending(false);
    }
  };

  const handleReviseRequest = (draft) => {
    setReviseModal({ open: true, draft });
  };

  const closeReviseModal = () => {
    if (revising) return;
    setReviseModal({ open: false, draft: null });
  };

  const handleReviseConfirm = async (draft, instructions) => {
    setRevising(true);
    try {
      if (sendModal?.isDirty === undefined) {
        await persistEdits(draft);
      }
      await reviseDraft(draft.id, instructions);
      setReviseModal({ open: false, draft: null });
      if (onRevise) {
        onRevise(draft);
      }
    } finally {
      setRevising(false);
    }
  };

  const handleDeleteRequest = (draft) => {
    setDeleteModal({ open: true, draft });
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal({ open: false, draft: null });
  };

  const handleDeleteConfirm = async (draftId) => {
    setDeleting(true);
    try {
      await deleteDraft(draftId);
      setDeleteModal({ open: false, draft: null });
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (draftId, updates) => {
    setSavingDraftId(draftId);
    try {
      await updateDraft(draftId, updates);
    } finally {
      setSavingDraftId(null);
    }
  };

  if (loading && !drafts) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!displayDrafts || displayDrafts.length === 0) {
    return (
      <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center p-6 text-gray-500">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">
            {Array.isArray(draftsOverride) ? "No matching drafts" : "No drafts yet"}
          </p>
          <p className="text-sm">
            {Array.isArray(draftsOverride)
              ? "Try a different search keyword"
              : "Use \"Magic Reply\" to create AI-powered email drafts"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Drafts</h2>
        <p className="text-sm text-gray-600">
          {displayDrafts.length} draft{displayDrafts.length !== 1 ? 's' : ''} ready to send
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="grid grid-cols-1 gap-4">
          {displayDrafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onSend={handleSendRequest}
              onRevise={handleReviseRequest}
              onDelete={handleDeleteRequest}
              onSave={handleSave}
              saving={savingDraftId === draft.id}
            />
          ))}
        </div>
      </div>

      <SendDraftModal
        open={sendModal.open}
        draft={sendModal.draft}
        onClose={closeSendModal}
        onConfirm={handleSendConfirm}
        sending={sending}
      />

      <DeleteDraftModal
        open={deleteModal.open}
        draft={deleteModal.draft}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      <ReviseDraftModal
        open={reviseModal.open}
        draft={reviseModal.draft}
        onClose={closeReviseModal}
        onConfirm={handleReviseConfirm}
        revising={revising}
      />
    </div>
  );
}
