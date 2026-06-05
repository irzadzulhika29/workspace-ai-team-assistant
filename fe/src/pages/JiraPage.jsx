import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  Alert,
  Button,
  Input,
  LockedIntegrationState,
  Modal,
  toast,
} from "@/components/ui";
import {
  AlertCircle,
  Bug,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleDot,
  ExternalLink,
  Flag,
  FolderKanban,
  ListTodo,
  RefreshCw,
  Search,
  SquarePen,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FaTasks } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { JIRA_ERROR_CODES, jiraApi } from "../services/jiraService";


const PRIORITY_OPTIONS = [
  { value: "", label: "Tanpa prioritas" },
  { value: "Highest", label: "Highest" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
  { value: "Lowest", label: "Lowest" },
];

const createDefaultIssueForm = () => ({
  projectKey: "",
  issueTypeId: "",
  issueTypeName: "",
  summary: "",
  description: "",
  priority: "",
  assignee: "",
  dueDate: "",
  labels: "",
});

const validateIssueForm = (form) => {
  if (!form.projectKey) return "Pilih project Jira terlebih dahulu.";
  if (!form.issueTypeId) return "Pilih issue type terlebih dahulu.";
  if (!form.summary.trim()) return "Judul issue wajib diisi.";
  return "";
};

const buildAtlassianDocument = (value) => {
  const text = String(value || "").trim();
  if (!text) return undefined;

  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
};

const buildCreateIssuePayload = (form) => {
  const fields = {
    project: { key: form.projectKey },
    issuetype: { id: form.issueTypeId },
    summary: form.summary.trim(),
  };

  const description = buildAtlassianDocument(form.description);
  if (description) fields.description = description;

  if (form.priority) {
    fields.priority = { name: form.priority };
  }

  if (form.assignee.trim()) {
    fields.assignee = { accountId: form.assignee.trim() };
  }

  if (form.dueDate) {
    fields.duedate = form.dueDate;
  }

  const labels = form.labels
    .split(/[\n,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  if (labels.length) fields.labels = labels;

  return { fields };
};

const JIRA_CACHE_KEY = "jira_issues_cache_v1";
const JIRA_AI_SUMMARY_CACHE_KEY = "jira_ai_summary_cache_v1";
const IN_PROGRESS_KEYWORDS = [
  "in progress",
  "progress",
  "review",
  "testing",
  "qa",
  "doing",
];
const DONE_KEYWORDS = ["done", "closed", "resolved", "complete", "completed"];
const BLOCKED_KEYWORDS = ["blocked", "blocker", "waiting", "stuck"];
const HIGH_PRIORITY_KEYWORDS = ["highest", "high", "critical", "urgent"];
const STATUS_CATEGORY_LABELS = {
  new: "To Do",
  indeterminate: "In Progress",
  done: "Done",
};

const getField = (issue, ...keys) => {
  for (const key of keys) {
    const value = key.split(".").reduce((acc, part) => acc?.[part], issue);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatShortDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const includesKeyword = (value, keywords) => {
  const normalized = normalizeText(value);
  return keywords.some((keyword) => normalized.includes(keyword));
};

const getStatusCategoryKey = (issue) => {
  const categoryKey = normalizeText(
    getField(
      issue,
      "fields.status.statusCategory.key",
      "status.statusCategory.key",
      "statusCategory.key",
    ),
  );

  if (categoryKey) return categoryKey;

  const categoryName = normalizeText(
    getField(
      issue,
      "fields.status.statusCategory.name",
      "status.statusCategory.name",
      "statusCategory.name",
    ),
  );

  if (categoryName.includes("progress")) return "indeterminate";
  if (categoryName.includes("done")) return "done";
  if (categoryName.includes("to do")) return "new";

  const status = getField(
    issue,
    "fields.status.name",
    "status.name",
    "status",
    "state",
  );
  if (includesKeyword(status, DONE_KEYWORDS)) return "done";
  if (includesKeyword(status, IN_PROGRESS_KEYWORDS)) return "indeterminate";
  return "new";
};

const buildBrowseUrl = (selfUrl, issueKey) => {
  if (!selfUrl || !issueKey) return "";

  try {
    const url = new URL(selfUrl);
    return `${url.origin}/browse/${issueKey}`;
  } catch {
    return "";
  }
};

const isDateToday = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return date.toDateString() === new Date().toDateString();
};

const isOverdueDate = (value) => {
  if (!value) return false;
  const dueDate = new Date(value);
  if (Number.isNaN(dueDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
};

const normalizeIssue = (issue, index) => {
  const key = getField(issue, "key", "id", "issueKey") || `ISSUE-${index + 1}`;
  const summary =
    getField(issue, "fields.summary", "summary", "title") ||
    "Tanpa judul issue";
  const status =
    getField(issue, "fields.status.name", "status.name", "status", "state") ||
    "Unknown";
  const statusCategoryKey = getStatusCategoryKey(issue);
  const statusCategoryName =
    getField(
      issue,
      "fields.status.statusCategory.name",
      "status.statusCategory.name",
      "statusCategory.name",
    ) ||
    STATUS_CATEGORY_LABELS[statusCategoryKey] ||
    "Unknown";
  const assignee =
    getField(
      issue,
      "fields.assignee.displayName",
      "assignee.displayName",
      "assignee.name",
      "assignee",
    ) || "Belum ditugaskan";
  const priority =
    getField(issue, "fields.priority.name", "priority.name", "priority") ||
    "Tanpa prioritas";
  const updatedAt = getField(issue, "fields.updated", "updated", "updatedAt");
  const createdAt = getField(issue, "fields.created", "created", "createdAt");
  const dueDate = getField(issue, "fields.duedate", "duedate", "dueDate");
  const projectName =
    getField(issue, "fields.project.name", "project.name", "project") ||
    "Project tidak diketahui";
  const issueType =
    getField(issue, "fields.issuetype.name", "issuetype.name", "issueType") ||
    "Issue";
  const reporter =
    getField(
      issue,
      "fields.reporter.displayName",
      "reporter.displayName",
      "reporter.name",
      "reporter",
    ) || "Tidak diketahui";
  const labels = Array.isArray(issue?.fields?.labels)
    ? issue.fields.labels
    : [];
  const browseUrl = buildBrowseUrl(issue?.self, key);
  const isDone = statusCategoryKey === "done";
  const isUnassigned = !getField(
    issue,
    "fields.assignee.displayName",
    "assignee.displayName",
    "assignee.name",
    "assignee",
  );
  const isBlocked =
    includesKeyword(status, BLOCKED_KEYWORDS) ||
    labels.some((label) => includesKeyword(label, BLOCKED_KEYWORDS));
  const isHighPriority = includesKeyword(priority, HIGH_PRIORITY_KEYWORDS);
  const isUpdatedToday = isDateToday(updatedAt);
  const isOverdue = !isDone && isOverdueDate(dueDate);

  return {
    ...issue,
    _key: key,
    _summary: summary,
    _status: status,
    _statusCategoryKey: statusCategoryKey,
    _statusCategoryName: statusCategoryName,
    _assignee: assignee,
    _priority: priority,
    _updatedAt: updatedAt,
    _createdAt: createdAt,
    _dueDate: dueDate,
    _projectName: projectName,
    _issueType: issueType,
    _reporter: reporter,
    _labels: labels,
    _browseUrl: browseUrl,
    _isDone: isDone,
    _isUnassigned: isUnassigned,
    _isBlocked: isBlocked,
    _isHighPriority: isHighPriority,
    _isUpdatedToday: isUpdatedToday,
    _isOverdue: isOverdue,
  };
};

const getLaneKey = (issue) => {
  if (issue._statusCategoryKey === "done") return "done";
  if (issue._statusCategoryKey === "indeterminate") return "inProgress";
  return "todo";
};

const buildBoardGroups = (items) => {
  const groups = {
    todo: [],
    inProgress: [],
    done: [],
  };

  for (const issue of items) {
    groups[getLaneKey(issue)].push(issue);
  }

  return groups;
};

const buildMetrics = (items) => {
  const todo = items.filter((issue) => issue._statusCategoryKey === "new");
  const inProgress = items.filter(
    (issue) => issue._statusCategoryKey === "indeterminate",
  );
  const done = items.filter((issue) => issue._statusCategoryKey === "done");
  const blocked = items.filter((issue) => issue._isBlocked);
  const highPriority = items.filter((issue) => issue._isHighPriority);
  const unassigned = items.filter((issue) => issue._isUnassigned);
  const overdue = items.filter((issue) => issue._isOverdue);
  const updatedToday = items.filter((issue) => issue._isUpdatedToday);
  const withDueDate = items.filter((issue) => issue._dueDate);
  const lastUpdatedIssue = [...items]
    .filter((issue) => issue._updatedAt)
    .sort((a, b) => new Date(b._updatedAt) - new Date(a._updatedAt))[0];

  const assigneeCounts = items.reduce((acc, issue) => {
    if (issue._isUnassigned) return acc;
    const assignee = issue._assignee;
    acc[assignee] = (acc[assignee] || 0) + 1;
    return acc;
  }, {});

  const topAssignee =
    Object.entries(assigneeCounts).sort((a, b) => b[1] - a[1])[0] || null;

  return {
    total: items.length,
    todoCount: todo.length,
    inProgressCount: inProgress.length,
    doneCount: done.length,
    blockedCount: blocked.length,
    highPriorityCount: highPriority.length,
    unassignedCount: unassigned.length,
    overdueCount: overdue.length,
    updatedTodayCount: updatedToday.length,
    dueDateCount: withDueDate.length,
    progressPercent: items.length
      ? Math.round((done.length / items.length) * 100)
      : 0,
    lastUpdatedIssue,
    topAssignee,
  };
};

const getLaneTheme = (lane) => {
  if (lane === "todo") {
    return {
      dot: "bg-[#ff6a45]",
      line: "bg-[#ff6a45]",
      badge: "bg-[#ffe0d4] text-[#d85a32]",
    };
  }

  if (lane === "inProgress") {
    return {
      dot: "bg-[#2563ff]",
      line: "bg-[#2563ff]",
      badge: "bg-[#dbe8ff] text-[#3f6de0]",
    };
  }

  return {
    dot: "bg-[#85c981]",
    line: "bg-[#85c981]",
    badge: "bg-[#d9f0d8] text-[#4f9b55]",
  };
};

const lanes = [
  { key: "todo", label: "To Do" },
  { key: "inProgress", label: "In Progress" },
  { key: "done", label: "Done" },
];
const LANE_BATCH_SIZE = 6;

const ProgressMetricCard = ({ value, completed, inProgress, total }) => (
  <div className="px-1 py-1">
    <div className="flex items-center gap-4">
      <div className="relative flex h-[112px] w-[112px] flex-shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#eaf0f8"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#ff623d"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 50}
            strokeDashoffset={2 * Math.PI * 50 * (1 - value / 100)}
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute text-[2rem] font-semibold leading-none text-slate-950">
          {value}%
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[1.05rem] font-semibold text-slate-900">
          Progress Issue
        </p>
        <p className="mt-1 text-sm text-slate-600">{completed} Completed</p>
        <p className="mt-1 text-sm text-slate-600">{inProgress} In Progress</p>
        <p className="mt-1 text-sm text-slate-600">Total of {total} issues</p>
      </div>
    </div>
  </div>
);

const JiraHeaderSection = ({ loading, onSync, onCompose, searchQuery, onSearchChange }) => (
  <section>
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-[280px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-2xl text-[#ff623d]">
            <FaTasks className="h-10 w-10" />
          </div>
          <h1 className="text-[2rem] font-bold leading-tight text-[#ff623d]">
            Project Tracking Workspace
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Kelola dan pantau semua issue Jira Anda dalam satu tempat.
        </p>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="w-full max-w-[540px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari issue atau project..."
            className="h-auto w-full rounded-2xl bg-white px-4 py-4 pl-14 pr-16 text-sm text-slate-700 placeholder:text-slate-400"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
            Ctrl K
          </span>
        </div>
      </form>

      <div className="flex items-center gap-3">
        <Button
          onClick={onSync}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2 rounded-2xl text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>

        <Button
          onClick={onCompose}
          size="sm"
          className="gap-2 rounded-2xl bg-[#ff623d] text-sm text-white hover:bg-[#ff744f]"
        >
          <SquarePen className="h-4 w-4" />
          <span>Compose</span>
        </Button>
      </div>
    </div>
  </section>
);
const JiraLastSynced = ({ lastSyncedAt }) =>
  lastSyncedAt ? (
    <p className="text-sm text-slate-500">
      Terakhir sinkron: {formatDate(lastSyncedAt)}
    </p>
  ) : null;

const JiraMetricsSection = ({ metrics }) => (
  <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
    <div className="shadow-md rounded-[24px] bg-white px-5 py-4">
      <ProgressMetricCard
        value={metrics.progressPercent}
        completed={metrics.doneCount}
        inProgress={metrics.inProgressCount}
        total={metrics.total}
      />
    </div>
    <div className="shadow-md rounded-[24px] bg-white px-5 py-6">
      <p className="text-[1.05rem] font-medium text-slate-700">Total Issue</p>
      <p className="mt-1 text-[3rem] font-semibold leading-none text-slate-900">
        {metrics.total}
      </p>
      <p className="mt-3 text-sm text-slate-500">Seluruh issue di workspace</p>
    </div>
    <div className="shadow-md rounded-[24px] bg-white px-5 py-6">
      <p className="text-[1.05rem] font-medium text-slate-700">Unassigned</p>
      <p className="mt-1 text-[3rem] font-semibold leading-none text-slate-900">
        {metrics.unassignedCount}
      </p>
      <p className="mt-3 text-sm text-slate-500">Belum memiliki assignee</p>
    </div>
    <div className="shadow-md rounded-[24px] bg-white px-5 py-6">
      <p className="text-[1.05rem] font-medium text-slate-700">Overdue</p>
      <p className="mt-1 text-[3rem] font-semibold leading-none text-slate-900">
        {metrics.overdueCount}
      </p>
      <p className="mt-3 text-sm text-slate-500">Tidak ada issue overdue</p>
    </div>
  </section>
);

const JiraBoardSection = ({
  boardGroups,
  summaryLoading,
  aiSummary,
  summaryError,
}) => {
  const [visibleLaneItems, setVisibleLaneItems] = useState({
    todo: LANE_BATCH_SIZE,
    inProgress: LANE_BATCH_SIZE,
    done: LANE_BATCH_SIZE,
  });

  const handleLaneScroll = useCallback((laneKey, event) => {
    const element = event.currentTarget;
    const nearBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 24;
    if (!nearBottom) return;

    setVisibleLaneItems((current) => ({
      ...current,
      [laneKey]: current[laneKey] + LANE_BATCH_SIZE,
    }));
  }, []);

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.85fr] pb-5 xl:items-stretch">
      <div className="order-2 p-1 xl:order-2">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {lanes.map((lane) => {
            const items = boardGroups[lane.key];
            const theme = getLaneTheme(lane.key);

            return (
              <div key={lane.key}>
                <div className="flex shadow-md rounded-xl py-3 items-center gap-2 bg-white px-3 py-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                  <p className="text-[1.05rem] font-semibold text-slate-900">
                    {lane.label}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {items.length}
                  </span>
                  <div className={`mt-4 h-[2px] rounded-full ${theme.line}`} />
                </div>

                <div
                  className="mt-5 pb-10 h-[620px] space-y-3 overflow-y-auto pr-1 custom-scrollbar"
                  onScroll={(event) => handleLaneScroll(lane.key, event)}
                >
                  {items.length === 0 ? (
                    <div className="rounded-[20px] px-4 py-8 text-center text-sm text-slate-400">
                      Belum ada issue pada kolom ini.
                    </div>
                  ) : (
                    items.slice(0, visibleLaneItems[lane.key]).map((issue) => (
                      <div
                        key={issue._key}
                        className="shadow-md rounded-[20px] bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-[1.1rem] font-semibold leading-tight text-slate-950">
                              {issue._key}
                            </h3>
                            <p className="mt-1 text-[13px] leading-5 text-slate-600 line-clamp-2">
                              {issue._summary}
                            </p>
                          </div>
                          {issue._browseUrl ? (
                            <a
                              href={issue._browseUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                              aria-label={`Buka ${issue._key} di Jira`}
                            >
                              <ExternalLink size={15} />
                            </a>
                          ) : null}
                        </div>

                        <div className="mt-4 space-y-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <FolderKanban
                              size={13}
                              className="text-slate-400"
                            />
                            {issue._projectName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <UserRound size={13} className="text-slate-400" />
                            {issue._assignee}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CircleDot size={13} className="text-slate-400" />
                            {formatShortDate(issue._updatedAt)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#faf9f7] px-2.5 py-1.5 text-[11px] font-medium text-slate-700">
                            <CalendarDays
                              size={12}
                              className="text-slate-500"
                            />
                            {issue._dueDate
                              ? formatShortDate(issue._dueDate)
                              : "No dateline"}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#faf9f7] px-2.5 py-1.5 text-[11px] font-medium text-slate-700">
                            <Flag size={12} className="text-[#ff623d]" />
                            {issue._priority}
                          </span>
                          {issue._isBlocked ? (
                            <span className="inline-flex rounded-full bg-rose-100 px-2 py-1 text-[11px] font-medium text-rose-700">
                              Blocked
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="order-1 shadow-md rounded-[24px] bg-white p-5 xl:order-1 xl:flex xl:h-full xl:flex-col">
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

        <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
          {summaryLoading ? (
            <div className="space-y-3">
              <div className="skeleton h-12 rounded-2xl" />
              <div className="skeleton h-32 rounded-3xl" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="skeleton h-24 rounded-2xl" />
                ))}
              </div>
            </div>
          ) : summaryError ? (
            <div className="rounded-2xl bg-rose-50 text-sm text-rose-700">
              {summaryError}
            </div>
          ) : aiSummary ? (
            <>
              <div className="relative rounded-[28px]">
                <div className="rounded-[20px] p-3 border border-[#ff623d] bg-[#fff4ef]">
                  <div className=" items-start gap-3">
                    <div className="flex gap-3">
                      <ListTodo size={18} />
                      <p className="text-lg font-semibold leading-none text-[#ff623d]">
                        Overview
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="mt-2 text-sm leading-4 text-slate-700">
                        {aiSummary.headline}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-3">
                      <Search size={18} />
                      <p className="text-lg font-semibold leading-none text-slate-900">
                        Findings
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-[2px] w-full rounded-full bg-[#eceff3]" />
                  {aiSummary.summary_points?.length ? (
                    <ul className="mt-3 space-y-3 pl-5">
                      {aiSummary.summary_points
                        .slice(0, 3)
                        .map((point, index) => (
                          <li
                            key={`${point}-${index}`}
                            className="relative text-sm leading-4 text-slate-700"
                          >
                            <span className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full bg-[#ff623d]" />
                            {point}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Belum ada temuan tambahan dari AI.
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-3">
                    <div>
                      <ListTodo size={18} />
                    </div>
                    <p className="text-lg font-semibold leading-none text-slate-900">
                      Recommended Action
                    </p>
                  </div>
                  <div className="mt-3 h-[2px] w-full rounded-full bg-[#eceff3]" />
                  {aiSummary.recommendations?.length ? (
                    <ul className="mt-3 space-y-2.5">
                      {aiSummary.recommendations
                        .slice(0, 3)
                        .map((recommendation, index) => (
                          <li
                            key={`${recommendation}-${index}`}
                            className="border border-slate-300 flex items-center justify-between gap-3 rounded-2xl bg-white px-3.5 py-3"
                          >
                            <div className="flex min-w-0 items-start gap-3">
                              <span
                                className={`mt-0.5 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                                  index === 0
                                    ? "bg-[#fff1e8] text-[#ff623d]"
                                    : index === 1
                                      ? "bg-[#fff8e9] text-[#f59e0b]"
                                      : "bg-[#f1ecff] text-[#7c3aed]"
                                }`}
                              >
                                <ListTodo size={18} />
                              </span>
                              <span className="text-sm leading-6 text-slate-800">
                                {recommendation}
                              </span>
                            </div>
                            <ChevronRight
                              size={18}
                              className="flex-shrink-0 text-[#f59b70]"
                            />
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Belum ada rekomendasi tindakan dari AI.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl px-4 py-6 text-sm text-slate-500">
              Klik tombol refresh untuk test hit AI summary ke webhook
              `jira-summary`.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};


const CustomSelect = ({ value, onChange, options, placeholder, disabled, loadingText, emptyText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  let displayText = placeholder || "Pilih opsi";
  if (disabled && loadingText) {
    displayText = loadingText;
  } else if (!disabled && options.length === 0 && emptyText) {
    displayText = emptyText;
  } else if (selectedOption) {
    displayText = selectedOption.label;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-11 w-full items-center justify-between rounded-2xl border px-4 text-sm transition-all focus:outline-none focus:ring-2 ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
            : isOpen
              ? "border-[#ff623d] bg-white text-slate-700 ring-[#ff623d]/20"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:border-[#ff623d] focus:ring-[#ff623d]/20"
        }`}
      >
        <span className="truncate">{displayText}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-100 bg-white p-1 shadow-lg shadow-slate-200/50 outline-none animate-in fade-in zoom-in-95">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">{emptyText || "Tidak ada opsi tersedia"}</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  value === option.value
                    ? "bg-[#fff0eb] font-medium text-[#d85a32]"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const CreateIssueModal = ({
  open,
  form,
  error,
  submitting,
  projects,
  loadingProjects,
  projectsError,
  issueTypes,
  loadingIssueTypes,
  onClose,
  onChange,
  onSubmit,
  onRetryProjects,
  onRetryIssueTypes,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    size="lg"
    className="rounded-[28px]"
  >
    <Modal.Header onClose={onClose} className="pb-3">
      <div>
        <Modal.Title className="text-xl">Buat issue Jira</Modal.Title>
        <p className="mt-1 text-xs text-slate-500">
          Tambahkan tiket baru langsung ke project Jira kamu.
        </p>
      </div>
    </Modal.Header>

    <Modal.Body className="max-h-[70vh] overflow-y-auto pb-2">
      <div className="space-y-4">
        {error ? (
          <Alert variant="error" title="Issue belum bisa dibuat">
            {error}
          </Alert>
        ) : null}

        <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Project & tipe</h3>
            <p className="mt-1 text-xs text-slate-500">
              Pilih project Jira dan tipe issue yang akan dibuat.
            </p>
          </div>

          {projectsError ? (
            <div className="mb-4 flex items-start gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span className="flex-1">{projectsError}</span>
              <button
                type="button"
                onClick={onRetryProjects}
                className="font-semibold text-rose-700 underline-offset-2 hover:underline"
              >
                Coba lagi
              </button>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Project
              </label>
              <CustomSelect
                value={form.projectKey}
                onChange={(val) => onChange("projectKey", val)}
                disabled={loadingProjects}
                placeholder="Pilih project"
                loadingText="Memuat project..."
                options={projects.map((p) => ({ value: p.key, label: `${p.key} — ${p.name}` }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Issue type
              </label>
              <CustomSelect
                value={form.issueTypeId}
                onChange={(val) => onChange("issueTypeId", val)}
                disabled={!form.projectKey || loadingIssueTypes}
                placeholder={!form.projectKey ? "Pilih project dulu" : "Pilih issue type"}
                loadingText="Memuat issue type..."
                emptyText="Tidak ada issue type"
                options={issueTypes.map((t) => ({ value: t.id, label: t.name }))}
              />
              {form.projectKey && !loadingIssueTypes && issueTypes.length === 0 ? (
                <button
                  type="button"
                  onClick={onRetryIssueTypes}
                  className="mt-1 text-xs font-semibold text-[#ff623d] underline-offset-2 hover:underline"
                >
                  Muat ulang issue type
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Judul issue
            </label>
            <Input
              value={form.summary}
              onChange={(event) => onChange("summary", event.target.value)}
              placeholder="Tuliskan judul issue secara singkat"
              className="rounded-2xl"
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Detail tambahan</h3>
            <p className="mt-1 text-xs text-slate-500">
              Atur prioritas, assignee, due date, dan label opsional.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Prioritas
              </label>
              <CustomSelect
                value={form.priority}
                onChange={(val) => onChange("priority", val)}
                placeholder="Pilih prioritas"
                options={PRIORITY_OPTIONS}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Due date
              </label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(event) => onChange("dueDate", event.target.value)}
                className="h-11 rounded-2xl bg-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Assignee account ID
              </label>
              <Input
                value={form.assignee}
                onChange={(event) => onChange("assignee", event.target.value)}
                placeholder="opsional, contoh: 5f8b..."
                className="rounded-2xl"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Labels
              </label>
              <Input
                value={form.labels}
                onChange={(event) => onChange("labels", event.target.value)}
                placeholder="Pisahkan dengan koma, contoh: bug, urgent"
                className="rounded-2xl"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Deskripsi</h3>
            <p className="mt-1 text-xs text-slate-500">
              Jelaskan konteks, langkah reproduksi, atau ekspektasi hasil.
            </p>
          </div>

          <textarea
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="Tulis deskripsi issue..."
            rows={5}
            className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-all duration-150 placeholder:text-slate-400 focus:border-[#ff623d] focus:outline-none focus:ring-2 focus:ring-[#ff623d]/20"
          />
        </section>
      </div>
    </Modal.Body>

    <Modal.Footer>
      <Button
        type="button"
        variant="outline"
        className="rounded-2xl"
        onClick={onClose}
        disabled={submitting}
      >
        Batal
      </Button>
      <Button
        type="button"
        className="rounded-2xl bg-[#ff623d] text-white hover:bg-[#ff744f]"
        onClick={onSubmit}
        disabled={submitting}
      >
        {submitting ? "Membuat..." : "Buat issue"}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default function JiraPage() {
  const location = useLocation();
  const { user } = useAuth();
  const autoComposeOpenedRef = useRef(false);
  const [issues, setIssues] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState("");
  const [jiraLocked, setJiraLocked] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState(createDefaultIssueForm());
  const [composeError, setComposeError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  
  const [issueTypes, setIssueTypes] = useState([]);
  const [loadingIssueTypes, setLoadingIssueTypes] = useState(false);
  const jiraCacheKey = useMemo(
    () => `${JIRA_CACHE_KEY}:${user?.id || "anonymous"}`,
    [user?.id],
  );
  const jiraSummaryCacheKey = useMemo(
    () => `${JIRA_AI_SUMMARY_CACHE_KEY}:${user?.id || "anonymous"}`,
    [user?.id],
  );

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    setProjectsError("");
    try {
      const data = await jiraApi.fetchProjects();
      setProjects(data);
    } catch (err) {
      setProjectsError(err.message || "Gagal memuat project");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const loadIssueTypes = useCallback(async (projectKey) => {
    if (!projectKey) {
      setIssueTypes([]);
      return;
    }
    setLoadingIssueTypes(true);
    try {
      const data = await jiraApi.fetchIssueTypes(projectKey);
      setIssueTypes(data);
    } catch (err) {
      setIssueTypes([]);
    } finally {
      setLoadingIssueTypes(false);
    }
  }, []);

  const handleComposeOpen = useCallback(() => {
    if (jiraLocked) return;

    setComposeOpen(true);
    setComposeForm(createDefaultIssueForm());
    setComposeError("");
    if (projects.length === 0) {
      loadProjects();
    }
  }, [jiraLocked, loadProjects, projects]);

  const handleComposeChange = (field, value) => {
    setComposeForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "projectKey" && prev.projectKey !== value) {
        next.issueTypeId = "";
        next.issueTypeName = "";
        if (value) loadIssueTypes(value);
        else setIssueTypes([]);
      }
      return next;
    });
  };

  const handleComposeSubmit = async () => {
    const errorMsg = validateIssueForm(composeForm);
    if (errorMsg) {
      setComposeError(errorMsg);
      return;
    }
    setSubmitting(true);
    setComposeError("");
    try {
      const payload = buildCreateIssuePayload(composeForm);
      await jiraApi.createIssue(payload);
      toast.success("Issue Jira berhasil dibuat!");
      setComposeOpen(false);
      loadIssues();
    } catch (err) {
      setComposeError(err.message || "Gagal membuat issue.");
    } finally {
      setSubmitting(false);
    }
  };

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError("");
    setJiraLocked(false);

    try {
      const items = await jiraApi.fetchIssues();
      const normalized = items.map(normalizeIssue);
      setIssues(normalized);
      const syncedAt = new Date().toISOString();
      setLastSyncedAt(syncedAt);
      localStorage.setItem(jiraCacheKey, JSON.stringify({ issues: normalized, syncedAt }));
    } catch (err) {
      const isNotConnected = err?.code === JIRA_ERROR_CODES.NOT_CONNECTED;
      setJiraLocked(isNotConnected);
      setError(isNotConnected ? "" : err.message || "Tidak dapat mengambil issue Jira.");
      if (isNotConnected) {
        setIssues([]);
        setAiSummary(null);
        setLastSyncedAt("");
        localStorage.removeItem(jiraCacheKey);
        localStorage.removeItem(jiraSummaryCacheKey);
      }
    } finally {
      setLoading(false);
    }
  }, [jiraCacheKey, jiraSummaryCacheKey]);

  const loadJiraSummary = useCallback(async () => {
    if (jiraLocked) return;

    setSummaryLoading(true);
    setSummaryError("");

    try {
      const summary = await jiraApi.fetchAiSummaryTest();
      setAiSummary(summary);
      localStorage.setItem(jiraSummaryCacheKey, JSON.stringify(summary));
    } catch (err) {
      const isNotConnected = err?.code === JIRA_ERROR_CODES.NOT_CONNECTED;
      setAiSummary(null);
      setSummaryError(isNotConnected ? "" : err.message || "Tidak dapat mengambil AI summary Jira.");
    } finally {
      setSummaryLoading(false);
    }
  }, [jiraLocked, jiraSummaryCacheKey]);

  const handleRefreshAll = useCallback(() => {
    loadIssues();
    loadJiraSummary();
  }, [loadIssues, loadJiraSummary]);

  useEffect(() => {
    if (location.state?.openCompose && !autoComposeOpenedRef.current) {
      autoComposeOpenedRef.current = true;
      handleComposeOpen();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, handleComposeOpen]);

  useEffect(() => {
    try {
      const cachedSummary = localStorage.getItem(jiraSummaryCacheKey);
      if (cachedSummary) {
        const parsedSummary = JSON.parse(cachedSummary);
        if (parsedSummary && typeof parsedSummary === "object") {
          setAiSummary(parsedSummary);
        }
      }

      const cached = localStorage.getItem(jiraCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const cachedIssues = Array.isArray(parsed?.issues)
          ? parsed.issues.map(normalizeIssue)
          : [];

        if (cachedIssues.length > 0) {
          setIssues(cachedIssues);
          setLastSyncedAt(parsed?.syncedAt || "");
          return;
        }
      }
    } catch {
      localStorage.removeItem(jiraCacheKey);
      localStorage.removeItem(jiraSummaryCacheKey);
    }

    loadIssues();
  }, [jiraCacheKey, jiraSummaryCacheKey, loadIssues]);

  const boardGroups = useMemo(() => buildBoardGroups(issues), [issues]);
  const metrics = useMemo(() => buildMetrics(issues), [issues]);
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="space-y-5">
        <JiraHeaderSection
          loading={loading}
          onSync={handleRefreshAll}
          onCompose={handleComposeOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <JiraLastSynced lastSyncedAt={lastSyncedAt} />
        {error ? (
          <div className="mt-5 flex items-start gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {jiraLocked ? (
          <LockedIntegrationState
            className="mt-6 min-h-[560px]"
            title="Project Tracking terkunci"
            description="Hubungkan Jira di Settings terlebih dahulu agar issue, todo, project, dan AI Issue Insights bisa digunakan dari workspace."
          />
        ) : loading && issues.length === 0 ? (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="skeleton h-28 rounded-[22px]" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_0.78fr]">
              <div className="skeleton h-[560px] rounded-[24px]" />
              <div className="skeleton h-[560px] rounded-[24px]" />
            </div>
          </div>
        ) : issues.length === 0 ? (
          <div className="mt-6 rounded-[24px] bg-white px-6 py-16 text-center">
            <Bug size={30} className="mx-auto text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-700">
              Belum ada issue yang ditampilkan.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Klik tombol sync untuk menarik data Jira terbaru.
            </p>
          </div>
        ) : (
          <>
            <JiraMetricsSection metrics={metrics} />
            <JiraBoardSection
              boardGroups={boardGroups}
              summaryLoading={summaryLoading}
              aiSummary={aiSummary}
              summaryError={summaryError}
            />
          </>
        )}
      </div>

      <CreateIssueModal
        open={composeOpen}
        form={composeForm}
        error={composeError}
        submitting={submitting}
        projects={projects}
        loadingProjects={loadingProjects}
        projectsError={projectsError}
        issueTypes={issueTypes}
        loadingIssueTypes={loadingIssueTypes}
        onClose={() => setComposeOpen(false)}
        onChange={handleComposeChange}
        onSubmit={handleComposeSubmit}
        onRetryProjects={loadProjects}
        onRetryIssueTypes={() => loadIssueTypes(composeForm.projectKey)}
      />
    </div>
  );
}
