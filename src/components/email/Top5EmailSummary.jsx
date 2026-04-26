import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, CheckCircle, Sparkles, RefreshCw, FileText, ExternalLink } from 'lucide-react';
import { useEmailStore } from '../../store/emailStore';
import { generateDraftFromWebhook } from '../../services/emailWebhookService';

/**
 * Priority badge component
 */
const PriorityBadge = ({ priority }) => {
  const config = {
    urgent: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: AlertCircle,
      label: 'Urgent'
    },
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: Clock,
      label: 'Medium'
    },
    low: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: CheckCircle,
      label: 'Low'
    }
  };

  const { bg, text, icon: Icon, label } = config[priority] || config.low;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

/**
 * Top5EmailSummary Component
 * Displays AI-powered summary of top 5 unread emails with priority labeling
 */
export default function Top5EmailSummary() {
  const { emails, loading, selectEmail, selectedEmail, createDraft } = useEmailStore();
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [generatingDraftId, setGeneratingDraftId] = useState(null);

  /**
   * Handle email click - select and show detail
   */
  const handleEmailClick = (emailId) => {
    selectEmail(emailId);
  };

  /**
   * Handle draft reply - create draft from summary card via webhook
   */
  const handleDraftReply = async (e, email) => {
    e.stopPropagation(); // Prevent email selection

    // Find full email object
    const fullEmail = emails.find(em => em.id === email.id);
    if (!fullEmail) {
      alert('Email not found');
      return;
    }

    setGeneratingDraftId(email.id);

    try {
      // Send email to webhook and generate draft
      const result = await generateDraftFromWebhook(fullEmail, createDraft);

      if (result.success) {
        alert('Draft created successfully! Check the Drafts tab to review and send.');
      } else {
        alert('Failed to create draft. Please try again.');
      }
    } catch (error) {
      console.error('Error creating draft:', error);
      alert(`Error creating draft: ${error.message}`);
    } finally {
      setGeneratingDraftId(null);
    }
  };

  /**
   * Determine email priority based on rule-based detection
   * TODO: Integrate with AI summary for better priority detection
   */
  const determineEmailPriority = (email) => {
    const subject = (email.subject || '').toLowerCase();
    const snippet = (email.snippet || '').toLowerCase();
    const from = (email.from || '').toLowerCase();

    // Urgent keywords
    const urgentKeywords = ['urgent', 'asap', 'critical', 'important', 'deadline', 'emergency'];
    const hasUrgentKeyword = urgentKeywords.some(keyword => 
      subject.includes(keyword) || snippet.includes(keyword)
    );

    // Check if from important sender (e.g., boss, client)
    // TODO: Make this configurable per user
    const importantDomains = ['ceo', 'director', 'manager', 'client'];
    const isImportantSender = importantDomains.some(domain => from.includes(domain));

    // Check if needs reply
    const needsReplyKeywords = ['please reply', 'waiting for', 'need your', 'can you', 'could you'];
    const needsReply = needsReplyKeywords.some(keyword => 
      subject.includes(keyword) || snippet.includes(keyword)
    );

    if (hasUrgentKeyword || isImportantSender) {
      return 'urgent';
    } else if (needsReply) {
      return 'medium';
    } else {
      return 'low';
    }
  };

  /**
   * Get top 5 unread emails
   */
  const getTop5Unread = () => {
    const unreadEmails = emails.filter(email => 
      email.labelIds?.includes('UNREAD')
    );
    return unreadEmails.slice(0, 5);
  };

  /**
   * Generate summary for top 5 emails
   */
  const generateSummary = () => {
    const top5 = getTop5Unread();
    
    if (top5.length === 0) {
      return null;
    }

    const summaries = top5.map(email => ({
      id: email.id,
      subject: email.subject || '(No subject)',
      from: email.from,
      snippet: email.snippet,
      priority: determineEmailPriority(email),
      timestamp: email.date || email.internalDate
    }));

    // Count by priority
    const priorityCounts = summaries.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {});

    return {
      emails: summaries,
      counts: priorityCounts,
      total: summaries.length
    };
  };

  /**
   * Refresh summary
   */
  const handleRefreshSummary = () => {
    setLoadingSummary(true);
    setTimeout(() => {
      const summary = generateSummary();
      setSummaryData(summary);
      setLoadingSummary(false);
    }, 500);
  };

  // Generate summary when emails change
  useEffect(() => {
    const summary = generateSummary();
    setSummaryData(summary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails]);

  if (loading && !summaryData) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!summaryData || summaryData.total === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
        <p className="text-sm font-medium">All caught up!</p>
        <p className="text-xs">No unread emails</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Top 5 Email Summary</h3>
        </div>
        <button
          onClick={handleRefreshSummary}
          disabled={loadingSummary}
          className="p-1 rounded hover:bg-white/50 transition-colors"
          title="Refresh summary"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loadingSummary ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Priority Overview */}
      <div className="flex gap-2 mb-3">
        {summaryData.counts.urgent > 0 && (
          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
            {summaryData.counts.urgent} Urgent
          </span>
        )}
        {summaryData.counts.medium > 0 && (
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
            {summaryData.counts.medium} Medium
          </span>
        )}
        {summaryData.counts.low > 0 && (
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
            {summaryData.counts.low} Low
          </span>
        )}
      </div>

      {/* Email Summaries */}
      <div className="space-y-2">
        {summaryData.emails.map((email, index) => (
          <div
            key={email.id}
            className={`p-3 bg-white rounded-lg border transition-all ${
              selectedEmail?.id === email.id
                ? 'border-blue-500 shadow-md ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
              <PriorityBadge priority={email.priority} />
            </div>
            
            <div 
              onClick={() => handleEmailClick(email.id)}
              className="cursor-pointer"
            >
              <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                {email.subject}
              </p>
              <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                From: {email.from}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {email.snippet}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={(e) => handleDraftReply(e, email)}
                disabled={generatingDraftId === email.id}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className={`w-3 h-3 ${generatingDraftId === email.id ? 'animate-pulse' : ''}`} />
                {generatingDraftId === email.id ? 'Generating...' : 'Draft Reply'}
              </button>
              <button
                onClick={() => handleEmailClick(email.id)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Open Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="mt-3 p-2 bg-blue-100 rounded-lg">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">AI Insight:</span>{' '}
          {summaryData.counts.urgent > 0 
            ? `${summaryData.counts.urgent} email${summaryData.counts.urgent > 1 ? 's' : ''} need immediate attention.`
            : 'No urgent emails. You can review these at your convenience.'}
        </p>
      </div>
    </div>
  );
}
