import React, { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, SquarePen } from 'lucide-react';
import { Alert, Button, Input } from '@/components/ui';
import { useEmailStore } from '../store/emailStore';
import EmailList from '../components/email/EmailList';
import EmailDetail from '../components/email/EmailDetail';
import Top5EmailSummary from '../components/email/Top5EmailSummary';
import DraftsList from '../components/email/DraftsList';
import DraftRevisionChat from '../components/email/DraftRevisionChat';
import { emailApi } from '../services/emailService';
import { generateDraftFromWebhook } from '../services/emailWebhookService';

export default function EmailPage() {
  const {
    fetchEmails,
    fetchDrafts,
    openComposeModal,
    searchEmails,
    setFilter,
    emails,
    drafts,
    loading,
    error
  } = useEmailStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('unread'); // Default to Unread tab
  const [revisingDraft, setRevisingDraft] = useState(null);
  const [summaryRefreshTrigger, setSummaryRefreshTrigger] = useState(0);

  // Fetch emails on mount
  useEffect(() => {
    fetchEmails();
    fetchDrafts();
  }, [fetchEmails, fetchDrafts]);

  const metrics = useMemo(() => {
    const inboxCount = emails.length;
    const unreadCount = emails.filter((email) => email.labelIds?.includes('UNREAD')).length;
    const sentCount = emails.filter((email) => email.labelIds?.includes('SENT')).length;

    return {
      inbox: inboxCount,
      unread: unreadCount,
      drafts: drafts?.length || 0,
      sent: sentCount,
    };
  }, [emails, drafts]);

  /**
   * Handle search submit
   */
  const handleSearch = (e) => {
    e.preventDefault();
    searchEmails(searchQuery);
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'inbox':
        setFilter('labelIds', 'INBOX');
        setFilter('unreadOnly', false);
        break;
      case 'unread':
        setFilter('labelIds', 'INBOX');
        setFilter('unreadOnly', true);
        break;
      case 'drafts':
        // Fetch drafts from Supabase
        useEmailStore.getState().fetchDrafts();
        break;
      case 'sent':
        setFilter('labelIds', 'SENT');
        setFilter('unreadOnly', false);
        break;
      default:
        break;
    }
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    fetchEmails();
    setSummaryRefreshTrigger((value) => value + 1);
  };

  /**
   * Handle revise draft
   */
  const handleReviseDraft = (draft) => {
    setRevisingDraft(draft);
  };

  /**
   * Handle draft updated from chat
   */
  const handleDraftUpdated = async (updatedDraft) => {
    // Update the draft being revised with the latest version
    if (updatedDraft) {
      setRevisingDraft(updatedDraft);
    }
    // Refresh drafts list
    await useEmailStore.getState().fetchDrafts();
  };

  /**
   * Handle draft created - switch to drafts tab
   */
  const handleDraftCreated = () => {
    setActiveTab('drafts');
    useEmailStore.getState().fetchDrafts();
  };

  const handleSummaryReplyAction = async (action) => {
    const sourceEmailId = action?.source_email_id || action?.email_id;
    if (!sourceEmailId) return;

    try {
      const emailDetail = await emailApi.getEmail(sourceEmailId);
      await generateDraftFromWebhook(emailDetail, fetchDrafts);
      setActiveTab('drafts');
    } catch (replyError) {
      console.error('Failed creating reply draft from summary action:', replyError);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-[280px]">
            <h1 className="text-[2rem] font-bold leading-tight text-neutral-900">Email Workspace</h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola inbox, prioritas, dan tindak lanjut email dengan bantuan AI.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-[540px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari email atau pengirim..."
                className="h-auto px-4 py-4 w-full rounded-2xl bg-white pl-14 pr-16 text-sm text-slate-700 placeholder:text-slate-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                Ctrl K
              </span>
            </div>
          </form>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className=" gap-2 rounded-2xl text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={openComposeModal}
              size="sm"
              className=" gap-2 rounded-2xl bg-[#ff623d] text-sm text-white hover:bg-[#ff744f]"
            >
              <SquarePen className="h-4 w-4" />
              <span>Compose</span>
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="error" className="mt-4" title="Email workspace error">
            {error}
          </Alert>
        )}
      </section>


      {/* Section 2: Metrics Cards */}
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => handleTabChange('inbox')}
          className="rounded-[20px] bg-white px-5 py-4 text-left shadow-md transition-colors hover:bg-slate-50"
        >
          <p className="text-sm font-medium text-slate-600">Inbox</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{metrics.inbox}</p>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('unread')}
          className="rounded-[20px] bg-white px-5 py-4 text-left shadow-md transition-colors hover:bg-slate-50"
        >
          <p className="text-sm font-medium text-slate-600">Unread</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{metrics.unread}</p>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('drafts')}
          className="rounded-[20px] bg-white px-5 py-4 text-left shadow-md transition-colors hover:bg-slate-50"
        >
          <p className="text-sm font-medium text-slate-600">Drafts</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{metrics.drafts}</p>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('sent')}
          className="rounded-[20px] bg-white px-5 py-4 text-left shadow-md transition-colors hover:bg-slate-50"
        >
          <p className="text-sm font-medium text-slate-600">Sent / Follow-up</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{metrics.sent}</p>
        </button>
      </section>

      {/* Section 3: Email Content */}
      <section className="mt-4 flex h-[calc(100dvh-15rem)] min-h-0 flex-1 overflow-hidden rounded-[24px] shadow-md">
      <div className="flex h-full min-h-0 flex-1 overflow-hidden gap-4">
        {/* Tab Content */}
        {activeTab === 'unread' && (
          <>
            {/* Left Panel: Email Summary (Permanent) */}
            <div className="h-full min-h-0 w-80 overflow-y-auto rounded-[20px] bg-white shadow-md">
              <Top5EmailSummary
                refreshTrigger={summaryRefreshTrigger}
                onReplyAction={handleSummaryReplyAction}
              />
            </div>

            {/* Middle Panel: Email List */}
            <div className="flex h-full min-h-0 w-96 flex-col overflow-hidden rounded-[20px] bg-white shadow-md">
              <div className="flex-1 overflow-y-auto">
                <EmailList maxItems={10} unreadOnly={true} />
              </div>
            </div>

            {/* Right Panel: Email Detail */}
            <div className="flex h-full min-h-0 flex-1">
              <EmailDetail onDraftCreated={handleDraftCreated} />
            </div>
          </>
        )}

        {activeTab === 'inbox' && (
          <>
            {/* Email List */}
            <div className="flex h-full min-h-0 w-96 flex-col overflow-hidden rounded-[20px] bg-white shadow-md">
              <div className="flex-1 overflow-y-auto">
                <EmailList />
              </div>
            </div>

            {/* Email Detail */}
            <div className="flex max-w-4xl min-h-0 flex-1">
              <EmailDetail onDraftCreated={handleDraftCreated} />
            </div>
          </>
        )}

        {activeTab === 'drafts' && (
          <>
            {/* Drafts List */}
            <div className={revisingDraft ? 'h-full min-h-0 w-1/2 overflow-hidden rounded-[20px] bg-white shadow-md' : 'h-full min-h-0 flex-1 overflow-hidden rounded-[20px] bg-white shadow-md'}>
              <DraftsList onRevise={handleReviseDraft} />
            </div>

            {/* Draft Revision Chat */}
            {revisingDraft && (
              <div className="h-full min-h-0 w-1/2 overflow-hidden rounded-[20px] bg-white shadow-md">
                <DraftRevisionChat
                  draft={revisingDraft}
                  onClose={() => setRevisingDraft(null)}
                  onDraftUpdated={handleDraftUpdated}
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'sent' && (
          <>
            {/* Sent Email List */}
            <div className="flex h-full min-h-0 w-96 flex-col overflow-hidden rounded-[20px] bg-white shadow-md">
              <div className="flex-1 overflow-y-auto">
                <EmailList />
              </div>
            </div>

            {/* Email Detail */}
            <div className="flex h-full min-h-0 flex-1">
              <EmailDetail onDraftCreated={handleDraftCreated} />
            </div>
          </>
        )}
      </div>
      </section>
    </div>
  );
}
