import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "@/components/ui";
import {
  AlertCircle,
  Bug,
  CalendarDays,
  ChevronRight,
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
import { jiraApi } from "../services/jiraService";

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

const JiraHeaderSection = ({ loading, onSync, searchQuery, onSearchChange }) => (
  <section>
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-[280px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-2xl text-[#ff623d]">
            <FaTasks className="h-10 w-10" />
          </div>
          <h1 className="text-[2rem] font-bold leading-tight text-[#ff623d]">
            Jira Workspace
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

        <Link
          to="/chat/supervisor"
          state={{
            domain: "jira",
            intent: "create_ticket",
            templatePrompt:
              "Buat tiket Jira baru berdasarkan kebutuhan saya.",
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#ff623d] px-4 py-2 text-sm text-white hover:bg-[#ff744f]"
        >
          <SquarePen className="h-4 w-4" />
          <span>Compose</span>
        </Link>
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

export default function JiraPage() {
  const [issues, setIssues] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const items = await jiraApi.fetchIssues();
      const normalized = items.map(normalizeIssue);
      setIssues(normalized);
      const syncedAt = new Date().toISOString();
      setLastSyncedAt(syncedAt);
      localStorage.setItem(
        JIRA_CACHE_KEY,
        JSON.stringify({ issues: normalized, syncedAt }),
      );
    } catch (err) {
      setError(err.message || "Tidak dapat mengambil issue Jira.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadJiraSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError("");

    try {
      const summary = await jiraApi.fetchAiSummaryTest();
      setAiSummary(summary);
      localStorage.setItem(JIRA_AI_SUMMARY_CACHE_KEY, JSON.stringify(summary));
    } catch (err) {
      setAiSummary(null);
      setSummaryError(err.message || "Tidak dapat mengambil AI summary Jira.");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const handleRefreshAll = useCallback(() => {
    loadIssues();
    loadJiraSummary();
  }, [loadIssues, loadJiraSummary]);

  useEffect(() => {
    try {
      const cachedSummary = localStorage.getItem(JIRA_AI_SUMMARY_CACHE_KEY);
      if (cachedSummary) {
        const parsedSummary = JSON.parse(cachedSummary);
        if (parsedSummary && typeof parsedSummary === "object") {
          setAiSummary(parsedSummary);
        }
      }

      const cached = localStorage.getItem(JIRA_CACHE_KEY);
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
      localStorage.removeItem(JIRA_CACHE_KEY);
      localStorage.removeItem(JIRA_AI_SUMMARY_CACHE_KEY);
    }

    loadIssues();
  }, [loadIssues]);

  const boardGroups = useMemo(() => buildBoardGroups(issues), [issues]);
  const metrics = useMemo(() => buildMetrics(issues), [issues]);
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="space-y-5">
        <JiraHeaderSection
          loading={loading}
          onSync={handleRefreshAll}
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

        {loading && issues.length === 0 ? (
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
    </div>
  );
}
