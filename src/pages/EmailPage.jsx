import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, Inbox, Mail, FileText, Send, Sparkles } from 'lucide-react';
import { Alert, Button, Input, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { useEmailStore } from '../store/emailStore';
import EmailList from '../components/email/EmailList';
import EmailDetail from '../components/email/EmailDetail';
import Top5EmailSummary from '../components/email/Top5EmailSummary';
import DraftsList from '../components/email/DraftsList';
import DraftRevisionChat from '../components/email/DraftRevisionChat';

/**
 * EmailPage Component - Main email workspace
 * Structure: Inbox | Unread | Drafts | Sent/Follow-up
 */
export default function EmailPage() {
  const {
    fetchEmails,
    searchEmails,
    setFilter,
    loading,
    error
  } = useEmailStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('unread'); // Default to Unread tab
  const [revisingDraft, setRevisingDraft] = useState(null);
  const [showSummary, setShowSummary] = useState(true); // Toggle for email summary panel

  // Fetch emails on mount
  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

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

  return (
    <div className="flex h-full min-h-0 flex-col bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Email</h1>
          
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emails..."
            icon={<Search className="h-5 w-5" />}
            className="flex-1 rounded-lg"
          />
          <Button
            type="submit"
            variant="ghost"
            size="md"
            className="rounded-lg px-6"
          >
            Search
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <Alert variant="error" className="mt-4" title="Email workspace error">
            {error}
          </Alert>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-neutral-200 bg-white px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="gap-1">
            <TabsTrigger value="inbox" icon={<Inbox className="h-4 w-4" />}>
              Inbox
            </TabsTrigger>
            <TabsTrigger value="unread" icon={<Mail className="h-4 w-4" />}>
              Unread
            </TabsTrigger>
            <TabsTrigger value="drafts" icon={<FileText className="h-4 w-4" />}>
              Drafts
            </TabsTrigger>
            <TabsTrigger value="sent" icon={<Send className="h-4 w-4" />}>
              Sent / Follow-up
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tab Content */}
        {activeTab === 'unread' && (
          <>
            {/* Left Panel: Email Summary (Recommendations) - Collapsible */}
            {showSummary && (
              <div className="w-80 overflow-y-auto border-r border-neutral-200 bg-white">
                <Top5EmailSummary />
              </div>
            )}

            {/* Toggle Button for Summary Panel */}
            <div className="relative">
              <button
                onClick={() => setShowSummary(!showSummary)}
                className={`absolute top-4 -left-3 z-10 p-2 rounded-full shadow-lg hover:shadow-xl transition-all ${
                  showSummary 
                    ? 'bg-gradient-stat text-white' 
                    : 'border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
                title={showSummary ? 'Hide AI Summary' : 'Show AI Summary'}
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Middle Panel: Email List */}
            <div className="flex w-96 flex-col overflow-hidden border-r border-neutral-200 bg-white">
              <div className="flex-1 overflow-y-auto">
                <EmailList maxItems={10} unreadOnly={true} />
              </div>
            </div>

            {/* Right Panel: Email Detail */}
            <EmailDetail onDraftCreated={handleDraftCreated} />
          </>
        )}

        {activeTab === 'inbox' && (
          <>
            {/* Email List */}
            <div className="flex w-96 flex-col border-r border-neutral-200 bg-white">
              <EmailList />
            </div>

            {/* Email Detail */}
            <EmailDetail onDraftCreated={handleDraftCreated} />
          </>
        )}

        {activeTab === 'drafts' && (
          <>
            {/* Drafts List */}
            <div className={revisingDraft ? 'w-1/2 overflow-hidden bg-white' : 'flex-1 bg-white'}>
              <DraftsList onRevise={handleReviseDraft} />
            </div>

            {/* Draft Revision Chat */}
            {revisingDraft && (
              <div className="w-1/2 overflow-hidden">
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
            <div className="flex w-96 flex-col border-r border-neutral-200 bg-white">
              <EmailList />
            </div>

            {/* Email Detail */}
            <EmailDetail onDraftCreated={handleDraftCreated} />
          </>
        )}
      </div>
    </div>
  );
}
