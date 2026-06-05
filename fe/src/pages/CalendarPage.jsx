import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Input,
  LockedIntegrationState,
  Modal,
  isIntegrationLockedError,
  toast,
} from "@/components/ui";
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
  Plus,
  Presentation,
  RefreshCw,
  Search,
  Sparkles,
  SquarePen,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { calendarApi } from "../services/calendarService";

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta";
const MIN_CALENDAR_PANEL_HEIGHT = 620;

const formatDateTimeInputValue = (date) => {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return "";

  const offsetMs = target.getTimezoneOffset() * 60 * 1000;
  return new Date(target.getTime() - offsetMs).toISOString().slice(0, 16);
};

const formatDateInputValue = (date) => {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return "";

  const offsetMs = target.getTimezoneOffset() * 60 * 1000;
  return new Date(target.getTime() - offsetMs).toISOString().slice(0, 10);
};

const createDefaultAgendaForm = () => {
  const start = new Date();
  start.setMinutes(Math.ceil(start.getMinutes() / 30) * 30, 0, 0);

  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  return {
    summary: "",
    startDateTime: formatDateTimeInputValue(start),
    endDateTime: formatDateTimeInputValue(end),
    startDate: formatDateInputValue(start),
    endDate: formatDateInputValue(start),
    allDay: false,
    location: "",
    guests: "",
    description: "",
    addGoogleMeet: true,
    timeZone: DEFAULT_TIMEZONE,
  };
};

const buildCreateAgendaPayload = (form) => {
  const attendees = form.guests
    .split(/[\n,;]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((email) => ({ email }));

  if (form.allDay) {
    const inclusiveEnd = new Date(form.endDate);
    inclusiveEnd.setDate(inclusiveEnd.getDate() + 1);

    return {
      summary: form.summary.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      attendees,
      allDay: true,
      start: form.startDate,
      end: formatDateInputValue(inclusiveEnd),
      addGoogleMeet: false,
    };
  }

  return {
    summary: form.summary.trim(),
    location: form.location.trim(),
    description: form.description.trim(),
    attendees,
    allDay: false,
    start: new Date(form.startDateTime).toISOString(),
    end: new Date(form.endDateTime).toISOString(),
    timeZone: form.timeZone || DEFAULT_TIMEZONE,
    addGoogleMeet: form.addGoogleMeet,
  };
};

const validateAgendaForm = (form) => {
  if (!form.summary.trim()) {
    return "Judul agenda wajib diisi.";
  }

  if (form.allDay) {
    if (!form.startDate || !form.endDate) {
      return "Tanggal mulai dan selesai wajib diisi.";
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      return "Tanggal selesai tidak boleh sebelum tanggal mulai.";
    }

    return "";
  }

  if (!form.startDateTime || !form.endDateTime) {
    return "Waktu mulai dan selesai wajib diisi.";
  }

  if (new Date(form.endDateTime) <= new Date(form.startDateTime)) {
    return "Waktu selesai harus setelah waktu mulai.";
  }

  return "";
};

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
  onCreateAgenda,
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
          onClick={onCreateAgenda}
          size="sm"
          className="gap-2 rounded-2xl bg-[#ff623d] text-sm text-white hover:bg-[#ff744f]"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah agenda</span>
        </Button>
      </div>
    </div>
  </section>
);

const CreateAgendaModal = ({
  open,
  form,
  error,
  submitting,
  onClose,
  onChange,
  onSubmit,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    size="lg"
    className="rounded-[28px]"
  >
    <Modal.Header onClose={onClose} className="pb-3">
      <div>
        <Modal.Title className="text-xl">Tambah agenda</Modal.Title>
      </div>
    </Modal.Header>

    <Modal.Body className="max-h-[70vh] overflow-y-auto pb-2">
      <div className="space-y-4">
        {error ? (
          <Alert variant="error" title="Agenda belum bisa dibuat">
            {error}
          </Alert>
        ) : null}

        <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Detail utama</h3>
            <p className="mt-1 text-xs text-slate-500">
              Judul dan waktu agenda.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Judul agenda
            </label>
            <Input
              value={form.summary}
              onChange={(event) => onChange("summary", event.target.value)}
              placeholder="Tambahkan judul"
              className="rounded-2xl"
            />
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={(event) => onChange("allDay", event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#ff623d] focus:ring-[#ff623d]"
            />
            Sepanjang hari
          </label>

          {form.allDay ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tanggal mulai
                </label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => onChange("startDate", event.target.value)}
                  className="rounded-2xl bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tanggal selesai
                </label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => onChange("endDate", event.target.value)}
                  className="rounded-2xl bg-white"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Mulai
                  </label>
                  <Input
                    type="datetime-local"
                    value={form.startDateTime}
                    onChange={(event) =>
                      onChange("startDateTime", event.target.value)
                    }
                    className="rounded-2xl bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Selesai
                  </label>
                  <Input
                    type="datetime-local"
                    value={form.endDateTime}
                    onChange={(event) =>
                      onChange("endDateTime", event.target.value)
                    }
                    className="rounded-2xl bg-white"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Zona waktu
                  </label>
                  <Input
                    value={form.timeZone}
                    onChange={(event) => onChange("timeZone", event.target.value)}
                    placeholder="Asia/Jakarta"
                    className="rounded-2xl bg-white"
                  />
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 md:mt-7">
                  <input
                    type="checkbox"
                    checked={form.addGoogleMeet}
                    onChange={(event) =>
                      onChange("addGoogleMeet", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-[#ff623d] focus:ring-[#ff623d]"
                  />
                  Tambahkan Google Meet
                </label>
              </div>
            </>
          )}
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Peserta & lokasi</h3>
            <p className="mt-1 text-xs text-slate-500">
              Siapa yang diundang dan di mana meeting berlangsung.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tambahkan tamu
              </label>
              <Input
                value={form.guests}
                onChange={(event) => onChange("guests", event.target.value)}
                placeholder="email1@domain.com, email2@domain.com"
                className="rounded-2xl bg-white"
              />
              <p className="mt-1 text-xs text-slate-500">
                Pisahkan email dengan koma, titik koma, atau baris baru.
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Lokasi
              </label>
              <Input
                value={form.location}
                onChange={(event) => onChange("location", event.target.value)}
                placeholder="Tambahkan lokasi"
                className="rounded-2xl bg-white"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Deskripsi</h3>
            <p className="mt-1 text-xs text-slate-500">
              Catatan agenda, konteks meeting, atau rundown singkat.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Deskripsi agenda
            </label>
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="Tambahkan deskripsi atau agenda meeting"
              rows={4}
              className="w-full rounded-[20px] border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 transition-all duration-150 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
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
        {submitting ? "Menyimpan..." : "Simpan agenda"}
      </Button>
    </Modal.Footer>
  </Modal>
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
      className="min-h-[620px] self-start overflow-hidden rounded-[20px] bg-white shadow-md"
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

const DeleteConfirmModal = ({ open, event, deleting, onClose, onConfirm }) => (
  <Modal open={open} onClose={onClose} size="sm" className="rounded-[28px]">
    <Modal.Header onClose={onClose} className="pb-3">
      <Modal.Title className="text-xl">Hapus agenda</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p className="text-sm text-slate-600">
        Apakah kamu yakin ingin menghapus agenda{" "}
        <span className="font-semibold text-slate-900">
          &ldquo;{event?.summary || "Tanpa judul"}&rdquo;
        </span>?
        Tindakan ini tidak dapat dibatalkan.
      </p>
    </Modal.Body>
    <Modal.Footer>
      <Button
        type="button"
        variant="outline"
        className="rounded-2xl"
        onClick={onClose}
        disabled={deleting}
      >
        Batal
      </Button>
      <Button
        type="button"
        className="rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
        onClick={onConfirm}
        disabled={deleting}
      >
        {deleting ? "Menghapus..." : "Hapus agenda"}
      </Button>
    </Modal.Footer>
  </Modal>
);

const EventItem = ({ event, selectedEventId, onSelect, onDelete }) => {
  const status = getEventStatus(event);
  const startValue = event.start?.dateTime || event.start?.date;
  const isSelected = selectedEventId === event.id;

  return (
    <div className="relative">
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
          <div className="min-w-0 flex-1 pr-7">
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
                className={`flex-shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${getStatusClassName(status)}`}
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

      <button
        type="button"
        title="Hapus agenda"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(event);
        }}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

const CombinedEventListPanel = ({
  todayEvents,
  upcomingEvents,
  selectedEventId,
  onSelect,
  onDelete,
  style,
}) => {
  const totalCount = todayEvents.length + upcomingEvents.length;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-white shadow-md"
      style={style}
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[1.05rem] font-semibold text-slate-900">Agenda</h2>
        <p className="mt-1 text-sm text-slate-500">
          {totalCount ? `${totalCount} event tersedia` : "Tidak ada event."}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {totalCount === 0 ? (
          <div className="flex h-full min-h-[220px] items-center justify-center rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
            Tidak ada event hari ini maupun mendatang.
          </div>
        ) : (
          <div className="space-y-1">
            {/* Hari Ini */}
            <div className="mb-2">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Hari Ini
              </p>
              {todayEvents.length === 0 ? (
                <div className="rounded-[14px] border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-400">
                  Tidak ada event hari ini.
                </div>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      selectedEventId={selectedEventId}
                      onSelect={onSelect}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="my-3 h-px w-full bg-slate-200" />

            {/* Mendatang */}
            <div>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mendatang
              </p>
              {upcomingEvents.length === 0 ? (
                <div className="rounded-[14px] border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-400">
                  Belum ada event mendatang.
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 12).map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      selectedEventId={selectedEventId}
                      onSelect={onSelect}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
  const [createAgendaOpen, setCreateAgendaOpen] = useState(false);
  const [createAgendaForm, setCreateAgendaForm] = useState(createDefaultAgendaForm);
  const [createAgendaError, setCreateAgendaError] = useState("");
  const [submittingAgenda, setSubmittingAgenda] = useState(false);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(false);
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
      setSummaryPanelHeight(
        Math.max(node.offsetHeight || 0, MIN_CALENDAR_PANEL_HEIGHT),
      );
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
    setCreateAgendaError("");
    setCreateAgendaForm(createDefaultAgendaForm());
    setCreateAgendaOpen(true);
  };

  const handleAgendaFieldChange = (field, value) => {
    setCreateAgendaForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateAgendaClose = () => {
    if (submittingAgenda) return;

    setCreateAgendaOpen(false);
    setCreateAgendaError("");
  };

  const handleCreateAgendaSubmit = async () => {
    const validationError = validateAgendaForm(createAgendaForm);
    if (validationError) {
      setCreateAgendaError(validationError);
      return;
    }

    setSubmittingAgenda(true);
    setCreateAgendaError("");

    try {
      const createdEvent = await calendarApi.createCalendarEvent(
        buildCreateAgendaPayload(createAgendaForm),
      );

      await loadEvents();
      setCreateAgendaOpen(false);
      setCreateAgendaForm(createDefaultAgendaForm());
      toast.success("Agenda berhasil ditambahkan ke Google Calendar.");

      if (createdEvent?.id) {
        setSelectedEvent(createdEvent);
      }
    } catch (err) {
      setCreateAgendaError(
        err.response?.data?.error ||
          err.message ||
          "Agenda belum bisa dibuat.",
      );
    } finally {
      setSubmittingAgenda(false);
    }
  };

  const handleDeleteRequest = (event) => {
    setDeleteConfirmEvent(event);
  };

  const handleDeleteClose = () => {
    if (deletingEvent) return;
    setDeleteConfirmEvent(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmEvent) return;

    setDeletingEvent(true);
    try {
      await calendarApi.deleteCalendarEvent(deleteConfirmEvent.id);

      if (selectedEvent?.id === deleteConfirmEvent.id) {
        setSelectedEvent(null);
        setShowMobileDetail(false);
      }

      setDeleteConfirmEvent(null);
      await loadEvents();
      toast.success("Agenda berhasil dihapus dari Google Calendar.");
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Agenda gagal dihapus."
      );
    } finally {
      setDeletingEvent(false);
    }
  };

  const sharedPanelStyle = summaryPanelHeight
    ? { height: `${summaryPanelHeight}px` }
    : undefined;
  const isGoogleLocked = isIntegrationLockedError(error, "google");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CalendarHeaderSection
        loading={loading}
        onRefresh={loadEvents}
        onCreateAgenda={handleCompose}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {lastSyncedAt ? (
        <p className="mt-3 text-sm text-slate-500">
          Terakhir sinkron: {formatDateTime(lastSyncedAt)}
        </p>
      ) : null}

      {error && !isGoogleLocked && (
        <Alert
          variant="error"
          className="mt-4"
          title="Calendar workspace error"
        >
          {error}
        </Alert>
      )}

      {isGoogleLocked ? (
        <LockedIntegrationState
          className="mt-4 min-h-[520px]"
          title="Calendar Workspace terkunci"
          description="Hubungkan akun Google terlebih dahulu agar agenda dari Google Calendar bisa disinkronkan dan dikelola dari workspace."
        />
      ) : (
        <>

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

            <div className="min-h-0 flex-1" style={sharedPanelStyle}>
              <CombinedEventListPanel
                todayEvents={todayEvents}
                upcomingEvents={upcomingEvents}
                selectedEventId={selectedEvent?.id}
                onSelect={handleEventSelect}
                onDelete={handleDeleteRequest}
                style={sharedPanelStyle}
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

      <CreateAgendaModal
        open={createAgendaOpen}
        form={createAgendaForm}
        error={createAgendaError}
        submitting={submittingAgenda}
        onClose={handleCreateAgendaClose}
        onChange={handleAgendaFieldChange}
        onSubmit={handleCreateAgendaSubmit}
      />

      <DeleteConfirmModal
        open={Boolean(deleteConfirmEvent)}
        event={deleteConfirmEvent}
        deleting={deletingEvent}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />
        </>
      )}
    </div>
  );
}
