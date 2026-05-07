import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Globe,
  Loader2,
  RefreshCw,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { urls } from "../services/api";
import JiraIntegrationCard from "../components/integrations/JiraIntegrationCard";
import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from "@/components/ui";

const getInitials = (value) =>
  String(value || "AI")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const sectionCardClassName =
  "rounded-[1.6rem] border border-primary-100/80 bg-white/92 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur";

function SettingsSection({
  icon: Icon,
  kicker,
  title,
  description,
  children,
  tone = "text-primary-500 bg-primary-50",
}) {
  return (
    <section className={sectionCardClassName}>
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${tone}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {kicker}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-neutral-950">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, checkAuthStatus } = useAuth();
  const [mode, setMode] = useState(() => urls.getMode());
  const [profileForm, setProfileForm] = useState({ name: "", jobTitle: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [disconnectingGoogle, setDisconnectingGoogle] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(urls.getMode());
    setProfileForm({
      name: user?.name || "",
      jobTitle: user?.jobTitle || "",
    });
    setError("");
  }, [user?.jobTitle, user?.name]);

  const hasGoogleConnection = Boolean(user?.hasGoogleToken);

  const handleSaveWebhookMode = () => {
    urls.setMode(mode);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setError("");

    try {
      await axios.patch(
        `${urls.getBackendUrl()}/api/auth/profile`,
        {
          name: profileForm.name,
          jobTitle: profileForm.jobTitle,
        },
        { withCredentials: true },
      );
      await checkAuthStatus();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Profil tidak dapat diperbarui saat ini.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleGoogleConnect = () => {
    window.location.href = `${urls.getBackendUrl()}/api/auth/google`;
  };

  const handleGoogleDisconnect = async () => {
    setDisconnectingGoogle(true);
    setError("");

    try {
      await axios.post(
        `${urls.getBackendUrl()}/api/auth/google/disconnect`,
        {},
        { withCredentials: true },
      );
      await checkAuthStatus();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Koneksi Google tidak dapat diputuskan.",
      );
    } finally {
      setDisconnectingGoogle(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(135deg,#191919_0%,#3f2f2b_45%,#ff623d_100%)] p-6 text-white shadow-[0_24px_80px_rgba(255,98,61,0.24)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <Avatar
                size="lg"
                className="h-16 w-16 border-2 border-white/25 shadow-lg"
              >
                {user?.picture ? (
                  <AvatarImage src={user.picture} alt={user?.name || "User"} />
                ) : null}
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/65">
                  Settings Control Room
                </p>
                <h1 className="mt-2 text-3xl text-white font-semibold tracking-[-0.03em]">
                  {user?.name || "Workspace Profile"}
                </h1>
                <p className="mt-1 text-sm text-white/72">
                  Kelola identitas kerja, koneksi Google, Jira, dan mode webhook
                  dari satu tempat.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full border-white/20 bg-white/10 px-3 py-1 text-white">
                {hasGoogleConnection
                  ? "Google Connected"
                  : "Google Not Connected"}
              </Badge>
              <Badge className="rounded-full border-white/20 bg-white/10 px-3 py-1 text-white">
                Mode {mode === "test" ? "Test" : "Production"}
              </Badge>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <SettingsSection
              icon={UserRound}
              kicker="Profile"
              title="Identitas Kerja"
              description="Nama tampil bisa disesuaikan, sementara jabatan akan dipakai sebagai konteks profesional untuk draft dan handoff."
              tone="bg-neutral-900 text-white"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Nama
                  </span>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    placeholder="Nama profil"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Jabatan
                  </span>
                  <input
                    type="text"
                    value={profileForm.jobTitle}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        jobTitle: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    placeholder="Contoh: Project Manager"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleProfileSave}
                  disabled={savingProfile}
                  className="rounded-xl"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <BriefcaseBusiness className="h-4 w-4" />
                      Simpan Profil
                    </>
                  )}
                </Button>
                <p className="text-xs text-neutral-500">
                  Email akun:{" "}
                  <span className="font-medium text-neutral-700">
                    {user?.email || "-"}
                  </span>
                </p>
              </div>
            </SettingsSection>

            <SettingsSection
              icon={Globe}
              kicker="Google"
              title="Google Workspace"
              description="Koneksi ini menjadi sumber otoritas untuk Gmail, Calendar, Docs, Drive, dan Sheets."
              tone="bg-[#fff1ec] text-primary-500"
            >
              <div className="rounded-[1.4rem] border border-neutral-200 bg-gradient-to-r from-white via-neutral-50 to-[#fff6f2] p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-950">
                        {hasGoogleConnection
                          ? "Terhubung ke akun Google"
                          : "Google belum terhubung"}
                      </p>
                      {hasGoogleConnection ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : null}
                    </div>
                    <p className="mt-1 break-all text-sm text-neutral-500">
                      {user?.email || "Belum ada akun terhubung"}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">
                      Gunakan akun ini sebagai identitas utama untuk agent email,
                      calendar, dan briefing.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {hasGoogleConnection ? (
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        disabled={disconnectingGoogle}
                        onClick={handleGoogleDisconnect}
                      >
                        {disconnectingGoogle ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Disconnect Google
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={handleGoogleConnect} className="rounded-xl">
                        <ArrowUpRight className="h-4 w-4" />
                        Connect Google
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              icon={Settings2}
              kicker="Runtime"
              title="Webhook Mode"
              description="Tetap tersedia untuk pindah antara production dan test tanpa keluar dari workspace."
              tone="bg-slate-100 text-slate-700"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-2xl border border-neutral-200 bg-neutral-100 p-1">
                  <button
                    type="button"
                    onClick={() => setMode("publish")}
                    className={`rounded-[1rem] px-4 py-2 text-sm font-semibold transition ${
                      mode === "publish"
                        ? "bg-neutral-900 text-white shadow-sm"
                        : "text-neutral-500"
                    }`}
                  >
                    Production
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("test")}
                    className={`rounded-[1rem] px-4 py-2 text-sm font-semibold transition ${
                      mode === "test"
                        ? "bg-primary-500 text-white shadow-sm"
                        : "text-neutral-500"
                    }`}
                  >
                    Test
                  </button>
                </div>

                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={handleSaveWebhookMode}
                >
                  {saved ? "Tersimpan" : "Simpan Mode"}
                </Button>
              </div>

              <div className="mt-4 rounded-[1.25rem] border border-neutral-200 bg-neutral-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Webhook Base
                </p>
                <code className="mt-2 block break-all text-xs text-neutral-700">
                  {urls.getConfig().baseUrl}
                </code>
              </div>
            </SettingsSection>
          </div>

          <div className="space-y-5">
            <SettingsSection
              icon={ShieldCheck}
              kicker="Jira"
              title="Workspace Jira"
              description="Hubungkan workspace Atlassian Anda agar issue, progress, dan action agent tetap memakai akun yang benar."
              tone="bg-cyan-50 text-cyan-700"
            >
              <JiraIntegrationCard authenticated={Boolean(user)} />
            </SettingsSection>

          </div>
        </div>
      </div>
    </div>
  );
}
