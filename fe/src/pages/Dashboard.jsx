import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  AnimatedList,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselItem,
  CarouselNavigation,
  CardHeader,
  CardTitle,
  EmptyState,
  HeroBanner,
  Input,
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
const DASHBOARD_RUNTIME_CACHE = new Map();
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

const getDashboardRuntimeCacheKey = (userId) => userId || "anonymous";

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

const readDashboardRuntimeCache = (userId) =>
  DASHBOARD_RUNTIME_CACHE.get(getDashboardRuntimeCacheKey(userId)) || null;

const writeDashboardRuntimeCache = (userId, payload) => {
  DASHBOARD_RUNTIME_CACHE.set(getDashboardRuntimeCacheKey(userId), payload);
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
  if (header?.value) return header.value;

  const flatFieldMap = {
    from: email?.from,
    to: email?.to,
    subject: email?.subject,
    date: email?.date,
  };

  return flatFieldMap[name.toLowerCase()] || "";
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

const buildEventDetails = (event) => {
  if (!event || typeof event !== "object") return "Detail agenda belum tersedia.";

  const attendees = Array.isArray(event.attendees) ? event.attendees : [];
  const attendeeText = attendees.length
    ? `\nPeserta: ${attendees
        .map((attendee) => attendee.email || attendee.displayName)
        .filter(Boolean)
        .join(", ")}`
    : "";

  return `Event: ${event.summary || "Tanpa judul"}
Waktu: ${formatEventDate(event)} ${formatEventTime(event)}${event.location ? `\nLokasi: ${event.location}` : ""}${attendeeText}${event.description ? `\nDeskripsi: ${event.description}` : ""}${event.hangoutLink ? `\nGoogle Meet: ${event.hangoutLink}` : ""}`;
};

const buildAgendaContext = (event) => ({
  event_id: String(event?.id || "").trim(),
  event_summary: event?.summary || "Tanpa judul",
  event_start: event?.start?.dateTime || event?.start?.date || "",
  event_end: event?.end?.dateTime || event?.end?.date || "",
  event_location: event?.location || "",
  event_description: event?.description || "",
  event_hangout_link: event?.hangoutLink || "",
  event_attendees: Array.isArray(event?.attendees)
    ? event.attendees
        .map((attendee) => attendee.email || attendee.displayName)
        .filter(Boolean)
    : [],
});

const buildActionPromptWithAgendaContext = (action, event) => {
  const basePrompt = String(action?.prompt || "").trim();
  const eventDetails = buildEventDetails(event);
  const contextBlock = `Konteks agenda lengkap:\n${eventDetails}`;

  if (!basePrompt) return contextBlock;
  if (basePrompt.includes(eventDetails)) return basePrompt;
  return `${basePrompt}\n\n${contextBlock}`;
};

const buildEmailDetails = (email) => {
  const from = extractEmailHeader(email, "From");
  const subject = extractEmailHeader(email, "Subject");
  const senderName = extractSenderName(from) || "Pengirim tidak diketahui";

  return `Pengirim: ${senderName}
From: ${from || "-"}
Subject: ${subject || "(Tanpa subjek)"}
Snippet: ${email?.snippet || "-"}
Body ringkas: ${email?.body || email?.snippet || "-"}`;
};

const buildEmailContext = (email) => ({
  email_id: String(email?.id || "").trim(),
  thread_id: String(email?.threadId || "").trim(),
  email_from: extractEmailHeader(email, "From"),
  email_subject: extractEmailHeader(email, "Subject"),
  email_snippet: email?.snippet || "",
  email_body: email?.body || "",
  email_sender_name:
    extractSenderName(extractEmailHeader(email, "From")) ||
    "Pengirim tidak diketahui",
});

const buildEmailActionPrompt = (action, email) => {
  const basePrompt = String(action?.prompt || "").trim();
  const emailDetails = buildEmailDetails(email);
  const contextBlock = `Konteks email lengkap:\n${emailDetails}`;
  const formatInstruction =
    "DRAFT SAJA. Jangan kirim email dan jangan meminta konfirmasi pengiriman. WAJIB gunakan Communication Agent dengan Get Email Skills/create_email.md sebelum menulis draft final. Body draft harus HTML rapi dengan inline CSS, bukan Markdown/plain text.";

  if (!basePrompt) {
    return `Buatkan draft balasan profesional untuk email berikut.\n\n${formatInstruction}\n\n${contextBlock}`;
  }

  if (/Konteks email lengkap:/i.test(basePrompt)) return `${basePrompt}\n\n${formatInstruction}`;
  if (basePrompt.includes(emailDetails)) return `${basePrompt}\n\n${formatInstruction}`;
  return `${basePrompt}\n\n${formatInstruction}\n\n${contextBlock}`;
};

const createEmailPromptCard = (action, email, briefing) => ({
  type: "email_recommendation",
  badge: "Email Recommendation",
  title: extractEmailHeader(email, "Subject") || "(Tanpa subjek)",
  from: extractSenderName(extractEmailHeader(email, "From")) || extractEmailHeader(email, "From") || "-",
  date: extractEmailHeader(email, "Date") || "",
  summary:
    email?.snippet ||
    briefing?.focus_email?.reason ||
    "Email prioritas dari dashboard untuk ditindaklanjuti lewat Supervisor.",
  intent: action?.intent || "draft_reply",
});

const getAgendaLookupKey = (value) =>
  String(value?.threadId || value?.id || "").trim();

const createAgendaActionState = (action, event, briefing) => ({
  autoSendMessage: buildActionPromptWithAgendaContext(action, event),
  preFillOnly: true,
  domain: "calendar",
  intent: action.intent,
  templatePrompt: buildActionPromptWithAgendaContext(action, event),
  context: {
    briefing,
    event,
    action,
    briefing_domain: "calendar",
    ...buildAgendaContext(event),
    ...(action.context && typeof action.context === "object"
      ? action.context
      : {}),
  },
});

const createEmailActionState = (action, email, briefing) => ({
  autoSendMessage: buildEmailActionPrompt(action, email),
  preFillOnly: true,
  displayContent: "Buatkan draft balasan email yang profesional dan sesuai konteks.",
  promptCard: createEmailPromptCard(action, email, briefing),
  domain: "email",
  intent: action?.intent || "draft_reply",
  templatePrompt: buildEmailActionPrompt(action, email),
  context: {
    briefing,
    email,
    action,
    briefing_domain: "email",
    ...buildEmailContext(email),
    ...(action?.context && typeof action.context === "object"
      ? action.context
      : {}),
  },
});

const buildFallbackAgendaActions = (event) => {
  const eventId = String(event?.id || "").trim();
  const details = buildEventDetails(event);
  const baseContext = {
    briefing_domain: "calendar",
    focus: "event_preparation",
    event_ids: eventId ? [eventId] : [],
    thread_id: eventId,
  };

  return [
    {
      label: "Susun Rundown",
      intent: "prepare_rundown",
      target: "supervisor",
      prompt: `Buatkan rundown meeting yang ringkas, urutan bahasan, estimasi waktu, dan output yang perlu dicapai untuk event berikut:\n\n${details}`,
      context: {
        ...baseContext,
        focus: "meeting_rundown",
      },
    },
    {
      label: "Susun Talking Points",
      intent: "prepare_talking_points",
      target: "supervisor",
      prompt: `Buatkan talking points utama, pertanyaan penting, dan outcome yang perlu dicapai untuk event berikut:\n\n${details}`,
      context: {
        ...baseContext,
        focus: "talking_points",
      },
    },
    {
      label: event?.hangoutLink ? "Buat Follow-up" : "Lengkapi Catatan",
      intent: event?.hangoutLink ? "follow_up_event" : "enrich_event_notes",
      target: "supervisor",
      prompt: event?.hangoutLink
        ? `Buatkan draft follow-up dan daftar next step untuk event berikut:\n\n${details}`
        : `Tolong bantu lengkapi catatan persiapan dan kebutuhan yang perlu dicek untuk event berikut:\n\n${details}`,
      context: {
        ...baseContext,
        focus: event?.hangoutLink ? "follow_up" : "event_notes",
      },
    },
  ];
};

const createDailyTokenSeries = (rows, limit = TOKEN_LIMIT) => {
  const buckets = new Map();

  for (const row of Array.isArray(rows) ? rows : []) {
    const timestamp = row?.timestamp ? new Date(row.timestamp) : null;
    if (!timestamp || Number.isNaN(timestamp.getTime())) continue;

    const dayKey = timestamp.toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });
    const total =
      Number(row.input_tokens || 0) + Number(row.completion_tokens || 0);

    buckets.set(dayKey, (buckets.get(dayKey) || 0) + total);
  }

  const sortedDays = Array.from(buckets.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  return sortedDays.map(([dayKey, total]) => {
    const dayDate = new Date(`${dayKey}T00:00:00+07:00`);
    const percentage = Math.min(
      100,
      Math.round((total / Math.max(limit, 1)) * 100),
    );

    return {
      key: dayKey,
      label: dayDate.toLocaleDateString("id-ID", {
        day: "2-digit",
      }),
      total,
      percentage,
      fillPercentage: Math.max(percentage, total > 0 ? 12 : 0),
    };
  });
};

const formatMonthLabel = (value) => {
  if (!value) return "Bulan ini";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Bulan ini";

  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
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

const AgendaSlide = ({ event, activeIndex }) => {
  const attendeeCount = event?.attendees?.length || 0;
  const attendees = attendeeCount > 0 ? event.attendees.slice(0, 4) : [];
  const metaDate = formatEventDate(event);
  const metaTime = formatEventTime(event);

  return (
    <div className="flex flex-col rounded-[1.6rem] border border-primary-200/70 bg-gradient-to-r from-[#fff1ec] via-[#fdf3f0] to-[#fbefec] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-[32rem]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-500/80">
            Agenda {activeIndex + 1}
          </p>
          <p className="mt-2 line-clamp-2 text-[1rem] font-semibold leading-[1.08] tracking-[-0.03em] text-neutral-950">
            {event.summary || "Tanpa judul"}
          </p>
        </div>
      
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 text-[1.05rem] font-medium text-slate-500">
        <span className="inline-flex items-center gap-3">
          <Clock3 className="h-5 w-5 text-slate-500" />
          {metaDate}
        </span>
        <span className="inline-flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-slate-500" />
          {metaTime}
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 pt-7">
        <div className="flex min-h-[2.75rem] items-center">
          {attendees.length > 0 ? (
            <div className="flex -space-x-2.5">
              {attendees.map((attendee, index) => (
                <Avatar
                  key={`${attendee.email || attendee.displayName || index}`}
                  size="md"
                  className="border-[3px] border-white shadow-sm"
                >
                  <AvatarFallback>
                    {getAvatarInitials(
                      attendee.displayName || attendee.email || "AT",
                    )}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-500">
              Belum ada peserta terdaftar
            </p>
          )}
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-500/65">
          {attendeeCount > 0 ? `${attendeeCount} peserta` : "Tanpa peserta"}
        </p>
      </div>
    </div>
  );
};

const EmailListItem = ({ email, selected = false }) => {
  const from = extractEmailHeader(email, "From");
  const subject = extractEmailHeader(email, "Subject");
  const senderName = extractSenderName(from) || "Pengirim tidak diketahui";

  return (
    <div
      className={`flex min-h-[7.25rem] flex-col rounded-[1.3rem] border p-3.5 transition-colors duration-200 ${
        selected
          ? "border-primary-300 bg-primary-50/40"
          : "border-neutral-200 bg-gradient-to-r from-white via-neutral-50 to-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            size="sm"
            className="border border-neutral-200 bg-neutral-200/80"
          >
            <AvatarFallback>{getAvatarInitials(senderName)}</AvatarFallback>
          </Avatar>
          <p className="truncate text-sm font-medium text-neutral-700">
            {senderName}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
          <Mail className="h-4 w-4" />
        </div>
      </div>

      <div>
        <p className="truncate text-base font-semibold leading-tight tracking-[-0.02em] text-neutral-950">
          {subject || "(Tanpa subjek)"}
        </p>
        <p className="mt-1.5 truncate text-xs leading-5 text-neutral-600">
          {email?.snippet || "Ringkasan email belum tersedia."}
        </p>
      </div>
    </div>
  );
};

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
  const navigate = useNavigate();
  const withNewSupervisorSession = useCallback(
    (state = {}) => ({
      ...(state && typeof state === "object" ? state : {}),
      forceNewSession: true,
      navigationSource: "dashboard",
    }),
    [],
  );
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
  const [activeAgendaIndex, setActiveAgendaIndex] = useState(0);
  const [emailBriefing, setEmailBriefing] = useState(null);
  const [jiraBriefing, setJiraBriefing] = useState(null);
  const [briefingsCacheResolved, setBriefingsCacheResolved] = useState(false);
  const [tokenSummary, setTokenSummary] = useState({
    totalTokens: 0,
    totalExecutions: 0,
    totalInputTokens: 0,
    totalCompletionTokens: 0,
    latestTimestamp: null,
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

    const cachedRuntimeState = readDashboardRuntimeCache(user?.id);
    if (cachedRuntimeState) {
      setNextEvents(Array.isArray(cachedRuntimeState.nextEvents) ? cachedRuntimeState.nextEvents : []);
      setJiraIssues(Array.isArray(cachedRuntimeState.jiraIssues) ? cachedRuntimeState.jiraIssues : []);
      setUnreadEmails(Array.isArray(cachedRuntimeState.unreadEmails) ? cachedRuntimeState.unreadEmails : []);
      setTokenSummary(
        cachedRuntimeState.tokenSummary || {
          totalTokens: 0,
          totalExecutions: 0,
          totalInputTokens: 0,
          totalCompletionTokens: 0,
          latestTimestamp: null,
        },
      );
      setTokenRows(Array.isArray(cachedRuntimeState.tokenRows) ? cachedRuntimeState.tokenRows : []);
      setLoadingEvents(false);
      setLoadingJira(false);
      setLoadingEmails(false);
      setLoadingTokens(false);
    }

    setBriefingsCacheResolved(true);
  }, [applyBriefingsPayload, authLoading, user?.id]);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    setCalendarError("");

    try {
      const payload = await calendarApi.fetchCalendarEvents();
      const items = Array.isArray(payload?.items) ? payload.items : [];
      const now = Date.now();
      const upcomingItems = items.filter((event) => {
        const startDate = event?.start?.dateTime || event?.start?.date;
        if (!startDate) return false;

        const eventTime = new Date(startDate).getTime();
        return !Number.isNaN(eventTime) && eventTime >= now;
      });

      setNextEvents(upcomingItems.slice(0, 3));
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
      const payload = await tokenUsageApi.ambilDataToken(500, {
        period: "current_month",
      });
      setTokenSummary(
        payload?.summary || {
          totalTokens: 0,
          totalExecutions: 0,
          totalInputTokens: 0,
          totalCompletionTokens: 0,
          latestTimestamp: null,
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
        latestTimestamp: null,
      });
      setTokenRows([]);
    } finally {
      setLoadingTokens(false);
    }
  }, []);

  useEffect(() => {
    if (!briefingsCacheResolved) return;
    if (readDashboardRuntimeCache(user?.id)) return;

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
    user?.id,
  ]);

  useEffect(() => {
    if (authLoading || !briefingsCacheResolved) return;
    if (loadingEvents || loadingJira || loadingEmails || loadingTokens) return;

    writeDashboardRuntimeCache(user?.id, {
      nextEvents,
      jiraIssues,
      unreadEmails,
      tokenSummary,
      tokenRows,
    });
  }, [
    authLoading,
    briefingsCacheResolved,
    jiraIssues,
    loadingEmails,
    loadingEvents,
    loadingJira,
    loadingTokens,
    nextEvents,
    tokenRows,
    tokenSummary,
    unreadEmails,
    user?.id,
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
    if (!jiraIssues.length)
      return "Belum ada issue Jira yang terdeteksi untuk diringkas.";

    const statusLines = jiraSummary.byStatus
      .slice(0, 3)
      .map((status) => `${status.status}: ${status.count} issue`)
      .join(", ");

    return `Distribusi issue saat ini: ${statusLines}.`;
  }, [
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
    return "Menampilkan issue Jira, agenda terdekat, email penting, dan token usage dari workspace operasional Anda.";
  }, []);

  const greetingName = user?.name?.split(" ")[0] || "Admin";
  const agendaEvents = visibleEvents.slice(0, 3);
  const emailListItems = visibleEmails.slice(0, 5);
  const leadEvent = visibleEvents[0];
  const leadEventDays = leadEvent ? getDaysUntil(leadEvent) : null;
  const notificationCount =
    emailBriefing?.source_metrics?.total_unread || visibleEmails.length || 0;
  const tokenSeries = useMemo(
    () => createDailyTokenSeries(tokenRows, TOKEN_LIMIT),
    [tokenRows],
  );
  const tokenMonthLabel = useMemo(
    () => formatMonthLabel(tokenSummary.latestTimestamp),
    [tokenSummary.latestTimestamp],
  );
  const focusedEmail = useMemo(() => {
    const focusEmail = emailBriefing?.focus_email;
    if (!focusEmail) return null;

    const focusId = String(focusEmail.id || focusEmail.email_id || "").trim();
    const focusThreadId = String(focusEmail.threadId || focusEmail.thread_id || "").trim();

    return (
      visibleEmails.find(
        (email) =>
          String(email?.id || "").trim() === focusId ||
          String(email?.threadId || "").trim() === focusThreadId,
      ) || null
    );
  }, [emailBriefing?.focus_email, visibleEmails]);
  const focusedEmailAction = useMemo(() => {
    if (!focusedEmail) return null;

    const action = emailBriefing?.focus_email?.action;
    if (action && typeof action === "object") {
      return {
        ...action,
        intent: action.intent || "draft_reply",
        label: action.label || "Buatkan Draft",
      };
    }

    return {
      label: "Buatkan Draft",
      intent: "draft_reply",
      target: "supervisor",
      prompt: "Buatkan draft balasan profesional untuk email prioritas ini.",
      context: {
        briefing_domain: "email",
        focus: "priority_follow_up",
        email_ids: focusedEmail?.id ? [focusedEmail.id] : [],
        thread_id: focusedEmail?.threadId || "",
      },
    };
  }, [emailBriefing?.focus_email?.action, focusedEmail]);
  const agendaActionLookup = useMemo(() => {
    const lookup = new Map();
    const agendaActions = Array.isArray(calendarBriefing?.agenda_actions)
      ? calendarBriefing.agenda_actions
      : [];

    for (const item of agendaActions) {
      const key = getAgendaLookupKey(item);
      if (!key) continue;

      const actions = Array.isArray(item.actions)
        ? item.actions.filter(
            (action) =>
              action &&
              typeof action === "object" &&
              String(action.prompt || "").trim(),
          )
        : [];

      lookup.set(key, actions.slice(0, 3));
    }

    return lookup;
  }, [calendarBriefing?.agenda_actions]);
  const activeAgenda = agendaEvents[activeAgendaIndex] || null;
  const activeAgendaActions = useMemo(() => {
    if (!activeAgenda) return [];

    const key = getAgendaLookupKey(activeAgenda);
    const mappedActions = key ? agendaActionLookup.get(key) : null;
    return mappedActions?.length
      ? mappedActions
      : buildFallbackAgendaActions(activeAgenda);
  }, [activeAgenda, agendaActionLookup]);

  useEffect(() => {
    if (!agendaEvents.length) {
      setActiveAgendaIndex(0);
      return;
    }

    if (activeAgendaIndex > agendaEvents.length - 1) {
      setActiveAgendaIndex(0);
    }
  }, [activeAgendaIndex, agendaEvents.length]);

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
            title="Task Progress"
            actions={
              <>
                <ActionLink to="/workspace/jira" primary>
                  Lihat Jira
                </ActionLink>
                <ActionLink
                  to="/chat/supervisor"
                  state={withNewSupervisorSession({
                    domain: "jira",
                    intent: "generate_report",
                    templatePrompt: "Buatkan laporan progres Jira hari ini",
                    context: jiraBriefing
                      ? { briefing: jiraBriefing }
                      : {
                          summary: jiraSummary,
                          issues: jiraIssues.slice(0, 10),
                        },
                  })}
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
                    {jiraSummary.total
                      ? `Saat ini ${jiraSummary.done} issue telah selesai dari ${jiraSummary.total} issue yang terlacak.`
                      : "Belum ada issue yang bisa diringkas dari Jira saat ini."}
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
                : "Agenda terdekat"
            }
            actions={
              <>
                <ActionLink
                  to="/chat/supervisor"
                  primary
                  state={withNewSupervisorSession(createAgendaActionState(
                    {
                      label: "Buat Agenda",
                      intent: "prepare_meeting",
                      prompt: activeAgenda
                        ? `Buatkan agenda meeting yang terstruktur untuk event berikut:\n\n${buildEventDetails(activeAgenda)}`
                        : "Buatkan agenda meeting untuk agenda terdekat saya hari ini.",
                      context: {
                        briefing_domain: "calendar",
                        focus: "meeting_agenda",
                        event_ids: activeAgenda?.id ? [activeAgenda.id] : [],
                        thread_id: activeAgenda?.id || "",
                      },
                    },
                    activeAgenda,
                    calendarBriefing,
                  ))}
                >
                  Buat Agenda
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
                <Carousel
                  className="w-full"
                  disableDrag={agendaEvents.length <= 1}
                  index={activeAgendaIndex}
                  onIndexChange={setActiveAgendaIndex}
                >
                  <CarouselContent>
                    {agendaEvents.map((event, index) => (
                      <CarouselItem key={event.id || `${event.summary}-${index}`}>
                        <AgendaSlide
                          event={event}
                          activeIndex={index}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {agendaEvents.length > 1 ? (
                    <>
                      <CarouselNavigation alwaysShow />
                      <CarouselIndicator />
                    </>
                  ) : null}
                </Carousel>

                {activeAgenda ? (
                  <div className="rounded-[1.5rem] border border-dashed border-primary-200/80 p-2">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      {/* <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-500/80">
                          Aksi Rekomendasi
                        </p>
                        <p className="mt-1 text-sm font-semibold text-neutral-900">
                          {activeAgenda.summary || "Agenda terpilih"}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Aksi ini berubah mengikuti agenda yang sedang aktif di carousel.
                        </p>
                      </div> */}
                      <div className="flex flex-wrap gap-2">
                        {activeAgendaActions.map((action, index) => (
                          <Button
                            key={`${action.intent || action.label || "agenda"}-${index}`}
                            variant={ "outline"}
                            className="rounded-full"
                            onClick={() =>
                              navigate(
                                "/chat/supervisor",
                                {
                                  state: withNewSupervisorSession(
                                    createAgendaActionState(
                                    action,
                                    activeAgenda,
                                    calendarBriefing,
                                  ),
                                  ),
                                },
                              )
                            }
                          >
                            {action.label || "Buka Supervisor"}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
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
            title="Email"
           
            actions={
              <>
                <ActionLink
                  to="/chat/supervisor"
                  primary
                  state={withNewSupervisorSession(
                    focusedEmail && focusedEmailAction
                      ? createEmailActionState(
                          focusedEmailAction,
                          focusedEmail,
                          emailBriefing,
                        )
                      : {
                          domain: "email",
                          intent: "draft_reply",
                          templatePrompt: "Buatkan draft balasan untuk email penting",
                          context: emailBriefing
                            ? {
                                briefing: emailBriefing,
                                emails: visibleEmails.slice(0, 5),
                              }
                            : { emails: visibleEmails.slice(0, 5) },
                        },
                  )}
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
              <>
                {focusedEmail && focusedEmailAction ? (
                  <div className="relative overflow-hidden rounded-lg bg-gradient-stat p-4 text-white shadow-stat">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium opacity-90">
                          Insight Prioritas
                        </p>
                        <p className="mt-2 truncate text-lg font-bold leading-tight text-white">
                          {extractEmailHeader(focusedEmail, "Subject") ||
                            "(Tanpa subjek)"}
                        </p>
                        <p className="mt-3 text-[10px] leading-snug text-white/80">
                          {emailBriefing?.focus_email?.reason ||
                            "Email ini paling layak ditindaklanjuti dibandingkan unread email lain."}
                        </p>
                      </div>
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/95 text-primary-500">
                        <Mail className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                        onClick={() =>
                          navigate("/chat/supervisor", {
                            state: withNewSupervisorSession(
                              createEmailActionState(
                                focusedEmailAction,
                                focusedEmail,
                                emailBriefing,
                              ),
                            ),
                          })
                        }
                      >
                        {focusedEmailAction.label || "Buatkan Draft"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Insight Prioritas
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-900">
                      Tidak ada email mendesak saat ini
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Dari unread email yang masuk, belum ada yang cukup prioritas untuk direkomendasikan follow-up cepat.
                    </p>
                  </div>
                )}

                <AnimatedList
                  items={emailListItems}
                  onItemSelect={() => navigate("/workspace/email")}
                  showGradients
                  enableArrowNavigation={false}
                  displayScrollbar
                  className="max-w-full"
                  listClassName="max-h-[15.5rem]"
                  itemClassName="cursor-pointer"
                  renderItem={(email, index, selected) => (
                    <EmailListItem
                      key={email.id || index}
                      email={email}
                      selected={selected}
                    />
                  )}
                  getItemKey={(email, index) => email.id || index}
                />
              </>
            ) : (
              <EmptyState
                icon={<Mail className="h-8 w-8" />}
                title="Tidak ada email belum dibaca"
                description="Inbox tidak memiliki email baru yang perlu diangkat ke dashboard saat ini."
              />
            )}
          </DashboardShell>

          <DashboardShell
            title="Token Monitor"
            subtitle={`Akumulasi penggunaan ${tokenMonthLabel}`}
            actions={
              <>
                <ActionLink to="/monitoring/tokens" primary>
                  Lihat Detail
                </ActionLink>
                <ActionLink
                  to="/chat/supervisor"
                  state={withNewSupervisorSession({
                    domain: "operations",
                    intent: "token_review",
                    templatePrompt:
                      "Tolong rangkum penggunaan token dan berikan rekomendasi efisiensi.",
                    context: { tokenSummary, tokenSeries },
                  })}
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
            ) : !tokenSeries.length ? (
              <EmptyState
                icon={<TrendingUp className="h-8 w-8" />}
                title="Belum ada data token bulan ini"
                description="Log penggunaan token untuk bulan berjalan belum tersedia di Supabase."
              />
            ) : (
              <>
                <TokenUsage
                  used={formatCompactNumber(tokenSummary.totalTokens)}
                  limit="1M Limit"
                  className="rounded-[1.7rem] px-8 py-7"
                />

                <div className="rounded-[1.7rem] bg-white px-2 py-3">
                  <div className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4">
                    <div className="flex h-56 flex-col justify-between pb-8 text-right text-xs font-semibold text-neutral-400">
                      <span>100%</span>
                      <span>70%</span>
                      <span>50%</span>
                      <span>20%</span>
                      <span>0</span>
                    </div>

                    <div className="overflow-x-auto pb-2">
                      <div className="flex min-w-max items-end gap-5 px-1">
                        {tokenSeries.map((item) => (
                          <div
                            key={item.key}
                            className="flex w-8 flex-col items-center gap-3"
                          >
                            <div className="relative flex h-56 w-4 items-end overflow-hidden rounded-full bg-primary-100/80">
                              <div
                                className="w-full rounded-full bg-primary-500 shadow-[0_0_12px_rgba(232,67,34,0.35)]"
                                style={{ height: `${item.fillPercentage}%` }}
                              />
                            </div>
                            <div className="text-center">
                              <span className="block text-xs font-semibold text-neutral-600">
                                {item.label}
                              </span>
                              <span className="block text-[10px] text-neutral-400">
                                {item.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-primary-100 bg-primary-50/45 px-3 py-2 text-xs text-neutral-600">
                    Persentase batang dihitung dari total input + completion token per hari terhadap limit 1M token di bulan {tokenMonthLabel}.
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
