import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Input } from "@/components/ui";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  ListTodo,
  MapPin,
  Presentation,
  RefreshCw,
  Search,
  Sparkles,
  SquarePen,
  Users,
  Video,
} from "lucide-react";
import { calendarApi } from "../services/calendarService";

const formatDateTime = (dateTime, fallbackDate) => {
  const value = dateTime || fallbackDate;
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  if (dateTime) {
    return date.toLocaleString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatShortDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTimeOnly = (event) => {
  const startDate = event?.start?.dateTime || event?.start?.date;
  if (!startDate) return "-";

  if (!event?.start?.dateTime) return "Seharian";

  return new Date(startDate).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isToday = (date) => {
  const today = new Date();
  const targetDate = new Date(date);

  return targetDate.toDateString() === today.toDateString();
};

const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const targetDate = new Date(date);

  return targetDate.toDateString() === tomorrow.toDateString();
};

const getEventStatus = (event) => {
  const now = new Date();
  const start = new Date(event.start?.dateTime || event.start?.date);
  const end = new Date(event.end?.dateTime || event.end?.date);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "upcoming";
  }

  if (now >= start && now <= end) return "ongoing";
  if (now < start) return "upcoming";
  return "past";
};

const getEventGroup = (event) => {
  const startDate = event.start?.dateTime || event.start?.date;
  if (!startDate) return "later";

  if (isToday(startDate)) return "today";
  if (isTomorrow(startDate)) return "tomorrow";

  const eventDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return "thisWeek";
  return "later";
};

const getAttendeeLabel = (attendee) =>
  attendee?.displayName || attendee?.email || "Participant";

const getInitials = (value) =>
  String(value || "AI")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const getResponseLabel = (responseStatus) => {
  if (responseStatus === "accepted") return "Hadir";
  if (responseStatus === "declined") return "Tidak hadir";
  if (responseStatus === "tentative") return "Mungkin";
  return "Belum konfirmasi";
};

const getResponseClassName = (responseStatus) => {
  if (responseStatus === "accepted") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (responseStatus === "declined") {
    return "bg-rose-50 text-rose-700";
  }

  if (responseStatus === "tentative") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-slate-600";
};

const getStatusLabel = (status) => {
  if (status === "ongoing") return "Sedang berlangsung";
  if (status === "upcoming") return "Akan datang";
  return "Selesai";
};

const getStatusClassName = (status) => {
  if (status === "ongoing") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "upcoming") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-slate-100 text-slate-600";
};

const buildEventDetails = (event) => {
  const startDate = event.start?.dateTime || event.start?.date;
  const endDate = event.end?.dateTime || event.end?.date;
  const formattedStart = startDate
    ? formatDateTime(event.start?.dateTime, event.start?.date)
    : "-";
  const formattedEnd = endDate
    ? formatDateTime(event.end?.dateTime, event.end?.date)
    : "-";

  let attendeesText = "";
  if (event.attendees && event.attendees.length > 0) {
    const attendeesList = event.attendees
      .map((attendee) => attendee.email || attendee.displayName)
      .filter(Boolean)
      .join(", ");
    attendeesText = attendeesList ? `\nPeserta: ${attendeesList}` : "";
  }

  return `Event: ${event.summary || "Tanpa judul"}
Waktu: ${formattedStart} - ${formattedEnd}${event.location ? `\nLokasi: ${event.location}` : ""}${attendeesText}${event.description ? `\nDeskripsi: ${event.description}` : ""}${event.hangoutLink ? `\nGoogle Meet: ${event.hangoutLink}` : ""}`;
};

const CalendarHeaderSection = ({
  loading,
  onRefresh,
  onCompose,
  searchQuery,
  onSearchChange,
}) => (
  <section>
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-[280px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-2xl text-[#ff623d]">
            <CalendarDays className="h-10 w-10" />
          </div>
          <h1 className="text-[2rem] font-bold leading-tight text-[#ff623d]">
            Calendar Workspace
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Kelola agenda, prioritas meeting, dan tindak lanjut kalender dalam satu
          tampilan.
        </p>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="w-full max-w-[540px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari event, peserta, atau lokasi..."
            className="h-auto w-full rounded-2xl bg-white px-4 py-4 pl-14 pr-16 text-sm text-slate-700 placeholder:text-slate-400"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
            Ctrl K
          </span>
        </div>
      </form>

      <div className="flex items-center gap-3">
        <Button
          onClick={onRefresh}
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

const MetricCard = ({ title, value, description, active = false }) => (
  <div className="rounded-[20px] bg-white px-5 py-4 text-left shadow-md transition-colors hover:bg-slate-50">
    <p className="text-sm font-medium text-slate-600">{title}</p>
    <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
    {active && <div className="mt-2 h-1 w-12 rounded-full bg-[#ff623d]" />}
  </div>
);

const SummaryPanel = ({
  summaryRef,
  loading,
  aiSummary,
  hasConflicts,
  todayEvents,
  nextEvent,
}) => {
  const recommendedActions = Array.isArray(aiSummary?.recommendations)
    ? aiSummary.recommendations
    : [];
  const summaryPoints = Array.isArray(aiSummary?.summary_points)
    ? aiSummary.summary_points
    : [];

  return (
    <div
      ref={summaryRef}
      className="min-h-0 self-start overflow-hidden rounded-[20px] bg-white shadow-md"
    >
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
          {loading ? (
            <>
              <div className="h-12 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-36 rounded-3xl bg-slate-200 animate-pulse" />
              <div className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
            </>
          ) : (
            <>
              <div className="rounded-[20px] border border-[#ff623d] bg-[#fff4ef] p-3">
                <div className="flex gap-3">
                  <ListTodo size={18} />
                  <p className="text-lg font-semibold leading-none text-[#ff623d]">
                    Overview
                  </p>
                </div>
                <p className="mt-2 text-sm leading-4 text-slate-700">
                  {aiSummary?.headline ||
                    `${todayEvents.length} event hari ini${nextEvent ? `, terdekat ${nextEvent.summary || "tanpa judul"}` : ""}.`}
                </p>
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
                  <ul className="mt-3 space-y-3 pl-5">
                    <li className="relative text-sm leading-4 text-slate-700">
                      <span className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full bg-[#ff623d]" />
                      {hasConflicts ? "Ada potensi bentrok jadwal yang perlu diperiksa." : "Tidak ada konflik jadwal yang terdeteksi."}
                    </li>
                    <li className="relative text-sm leading-4 text-slate-700">
                      <span className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full bg-[#ff623d]" />
                      {todayEvents.length} event terjadwal hari ini.
                    </li>
                  </ul>
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
                    {recommendedActions.slice(0, 3).map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white px-3.5 py-3"
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
                            {item}
                          </span>
                        </div>
                        <ChevronRight size={18} className="text-[#f59b70]" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3 rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-600">
                    Pilih salah satu event untuk menyiapkan agenda, follow-up, atau brief meeting dengan AI.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const EventListPanel = ({
  title,
  events,
  selectedEventId,
  onSelect,
  emptyText,
  style,
}) => (
  <div
    className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-white shadow-md"
    style={style}
  >
    <div className="border-b border-slate-200 px-5 py-4">
      <h2 className="text-[1.05rem] font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">
        {events.length ? `${events.length} event tersedia` : emptyText}
      </p>
    </div>

    <div className="flex-1 overflow-y-auto p-4">
      {events.length === 0 ? (
        <div className="flex h-full min-h-[220px] items-center justify-center rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const status = getEventStatus(event);
            const startValue = event.start?.dateTime || event.start?.date;
            const isSelected = selectedEventId === event.id;

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelect(event)}
                className={`w-full rounded-[18px] border p-4 text-left transition-colors ${
                  isSelected
                    ? "border-[#ff623d] bg-[#fff4ef]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {event.summary || "Tanpa judul"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatShortDate(startValue)}, {formatTimeOnly(event)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-medium ${getStatusClassName(status)}`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {event.location ? (
                        <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          {event.location}
                        </span>
                      ) : null}
                      {event.hangoutLink ? (
                        <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                          Has Meet
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

const EventDetailPanel = ({
  selectedEvent,
  customRequest,
  onCustomRequestChange,
  onCustomRequestSubmit,
  onQuickAction,
  onBack,
  style,
}) => (
  <div
    className="flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-white shadow-md"
    style={style}
  >
    {selectedEvent ? (
      <>
        <div className="border-b border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar
          </button>
          <h2 className="text-2xl font-semibold leading-tight text-slate-900">
            {selectedEvent.summary || "Tanpa judul"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {formatDateTime(
              selectedEvent.start?.dateTime,
              selectedEvent.start?.date,
            )}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {selectedEvent.location ? (
                <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  {selectedEvent.location}
                </span>
              ) : null}
              {selectedEvent.hangoutLink ? (
                <a
                  href={selectedEvent.hangoutLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                >
                  <Video className="h-4 w-4" />
                  Join Meeting
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>

            <div className="rounded-[20px] border border-[#ff623d] bg-[#fff4ef] p-4">
              <div className="flex gap-3">
                <BookOpen size={18} />
                <p className="text-lg font-semibold leading-none text-[#ff623d]">
                  Event Summary
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {selectedEvent.description ||
                  "Belum ada deskripsi detail. AI bisa bantu membuat agenda atau preparation brief berdasarkan judul dan peserta."}
              </p>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <Users size={18} />
                <p className="text-lg font-semibold leading-none text-slate-900">
                  Peserta
                </p>
              </div>
              <div className="mt-3 h-[2px] w-full rounded-full bg-[#eceff3]" />
              {selectedEvent.attendees?.length ? (
                <div className="mt-3 space-y-3">
                  {selectedEvent.attendees.map((attendee, index) => (
                    <div
                      key={`${attendee.email || attendee.displayName || index}`}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700">
                        {getInitials(getAttendeeLabel(attendee))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {attendee.displayName || attendee.email || "Peserta"}
                        </p>
                        {attendee.displayName && attendee.email ? (
                          <p className="truncate text-xs text-slate-500">
                            {attendee.email}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-medium ${getResponseClassName(attendee.responseStatus)}`}
                      >
                        {getResponseLabel(attendee.responseStatus)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Belum ada peserta yang tercatat untuk event ini.
                </p>
              )}
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <Sparkles size={18} />
                <p className="text-lg font-semibold leading-none text-slate-900">
                  Quick Actions
                </p>
              </div>
              <div className="mt-3 h-[2px] w-full rounded-full bg-[#eceff3]" />
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="justify-start rounded-2xl"
                  onClick={() => onQuickAction("agenda", selectedEvent)}
                >
                  <FileText className="h-4 w-4" />
                  Prepare Agenda
                </Button>
                <Button
                  variant="outline"
                  className="justify-start rounded-2xl"
                  onClick={() => onQuickAction("slides", selectedEvent)}
                >
                  <Presentation className="h-4 w-4" />
                  Generate Slides
                </Button>
                <Button
                  variant="outline"
                  className="justify-start rounded-2xl"
                  onClick={() => onQuickAction("report", selectedEvent)}
                >
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
                <Button
                  variant="outline"
                  className="justify-start rounded-2xl"
                  onClick={() => onQuickAction("followup", selectedEvent)}
                >
                  <Bell className="h-4 w-4" />
                  Draft Reminder
                </Button>
              </div>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <SquarePen size={18} />
                <p className="text-lg font-semibold leading-none text-slate-900">
                  Custom Request
                </p>
              </div>
              <div className="mt-3 h-[2px] w-full rounded-full bg-[#eceff3]" />
              <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <Input
                  value={customRequest}
                  onChange={(event) => onCustomRequestChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      onCustomRequestSubmit();
                    }
                  }}
                  placeholder="Minta AI membuat output dari event ini..."
                  className="flex-1 rounded-2xl"
                />
                <Button
                  onClick={onCustomRequestSubmit}
                  disabled={!customRequest.trim()}
                  className="rounded-2xl bg-[#ff623d] text-white hover:bg-[#ff744f]"
                >
                  Kirim
                </Button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Contoh: &quot;buat slides sprint review&quot;, &quot;buat laporan
                blocker&quot;, atau &quot;buat notes template&quot;.
              </p>
            </div>
          </div>
        </div>
      </>
    ) : (
      <div className="flex h-full min-h-[320px] items-center justify-center p-6 text-center text-slate-500">
        <div>
          <CalendarDays className="mx-auto mb-4 h-14 w-14 text-slate-300" />
          <p className="text-lg font-medium text-slate-700">
            Pilih event dari daftar
          </p>
          <p className="mt-1 text-sm">
            Buka salah satu event untuk melihat detail, peserta, dan quick action ke Supervisor.
          </p>
        </div>
      </div>
    )}
  </div>
);

export default function CalendarPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [customRequest, setCustomRequest] = useState("");
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [summaryPanelHeight, setSummaryPanelHeight] = useState(null);
  const summaryPanelRef = useRef(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { items, aiSummary: summary } = await calendarApi.fetchCalendarEvents();
      const nextItems = Array.isArray(items) ? items : [];
      setEvents(nextItems);
      setAiSummary(summary || null);
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      setError(err.message || "Tidak dapat mengambil jadwal kalender.");
      setEvents([]);
      setAiSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const node = summaryPanelRef.current;
    if (!node) return undefined;

    const syncHeight = () => {
      setSummaryPanelHeight(node.offsetHeight || null);
    };

    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [loading, aiSummary, searchQuery]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return events;

    return events.filter((event) => {
      const searchable = [
        event.summary,
        event.description,
        event.location,
        ...(event.attendees || []).map(
          (attendee) => attendee.displayName || attendee.email,
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [events, searchQuery]);

  useEffect(() => {
    if (!selectedEvent) return;

    const nextSelectedEvent = filteredEvents.find(
      (event) => event.id === selectedEvent.id,
    );

    if (!nextSelectedEvent) {
      setSelectedEvent(null);
      setShowMobileDetail(false);
      return;
    }

    if (nextSelectedEvent !== selectedEvent) {
      setSelectedEvent(nextSelectedEvent);
    }
  }, [filteredEvents, selectedEvent]);

  const todayEvents = useMemo(
    () => filteredEvents.filter((event) => getEventGroup(event) === "today"),
    [filteredEvents],
  );

  const upcomingEvents = useMemo(
    () =>
      filteredEvents.filter((event) => {
        const group = getEventGroup(event);
        const status = getEventStatus(event);
        return group !== "today" && status !== "past";
      }),
    [filteredEvents],
  );

  const nextEvent = useMemo(
    () =>
      todayEvents.find((event) => getEventStatus(event) === "upcoming") ||
      todayEvents[0] ||
      upcomingEvents[0] ||
      null,
    [todayEvents, upcomingEvents],
  );

  const hasConflicts = Boolean(aiSummary?.source_metrics?.has_conflict);
  const desktopListsEmpty = todayEvents.length === 0 && upcomingEvents.length === 0;

  const metrics = useMemo(() => {
    const withMeetCount = filteredEvents.filter((event) => event.hangoutLink).length;
    const ongoingCount = filteredEvents.filter(
      (event) => getEventStatus(event) === "ongoing",
    ).length;

    return {
      total: filteredEvents.length,
      today: todayEvents.length,
      upcoming: upcomingEvents.length,
      withMeet: withMeetCount,
      ongoing: ongoingCount,
    };
  }, [filteredEvents, todayEvents, upcomingEvents]);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);

    if (window.innerWidth < 1024) {
      setShowMobileDetail(true);
    }
  };

  const handleBackToList = () => {
    setShowMobileDetail(false);
  };

  const handleQuickAction = (action, event) => {
    const eventDetails = buildEventDetails(event);

    const prompts = {
      agenda: `Buatkan agenda meeting untuk event berikut:\n\n${eventDetails}`,
      slides: `Buatkan slides presentasi untuk event berikut:\n\n${eventDetails}`,
      report: `Buatkan laporan untuk event berikut:\n\n${eventDetails}`,
      followup: `Buatkan email follow-up untuk event berikut:\n\n${eventDetails}`,
    };

    navigate("/chat/supervisor", {
      state: {
        autoSendMessage: prompts[action],
        preFillOnly: true,
      },
    });
  };

  const handleCustomRequest = () => {
    if (!customRequest.trim() || !selectedEvent) return;

    const fullPrompt = `${customRequest}\n\nDetail event:\n${buildEventDetails(selectedEvent)}`;

    navigate("/chat/supervisor", {
      state: {
        autoSendMessage: fullPrompt,
        preFillOnly: true,
      },
    });
  };

  const handleCompose = () => {
    navigate("/chat/supervisor", {
      state: {
        autoSendMessage: "Bantu saya menyiapkan agenda atau rencana meeting baru dari Calendar Workspace.",
        preFillOnly: true,
      },
    });
  };

  const sharedPanelStyle = summaryPanelHeight
    ? { height: `${summaryPanelHeight}px` }
    : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CalendarHeaderSection
        loading={loading}
        onRefresh={loadEvents}
        onCompose={handleCompose}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {lastSyncedAt ? (
        <p className="mt-3 text-sm text-slate-500">
          Terakhir sinkron: {formatDateTime(lastSyncedAt)}
        </p>
      ) : null}

      {error && (
        <Alert
          variant="error"
          className="mt-4"
          title="Calendar workspace error"
        >
          {error}
        </Alert>
      )}

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="All Events"
          value={metrics.total}
          description="Seluruh event dari hasil sinkronisasi"
        />
        <MetricCard
          title="Today"
          value={metrics.today}
          description="Agenda yang berjalan hari ini"
          active
        />
        <MetricCard
          title="Upcoming"
          value={metrics.upcoming}
          description="Event berikutnya yang akan datang"
        />
        <MetricCard
          title="Google Meet"
          value={metrics.withMeet}
          description={
            hasConflicts
              ? "Ada indikasi konflik di agenda"
              : `${metrics.ongoing} event sedang berlangsung`
          }
        />
      </section>

      <section className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-[24px]">
        <div className="hidden h-full min-h-0 w-80 flex-shrink-0 lg:block">
          <SummaryPanel
            summaryRef={summaryPanelRef}
            loading={loading}
            aiSummary={aiSummary}
            hasConflicts={hasConflicts}
            todayEvents={todayEvents}
            nextEvent={nextEvent}
          />
        </div>

        <div className="flex h-full min-h-0 flex-1 gap-4 lg:gap-6 lg:pl-6">
          <div
            className={`${showMobileDetail ? "hidden lg:flex" : "flex"} min-h-0 ${
              selectedEvent ? "w-full lg:w-96" : "flex-1"
            } flex-col`}
          >
            <div className="mb-4 block lg:hidden">
              <SummaryPanel
                loading={loading}
                aiSummary={aiSummary}
                hasConflicts={hasConflicts}
                todayEvents={todayEvents}
                nextEvent={nextEvent}
              />
            </div>

            <div
              className={`grid min-h-0 flex-1 gap-4 ${
                desktopListsEmpty ? "lg:auto-rows-fr" : "lg:grid-rows-2"
              }`}
              style={desktopListsEmpty ? undefined : sharedPanelStyle}
            >
              <EventListPanel
                title="Hari Ini"
                events={todayEvents}
                selectedEventId={selectedEvent?.id}
                onSelect={handleEventSelect}
                emptyText="Tidak ada event hari ini."
                style={desktopListsEmpty ? sharedPanelStyle : undefined}
              />
              <EventListPanel
                title="Mendatang"
                events={upcomingEvents.slice(0, 12)}
                selectedEventId={selectedEvent?.id}
                onSelect={handleEventSelect}
                emptyText="Belum ada event mendatang."
                style={desktopListsEmpty ? sharedPanelStyle : undefined}
              />
            </div>
          </div>

          {(selectedEvent || !showMobileDetail) && (
            <div
              className={`${showMobileDetail ? "flex" : "hidden lg:flex"} min-h-0 flex-1 flex-col`}
            >
              <EventDetailPanel
                selectedEvent={selectedEvent}
                customRequest={customRequest}
                onCustomRequestChange={setCustomRequest}
                onCustomRequestSubmit={handleCustomRequest}
                onQuickAction={handleQuickAction}
                onBack={handleBackToList}
                style={sharedPanelStyle}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
