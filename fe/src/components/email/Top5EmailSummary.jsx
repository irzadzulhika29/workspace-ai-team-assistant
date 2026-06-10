import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Sparkles,
  Mail,
  ListTodo,
  Search,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { urls } from '../../services/api';
import { getAuthenticatedUser, getWebhookUserIdentity } from '../../services/authService';

const getCurrentUser = async () => {
  try {
    return await getAuthenticatedUser();
  } catch (error) {

    return null;
  }
};

const getGoogleAccessToken = async () => {
  try {
    const backendUrl = urls.getBackendUrl();
    const response = await axios.get(`${backendUrl}/api/google/token`, {
      withCredentials: true,
      timeout: 8000
    });

    return response.data?.access_token || null;
  } catch (error) {

    return null;
  }
};

export default function Top5EmailSummary({ refreshTrigger = 0, onReplyAction }) {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingActionId, setReplyingActionId] = useState(null);

  const STORAGE_KEY = 'email_summary_cache';

  const loadCachedSummary = () => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      return parsed.data;
    } catch (err) {

      return null;
    }
  };

  const saveSummaryToCache = (data) => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now()
        })
      );
    } catch (err) {
      // ignore
    }
  };

  const fetchEmailSummary = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = loadCachedSummary();
        if (cached) {
          setSummaryData(cached);
          setLoading(false);
          return;
        }
      }

      const user = await getCurrentUser();
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const googleAccessToken = await getGoogleAccessToken();
      if (!googleAccessToken) {
        setError('Google account not connected');
        setLoading(false);
        return;
      }

      const webhookUrl = urls.getEmailSummary();
      const userIdentity = await getWebhookUserIdentity(user);
      const payload = {
        ...userIdentity,
        google_access_token: googleAccessToken
      };

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data.success && response.data.summary) {
        setSummaryData(response.data.summary);
        saveSummaryToCache(response.data.summary);
        setError(null);
      } else {
        setError('Failed to fetch email summary');
      }
    } catch (err) {

      setError(err.response?.data?.error || err.message || 'Failed to fetch email summary');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = loadCachedSummary();
    if (cached) {
      setSummaryData(cached);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      setLoading(true);
      fetchEmailSummary(true);
    }
  }, [refreshTrigger, fetchEmailSummary]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-12 rounded-2xl bg-slate-200" />
        <div className="h-36 rounded-3xl bg-slate-200" />
        <div className="h-24 rounded-2xl bg-slate-200" />
        <div className="h-24 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-600" />
          <h3 className="text-sm font-semibold text-rose-900">Error Loading Summary</h3>
        </div>
        <p className="text-xs text-rose-700">{error}</p>
      </div>
    );
  }

  if (!summaryData || summaryData.status === 'failed') {
    return (
      <div className="rounded-2xl p-4 text-center text-gray-500">
        <Mail className="mx-auto mb-2 h-12 w-12 text-gray-400" />
        <p className="text-sm font-medium">{summaryData?.headline || 'No email summary available'}</p>
      </div>
    );
  }

  const recommendedActions = Array.isArray(summaryData.recommended_actions)
    ? summaryData.recommended_actions
    : (Array.isArray(summaryData.recommendations)
      ? summaryData.recommendations.map((value, index) => ({
          id: `legacy-${index}`,
          label: String(value),
          reason: String(value),
          is_reply_candidate: false
        }))
      : []);

  const summaryPoints = Array.isArray(summaryData.summary_points)
    ? summaryData.summary_points
    : (Array.isArray(summaryData.findings) ? summaryData.findings : []);

  const handleReplyClick = async (action, index) => {
    if (!onReplyAction) return;
    const actionId = action?.id || action?.source_email_id || `action-${index}`;
    try {
      setReplyingActionId(actionId);
      await onReplyAction(action);
    } finally {
      setReplyingActionId(null);
    }
  };

  if (summaryData.source_metrics?.total_unread === 0) {
    return (
      <div className="rounded-2xl p-4 text-center text-gray-500">
        <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
        <p className="text-sm font-medium">All caught up!</p>
        <p className="text-xs">No unread emails</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-[24px] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4ef] text-[#ff623d]">
            <Sparkles size={18} />
          </div>
          <p className="text-[1.05rem] font-semibold text-slate-900">
            AI Insights
          </p>
        </div>
      </div>

      <div className="mt-5 flex-1 space-y-5 overflow-y-auto">
        <div className="relative rounded-[28px]">
          <div className="rounded-[20px] border border-[#ff623d] bg-[#fff4ef] p-3">
            <div className="flex gap-3">
              <ListTodo size={18} />
              <p className="text-lg font-semibold leading-none text-[#ff623d]">
                Overview
              </p>
            </div>
            <p className="mt-2 text-sm leading-4 text-slate-700">{summaryData.headline}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <Search size={18} />
            <p className="text-lg font-semibold leading-none text-slate-900">
              Findings
            </p>
          </div>
          <div className="mt-3 h-[2px] w-full rounded-full bg-[#eceff3]" />
          {summaryPoints.length ? (
            <ul className="mt-3 space-y-3 pl-5">
              {summaryPoints.slice(0, 3).map((point, index) => (
                <li key={`${point}-${index}`} className="relative text-sm leading-4 text-slate-700">
                  <span className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full bg-[#ff623d]" />
                  {point}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Belum ada temuan tambahan dari AI.</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <ListTodo size={18} />
            <p className="text-lg font-semibold leading-none text-slate-900">
              Recommended Action
            </p>
          </div>
          <div className="mt-3 h-[2px] w-full rounded-full bg-[#eceff3]" />
          {recommendedActions.length ? (
            <ul className="mt-3 space-y-2.5">
              {recommendedActions.slice(0, 3).map((action, index) => {
                const recText = action?.label || action?.reason || '';
                const actionId = action?.id || action?.source_email_id || `action-${index}`;
                const isReplyCandidate = Boolean(action?.is_reply_candidate && action?.source_email_id);

                return (
                <li
                  key={`${actionId}-${index}`}
                  className="rounded-2xl border border-slate-300 bg-white px-3.5 py-3"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                        index === 0
                          ? 'bg-[#fff1e8] text-[#ff623d]'
                          : index === 1
                            ? 'bg-[#fff8e9] text-[#f59e0b]'
                            : 'bg-[#f1ecff] text-[#7c3aed]'
                      }`}
                    >
                      <ListTodo size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm leading-6 text-slate-800">{recText}</span>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        {isReplyCandidate ? (
                          <button
                            type="button"
                            onClick={() => handleReplyClick(action, index)}
                            disabled={replyingActionId === actionId}
                            className="rounded-xl border border-[#ff623d] px-3 py-1 text-xs font-semibold text-[#ff623d] transition-colors hover:bg-[#fff4ef] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {replyingActionId === actionId ? 'Creating...' : 'Reply Email'}
                          </button>
                        ) : (
                          <span />
                        )}
                        <ChevronRight size={18} className="shrink-0 text-[#f59b70]" />
                      </div>
                    </div>
                  </div>
                </li>
              )})}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Belum ada rekomendasi tindakan dari AI.</p>
          )}
        </div>
      </div>

      {summaryData.status === 'partial' && (
        <div className="mt-3 rounded-lg bg-yellow-100 p-2">
          <p className="text-xs text-yellow-800">Some data may be incomplete</p>
        </div>
      )}
    </div>
  );
}
