import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, Inbox, Mail, FileText, Send, Sparkles } from 'lucide-react';
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Email</h1>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          <button
            onClick={() => handleTabChange('inbox')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'inbox'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Inbox</span>
          </button>

          <button
            onClick={() => handleTabChange('unread')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'unread'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Unread</span>
          </button>

          <button
            onClick={() => handleTabChange('drafts')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'drafts'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Drafts</span>
          </button>

          <button
            onClick={() => handleTabChange('sent')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'sent'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Sent / Follow-up</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tab Content */}
        {activeTab === 'unread' && (
          <>
            {/* Left Panel: Email Summary (Recommendations) - Collapsible */}
            {showSummary && (
              <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
                <Top5EmailSummary />
              </div>
            )}

            {/* Toggle Button for Summary Panel */}
            <div className="relative">
              <button
                onClick={() => setShowSummary(!showSummary)}
                className={`absolute top-4 -left-3 z-10 p-2 rounded-full shadow-lg hover:shadow-xl transition-all ${
                  showSummary 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title={showSummary ? 'Hide AI Summary' : 'Show AI Summary'}
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Middle Panel: Email List */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
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
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
              <EmailList />
            </div>

            {/* Email Detail */}
            <EmailDetail onDraftCreated={handleDraftCreated} />
          </>
        )}

        {activeTab === 'drafts' && (
          <>
            {/* Drafts List */}
            <div className={revisingDraft ? 'w-1/2 bg-white overflow-hidden' : 'flex-1 bg-white'}>
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
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
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
