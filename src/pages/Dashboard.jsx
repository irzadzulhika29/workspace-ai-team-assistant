import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { urls, tokenUsageApi } from "../services/api";
import { calendarApi } from "../services/calendarService";
import { jiraApi } from "../services/jiraService";
import { emailApi } from "../services/emailService";
import {
  Alert,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  HeroBanner,
  Input,
  ListItem,
  StatCard,
  TokenUsage,
} from "@/components/ui";

const DONE_STATUS_KEYWORDS = [
  "done",
  "closed",
  "resolved",
  "complete",
  "completed",
];
const REVIEW_STATUS_KEYWORDS = [
  "review",
  "qa",
  "uat",
  "approve",
  "approval",
  "testing",
];
const BRIEFINGS_STORAGE_KEY = "dashboard_briefings_cache";
const TOKEN_LIMIT = 1_000_000;
const DASHBOARD_HERO_BACKGROUND = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg width="1600" height="360" viewBox="0 0 1600 360" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1600" height="360" fill="#141414"/>
    <g opacity="0.85">
      <rect x="560" y="44" width="62" height="256" rx="6" fill="#303030"/>
      <rect x="638" y="16" width="88" height="288" rx="6" fill="#1F1F1F"/>
      <rect x="742" y="70" width="54" height="232" rx="6" fill="#2A2A2A"/>
      <rect x="814" y="30" width="96" height="282" rx="6" fill="#252525"/>
      <rect x="928" y="60" width="48" height="240" rx="6" fill="#353535"/>
      <rect x="992" y="0" width="118" height="320" rx="6" fill="#1B1B1B"/>
      <rect x="1128" y="76" width="58" height="220" rx="6" fill="#303030"/>
      <rect x="1202" y="22" width="86" height="282" rx="6" fill="#222222"/>
      <rect x="1304" y="48" width="52" height="250" rx="6" fill="#2E2E2E"/>
      <rect x="1372" y="12" width="120" height="306" rx="6" fill="#191919"/>
    </g>
    <g opacity="0.25" stroke="#FFFFFF" stroke-width="8">
      <path d="M540 0V360"/>
      <path d="M690 0V360"/>
      <path d="M870 0V360"/>
      <path d="M1060 0V360"/>
      <path d="M1248 0V360"/>
      <path d="M1450 0V360"/>
    </g>
    <g opacity="0.15" stroke="#FFFFFF" stroke-width="3">
      <path d="M0 72H1600"/>
      <path d="M0 164H1600"/>
      <path d="M0 252H1600"/>
    </g>
  </svg>
`)}`;

const getBriefingsCacheKey = (userId) =>
  `${BRIEFINGS_STORAGE_KEY}:${userId || "anonymous"}`;

const readBriefingsCache = (userId) => {
  try {
    const raw = localStorage.getItem(getBriefingsCacheKey(userId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.briefings || typeof parsed.briefings !== "object") {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to read dashboard briefings cache:", error);
    return null;
  }
};

const writeBriefingsCache = (userId, payload) => {
  try {
    localStorage.setItem(getBriefingsCacheKey(userId), JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to write dashboard briefings cache:", error);
  }
};

const getIssueStatus = (issue) => {
  if (!issue || typeof issue !== "object") return "Unknown";
  return (
    issue.fields?.status?.name ||
    issue.status?.name ||
    issue.status ||
    issue.state ||
    "Unknown"
  );
};

const getIssueStatusCategory = (issue) => {
  return (
    issue?.fields?.status?.statusCategory?.key ||
    issue?.fields?.status?.statusCategory?.name ||
    ""
  );
};

const isIssueDone = (issue) => {
  const categoryKey = String(getIssueStatusCategory(issue)).toLowerCase();
  if (categoryKey === "done") return true;

  const status = String(getIssueStatus(issue)).toLowerCase();
  return DONE_STATUS_KEYWORDS.some((keyword) => status.includes(keyword));
};

const isIssueInReview = (issue) => {
  const status = String(getIssueStatus(issue)).toLowerCase();
  return REVIEW_STATUS_KEYWORDS.some((keyword) => status.includes(keyword));
};

const isIssueOverdue = (issue) => {
  const dueDate = issue?.fields?.duedate;
  if (!dueDate || isIssueDone(issue)) return false;

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(due.getTime()) && due < today;
};

const buildJiraSummary = (items) => {
  const safeItems = Array.isArray(items) ? items : [];
  const statusCount = {};
  let doneCount = 0;

  for (const issue of safeItems) {
    const status = getIssueStatus(issue);
    const normalizedStatus = String(status).trim() || "Unknown";
    statusCount[normalizedStatus] = (statusCount[normalizedStatus] || 0) + 1;

    if (isIssueDone(issue)) {
      doneCount += 1;
    }
  }

  const total = safeItems.length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const byStatus = Object.entries(statusCount)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({ status, count }));

  return {
    total,
    done: doneCount,
    percent,
    byStatus,
  };
};

const extractEmailHeader = (email, name) => {
  const header = email?.payload?.headers?.find(
    (item) => item.name?.toLowerCase() === name.toLowerCase(),
  );
  return header?.value || "";
};

const extractSenderName = (from = "") => {
  const match = from.match(/^([^<]+)/);
  return match ? match[1].trim() : from;
};

const formatEventTime = (event) => {
  const startDate = event?.start?.dateTime || event?.start?.date;
  if (!startDate) return "Waktu belum tersedia";

  const dateObj = new Date(startDate);
  if (!event?.start?.dateTime) return "Seharian";

  return dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatEventDate = (event) => {
  const startDate = event?.start?.dateTime || event?.start?.date;
  if (!startDate) return "Tanggal belum tersedia";

  return new Date(startDate).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCompactNumber = (value) => {
  const safeValue = Number(value || 0);

  if (safeValue >= 1_000_000) {
    return `${(safeValue / 1_000_000).toFixed(safeValue >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  }

  if (safeValue >= 1_000) {
    return `${(safeValue / 1_000).toFixed(safeValue >= 10_000 ? 0 : 1).replace(/\.0$/, "")}k`;
  }

  return String(safeValue);
};

const abbreviateLabel = (value) => {
  if (!value) return "N/A";

  const chunks = String(value)
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (chunks.length >= 2) {
    return chunks
      .slice(0, 3)
      .map((chunk) => chunk[0])
      .join("")
      .toUpperCase();
  }

  return chunks[0].slice(0, 3).toUpperCase();
};

const getAvatarInitials = (value) =>
  String(value || "AI")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const getDaysUntil = (event) => {
  const startDate = event?.start?.dateTime || event?.start?.date;
  if (!startDate) return null;

  const eventDate = new Date(startDate);
  const now = new Date();
  const diff = Math.ceil((eventDate - now) / 86_400_000);
  return diff;
};

const createTokenSeries = (rows) => {
  const buckets = new Map();

  for (const row of Array.isArray(rows) ? rows : []) {
    const key =
      row.llm_model || row.workflow_name || row.workflow_id || "Unknown";
    const total =
      Number(row.input_tokens || 0) + Number(row.completion_tokens || 0);
    buckets.set(key, (buckets.get(key) || 0) + total);
  }

  const entries = Array.from(buckets.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxValue = entries[0]?.[1] || 1;

  return entries.map(([label, value]) => ({
    label: abbreviateLabel(label),
    value,
    percentage: Math.max(12, Math.round((value / maxValue) * 100)),
  }));
};

const DashboardShell = ({ title, subtitle, countLabel, children, actions }) => (
  <Card className="flex h-full flex-col overflow-hidden rounded-[1.6rem] border-primary-200/70 shadow-sm hover:shadow-sm">
    <CardHeader className="flex-row items-start justify-between gap-4 pb-5">
      <div>
        <CardTitle className="text-[2rem] font-bold tracking-tight text-neutral-900">
          {title}
        </CardTitle>
        {subtitle ? (
          <p className="mt-1 text-xs text-neutral-400">{subtitle}</p>
        ) : null}
      </div>
      {countLabel ? (
        <Badge
          variant="outline"
          className="rounded-md bg-neutral-200 px-3 py-1 text-[11px] font-semibold text-neutral-800"
        >
          {countLabel}
        </Badge>
      ) : null}
    </CardHeader>
    <CardContent className="flex flex-1 flex-col gap-5">
      {children}
      {actions ? <div className="mt-auto flex gap-3">{actions}</div> : null}
    </CardContent>
  </Card>
);

const ActionLink = ({ to, state, children, primary = false }) => (
  <Button
    asChild
    variant={primary ? "primary" : "outline"}
    className="flex-1 rounded-xl"
  >
    <Link to={to} state={state}>
      {children}
    </Link>
  </Button>
);

const TopBar = ({
  user,
  searchQuery,
  onSearchChange,
  notificationCount,
  refreshing,
  onRefresh,
}) => (
  <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <Input
      value={searchQuery}
      onChange={(event) => onSearchChange(event.target.value)}
      placeholder="Search"
      icon={<Search className="h-5 w-5" />}
      className="h-12 max-w-2xl rounded-full border-neutral-200 bg-white/92 pl-12 pr-4 shadow-sm"
    />

    <div className="flex items-center justify-between gap-3 lg:justify-end">
      <Button
        onClick={onRefresh}
        disabled={refreshing}
        variant="ghost"
        size="icon"
        className="relative h-11 w-11 rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
      >
        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
      </Button>

      <div className="relative rounded-full border border-neutral-200 bg-white p-2 shadow-sm">
        <Bell className="h-5 w-5 text-neutral-500" />
        {notificationCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-primary-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {notificationCount}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm">
        <Avatar size="sm">
          {user?.picture ? (
            <AvatarImage src={user.picture} alt={user.name} />
          ) : (
            <AvatarFallback>{getAvatarInitials(user?.name)}</AvatarFallback>
          )}
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {user?.name || "Admin"}
          </p>
          {/* <p className="truncate text-xs text-neutral-500">
            {user?.email || "Workspace User"}
          </p> */}
        </div>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [nextEvents, setNextEvents] = useState([]);
  const [jiraIssues, setJiraIssues] = useState([]);
  const [unreadEmails, setUnreadEmails] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingJira, setLoadingJira] = useState(true);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [calendarError, setCalendarError] = useState("");
  const [jiraError, setJiraError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [calendarBriefing, setCalendarBriefing] = useState(null);
  const [emailBriefing, setEmailBriefing] = useState(null);
  const [jiraBriefing, setJiraBriefing] = useState(null);
  const [briefingsCacheResolved, setBriefingsCacheResolved] = useState(false);
  const [tokenSummary, setTokenSummary] = useState({
    totalTokens: 0,
    totalExecutions: 0,
    totalInputTokens: 0,
    totalCompletionTokens: 0,
  });
  const [tokenRows, setTokenRows] = useState([]);

  const applyBriefingsPayload = useCallback((payload) => {
    const briefings = payload?.briefings || {};

    setJiraBriefing(briefings.jira || null);
    setCalendarBriefing(briefings.calendar || null);
    setEmailBriefing(briefings.email || null);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const cachedBriefings = readBriefingsCache(user?.id);
    if (cachedBriefings) {
      applyBriefingsPayload(cachedBriefings);
    }

    setBriefingsCacheResolved(true);
  }, [applyBriefingsPayload, authLoading, user?.id]);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    setCalendarError("");

    try {
      const payload = await calendarApi.fetchCalendarEvents();
      const items = Array.isArray(payload?.items) ? payload.items : [];
      setNextEvents(items.slice(0, 5));
    } catch (err) {
      setCalendarError(err.message || "Tidak dapat mengambil jadwal kalender.");
      setNextEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const loadJira = useCallback(async () => {
    setLoadingJira(true);
    setJiraError("");

    try {
      const items = await jiraApi.fetchIssues();
      setJiraIssues(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Dashboard Jira error:", err);
      setJiraError(err.message || "Tidak dapat mengambil progres Jira.");
      setJiraIssues([]);
    } finally {
      setLoadingJira(false);
    }
  }, []);

  const loadEmails = useCallback(async () => {
    setLoadingEmails(true);
    setEmailError("");

    try {
      const response = await emailApi.listEmails({
        q: "is:unread",
        maxResults: 5,
      });

      const emailDetails = await Promise.all(
        (response.messages || []).slice(0, 5).map(async (message) => {
          try {
            return await emailApi.getEmail(message.id);
          } catch (err) {
            console.error("Error fetching email detail:", err);
            return null;
          }
        }),
      );

      setUnreadEmails(emailDetails.filter(Boolean));
    } catch (err) {
      console.error("Dashboard Email error:", err);
      setEmailError(err.message || "Tidak dapat mengambil email.");
      setUnreadEmails([]);
    } finally {
      setLoadingEmails(false);
    }
  }, []);

  const loadTokenUsage = useCallback(async () => {
    setLoadingTokens(true);
    setTokenError("");

    try {
      const payload = await tokenUsageApi.ambilDataToken(50);
      setTokenSummary(
        payload?.summary || {
          totalTokens: 0,
          totalExecutions: 0,
          totalInputTokens: 0,
          totalCompletionTokens: 0,
        },
      );
      setTokenRows(Array.isArray(payload?.rows) ? payload.rows : []);
    } catch (err) {
      setTokenError(err.message || "Tidak dapat mengambil token usage.");
      setTokenSummary({
        totalTokens: 0,
        totalExecutions: 0,
        totalInputTokens: 0,
        totalCompletionTokens: 0,
      });
      setTokenRows([]);
    } finally {
      setLoadingTokens(false);
    }
  }, []);

  useEffect(() => {
    if (!briefingsCacheResolved) return;

    loadEvents();
    loadJira();
    loadEmails();
    loadTokenUsage();
  }, [
    briefingsCacheResolved,
    loadEmails,
    loadEvents,
    loadJira,
    loadTokenUsage,
  ]);

  const handleRefreshBriefings = useCallback(async () => {
    setRefreshing(true);
    setRefreshError("");

    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

      let googleAccessToken = null;
      try {
        const tokenResponse = await axios.get(
          `${backendUrl}/api/google/token`,
          {
            withCredentials: true,
            timeout: 8_000,
          },
        );
        googleAccessToken = tokenResponse.data.access_token || null;
      } catch (err) {
        console.warn(
          "Could not fetch Google token:",
          err.response?.data || err.message,
        );
      }

      let jiraAuthBase64 = null;
      let jiraSubdomain = null;
      try {
        const jiraResponse = await axios.get(
          `${backendUrl}/api/integrations/jira/n8n-credentials`,
          {
            withCredentials: true,
            timeout: 8_000,
          },
        );
        const jiraCredentials = jiraResponse.data?.jira_credentials;
        if (jiraCredentials?.email && jiraCredentials?.api_token) {
          jiraAuthBase64 = btoa(
            `${jiraCredentials.email}:${jiraCredentials.api_token}`,
          );
          jiraSubdomain = jiraCredentials.subdomain;
        }
      } catch (err) {
        console.warn(
          "Could not fetch Jira credentials:",
          err.response?.data || err.message,
        );
      }

      const response = await fetch(urls.getBriefings(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          google_access_token: googleAccessToken,
          jira_auth_base64: jiraAuthBase64,
          jira_subdomain: jiraSubdomain,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh briefings");
      }

      const briefingsResult = await response.json();
      writeBriefingsCache(user?.id, briefingsResult);
      applyBriefingsPayload(briefingsResult);

      await Promise.all([
        loadEvents(),
        loadJira(),
        loadEmails(),
        loadTokenUsage(),
      ]);
    } catch (err) {
      console.error("Error refreshing briefings:", err);
      setRefreshError(
        "Gagal refresh briefings. Data n8n belum memberi payload lengkap atau webhook sedang gagal.",
      );
    } finally {
      setRefreshing(false);
    }
  }, [
    applyBriefingsPayload,
    loadEmails,
    loadEvents,
    loadJira,
    loadTokenUsage,
    user?.id,
  ]);

  const jiraSummary = useMemo(() => buildJiraSummary(jiraIssues), [jiraIssues]);

  const jiraMetrics = useMemo(() => {
    const sourceMetrics = jiraBriefing?.source_metrics || {};
    const openCount =
      sourceMetrics.total_issues ??
      jiraIssues.filter((issue) => !isIssueDone(issue)).length;
    const reviewCount =
      sourceMetrics.in_review_issues ??
      sourceMetrics.in_progress_issues ??
      jiraIssues.filter(isIssueInReview).length;
    const overdueCount =
      sourceMetrics.overdue_issues ??
      sourceMetrics.blocked_issues ??
      jiraIssues.filter(isIssueOverdue).length;

    return {
      open: openCount || 0,
      review: reviewCount || 0,
      overdue: overdueCount || 0,
    };
  }, [jiraBriefing?.source_metrics, jiraIssues]);

  const jiraSummaryText = useMemo(() => {
    if (jiraBriefing?.headline) return jiraBriefing.headline;
    if (jiraBriefing?.summary_points?.[0])
      return jiraBriefing.summary_points[0];
    if (!jiraIssues.length)
      return "Belum ada issue Jira yang terdeteksi untuk diringkas.";

    const statusLines = jiraSummary.byStatus
      .slice(0, 3)
      .map((status) => `${status.status}: ${status.count} issue`)
      .join(", ");

    return `Distribusi issue saat ini: ${statusLines}.`;
  }, [
    jiraBriefing?.headline,
    jiraBriefing?.summary_points,
    jiraIssues.length,
    jiraSummary.byStatus,
  ]);

  const query = searchQuery.trim().toLowerCase();

  const visibleEvents = useMemo(() => {
    if (!query) return nextEvents;
    return nextEvents.filter((event) =>
      String(event?.summary || "")
        .toLowerCase()
        .includes(query),
    );
  }, [nextEvents, query]);

  const visibleEmails = useMemo(() => {
    if (!query) return unreadEmails;

    return unreadEmails.filter((email) => {
      const from = extractEmailHeader(email, "From");
      const subject = extractEmailHeader(email, "Subject");
      const snippet = email?.snippet || "";

      return [from, subject, snippet].some((value) =>
        String(value).toLowerCase().includes(query),
      );
    });
  }, [query, unreadEmails]);

  const heroDescription = useMemo(() => {
    if (jiraBriefing?.headline) return jiraBriefing.headline;
    if (calendarBriefing?.headline) return calendarBriefing.headline;
    if (emailBriefing?.headline) return emailBriefing.headline;
    return "Menampilkan issue Jira, agenda terdekat, email penting, dan token usage dari workspace operasional Anda.";
  }, [
    calendarBriefing?.headline,
    emailBriefing?.headline,
    jiraBriefing?.headline,
  ]);

  const greetingName = user?.name?.split(" ")[0] || "Admin";
  const leadEvent = visibleEvents[0];
  const supportingEvents = visibleEvents.slice(1, 3);
  const leadEventDays = leadEvent ? getDaysUntil(leadEvent) : null;
  const notificationCount =
    emailBriefing?.source_metrics?.total_unread || visibleEmails.length || 0;
  const tokenSeries = useMemo(() => createTokenSeries(tokenRows), [tokenRows]);
  const tokenUsagePercent = Math.min(
    100,
    Math.round(((tokenSummary.totalTokens || 0) / TOKEN_LIMIT) * 100),
  );

  return (
    <div>
      <div className="mx-auto max-w-[1400px]">
        <TopBar
          user={user}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notificationCount={notificationCount}
          refreshing={refreshing}
          onRefresh={handleRefreshBriefings}
        />

        {refreshError ? (
          <Alert
            variant="warning"
            title="Refresh briefing gagal"
            className="mb-5"
          >
            {refreshError}
          </Alert>
        ) : null}

      

        <HeroBanner
          title={`Morning, ${greetingName}`}
          description={heroDescription}
          backgroundImage={DASHBOARD_HERO_BACKGROUND}
          className="mb-5 rounded-[1.8rem] py-8"
        />

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <DashboardShell
            title="Jira Sync"
            actions={
              <>
                <ActionLink to="/workspace/jira" primary>
                  Lihat Jira
                </ActionLink>
                <ActionLink
                  to="/chat/supervisor"
                  state={{
                    domain: "jira",
                    intent: "generate_report",
                    templatePrompt: "Buatkan laporan progres Jira hari ini",
                    context: jiraBriefing
                      ? { briefing: jiraBriefing }
                      : {
                          summary: jiraSummary,
                          issues: jiraIssues.slice(0, 10),
                        },
                  }}
                >
                  Buat Report
                </ActionLink>
              </>
            }
          >
            {loadingJira ? (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="skeleton h-32 rounded-xl" />
                  ))}
                </div>
                <div className="skeleton h-28 rounded-2xl" />
              </>
            ) : jiraError && !jiraBriefing ? (
              <Alert variant="error" title="Jira sync error">
                {jiraError}
              </Alert>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <StatCard
                    label="Open Project"
                    value={jiraMetrics.open}
                    caption="Total issue aktif yang masih berjalan."
                    trendIcon={<TrendingUp className="h-4 w-4" />}
                  />
                  <StatCard
                    label="In Review"
                    value={jiraMetrics.review}
                    caption="Issue yang masuk tahap review atau QA."
                    trendIcon={<CheckCircle2 className="h-4 w-4" />}
                  />
                  <StatCard
                    label="Overdue"
                    value={jiraMetrics.overdue}
                    caption="Issue melewati due date dan belum selesai."
                    trendIcon={<Clock3 className="h-4 w-4" />}
                  />
                </div>

                <div className="rounded-2xl bg-white/80 px-1">
                  <p className="text-[1.05rem] leading-8 text-neutral-700">
                    <span className="font-semibold text-neutral-900">
                      {jiraSummaryText}
                    </span>{" "}
                    {jiraBriefing?.summary_points?.[1] ||
                      (jiraSummary.total
                        ? `Saat ini ${jiraSummary.done} issue telah selesai dari ${jiraSummary.total} issue yang terlacak.`
                        : "Belum ada issue yang bisa diringkas dari Jira saat ini.")}
                  </p>
                </div>
              </>
            )}
          </DashboardShell>

          <DashboardShell
            title="Agenda"
            subtitle={
              leadEventDays !== null
                ? leadEventDays > 0
                  ? `End in ${leadEventDays} Days`
                  : "Scheduled today"
                : calendarBriefing?.headline || "Agenda terdekat"
            }
            actions={
              <>
                <ActionLink
                  to="/chat/supervisor"
                  primary
                  state={{
                    domain: "calendar",
                    intent: "prepare_meeting",
                    templatePrompt:
                      "Siapkan brief meeting dan agenda untuk event terdekat",
                    context: calendarBriefing
                      ? {
                          briefing: calendarBriefing,
                          events: visibleEvents.slice(0, 3),
                        }
                      : { events: visibleEvents.slice(0, 3) },
                  }}
                >
                  Siapkan Brief
                </ActionLink>
                <ActionLink to="/workspace/calendar">Lihat Calendar</ActionLink>
              </>
            }
          >
            {loadingEvents ? (
              <>
                <div className="skeleton h-28 rounded-2xl" />
                <div className="skeleton h-16 rounded-2xl" />
                <div className="skeleton h-16 rounded-2xl" />
              </>
            ) : calendarError && !leadEvent ? (
              <Alert variant="error" title="Agenda error">
                {calendarError}
              </Alert>
            ) : leadEvent ? (
              <>
                <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4">
                  <p className="text-xl font-semibold text-neutral-900">
                    {leadEvent.summary || "Tanpa judul"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4 text-primary-500" />
                      {formatEventDate(leadEvent)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-primary-500" />
                      {formatEventTime(leadEvent)}
                    </span>
                  </div>
                  <div className="mt-4 flex -space-x-2">
                    {(leadEvent?.attendees || [])
                      .slice(0, 3)
                      .map((attendee, index) => (
                        <Avatar
                          key={`${attendee.email || attendee.displayName || index}`}
                          size="sm"
                          className="border-2 border-white shadow-sm"
                        >
                          <AvatarFallback>
                            {getAvatarInitials(
                              attendee.displayName || attendee.email || "AT",
                            )}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    {!leadEvent?.attendees || leadEvent.attendees.length === 0
                      ? ["DS", "PM", "UX"].map((initial) => (
                          <Avatar
                            key={initial}
                            size="sm"
                            className="border-2 border-white shadow-sm"
                          >
                            <AvatarFallback>{initial}</AvatarFallback>
                          </Avatar>
                        ))
                      : null}
                  </div>
                </div>

                <div className="space-y-4">
                  {supportingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="grid grid-cols-[88px_1fr] gap-4"
                    >
                      <div className="text-sm font-semibold text-neutral-700">
                        {formatEventTime(event)}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-neutral-900">
                          {event.summary || "Tanpa judul"}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {calendarBriefing?.summary_points?.[0] ||
                            "Agenda kerja terjadwal"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<CalendarDays className="h-8 w-8" />}
                title="Belum ada agenda"
                description="Kalender belum mengembalikan event yang cocok untuk ditampilkan di dashboard."
              />
            )}
          </DashboardShell>

          <DashboardShell
            title="Comms"
            subtitle={
              emailBriefing?.headline ||
              (notificationCount
                ? `Ada ${notificationCount} email perlu ditinjau`
                : "Inbox relatif tenang")
            }
            actions={
              <>
                <ActionLink
                  to="/chat/supervisor"
                  primary
                  state={{
                    domain: "email",
                    intent: "draft_reply",
                    templatePrompt: "Buatkan draft balasan untuk email penting",
                    context: emailBriefing
                      ? {
                          briefing: emailBriefing,
                          emails: visibleEmails.slice(0, 4),
                        }
                      : { emails: visibleEmails.slice(0, 4) },
                  }}
                >
                  Draft Reply
                </ActionLink>
                <ActionLink to="/workspace/email">Lihat Email</ActionLink>
              </>
            }
          >
            {loadingEmails ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton h-24 rounded-2xl" />
              ))
            ) : emailError && !visibleEmails.length ? (
              <Alert variant="error" title="Email sync error">
                {emailError}
              </Alert>
            ) : visibleEmails.length ? (
              <div className="space-y-3">
                {visibleEmails.slice(0, 4).map((email, index) => {
                  const from = extractEmailHeader(email, "From");
                  const subject = extractEmailHeader(email, "Subject");
                  const senderName = extractSenderName(from);

                  return (
                    <ListItem
                      key={email.id}
                      sender={senderName || "Pengirim tidak diketahui"}
                      title={subject || "(Tanpa subjek)"}
                      body={email.snippet || "Ringkasan email belum tersedia."}
                      badge={{
                        label: index === 0 ? "Urgent" : "Unread",
                        variant: index === 0 ? "urgent" : "info",
                      }}
                      className="rounded-xl px-4 py-3 shadow-none"
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Mail className="h-8 w-8" />}
                title="Tidak ada email belum dibaca"
                description="Inbox tidak memiliki email baru yang perlu diangkat ke dashboard saat ini."
              />
            )}
          </DashboardShell>

          <DashboardShell
            title="Token Economy"
            subtitle="Ditarik dari log eksekusi n8n terbaru"
            actions={
              <>
                <ActionLink to="/monitoring/tokens" primary>
                  Lihat Detail
                </ActionLink>
                <ActionLink
                  to="/chat/supervisor"
                  state={{
                    domain: "operations",
                    intent: "token_review",
                    templatePrompt:
                      "Tolong rangkum penggunaan token dan berikan rekomendasi efisiensi.",
                    context: { tokenSummary, tokenSeries },
                  }}
                >
                  Minta Analisis
                </ActionLink>
              </>
            }
          >
            {loadingTokens ? (
              <>
                <div className="skeleton h-28 rounded-2xl" />
                <div className="skeleton h-48 rounded-2xl" />
              </>
            ) : tokenError ? (
              <Alert variant="error" title="Token usage error">
                {tokenError}
              </Alert>
            ) : (
              <>
                <TokenUsage
                  used={formatCompactNumber(tokenSummary.totalTokens)}
                  limit="1M Limit"
                />

                <div className="rounded-2xl bg-white p-2">
                  <div className="mb-4 flex items-end justify-between gap-3 px-2 text-xs font-semibold text-neutral-400">
                    <span>0</span>
                    <span>{tokenUsagePercent}%</span>
                    <span>100%</span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 px-2 sm:grid-cols-8">
                    {tokenSeries.map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="relative flex h-44 w-4 items-end overflow-hidden rounded-full bg-primary-100/70">
                          <div
                            className="w-full rounded-full bg-primary-500 shadow-[0_0_12px_rgba(232,67,34,0.35)]"
                            style={{ height: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-neutral-500">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </DashboardShell>
        </section>
      </div>
    </div>
  );
}
