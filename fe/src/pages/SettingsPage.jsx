import { useState } from "react";
import { Calendar, Mail, Settings2, ShieldCheck } from "lucide-react";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { useJiraIntegration } from "@/hooks/useJiraIntegration";
import { useWebhookSettings } from "@/hooks/useWebhookSettings";
import ProfileTab from "@/components/settings/ProfileTab";
import AccountTab from "@/components/settings/AccountTab";

const tabItems = [
  { key: "profile", label: "Profile Settings", icon: Settings2 },
  { key: "account", label: "Akun Tertaut", icon: Settings2 },
];

const panelCardClassName =
  "rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.06)]";

const integrationItems = [
  {
    key: "email",
    label: "Email",
    description: "Sinkronisasi email masuk dan keluar",
    icon: Mail,
    iconSrc: "/email.png",
    accent: "bg-blue-50 text-blue-600",
  },
  {
    key: "calendar",
    label: "Google Calendar",
    description: "Sinkronisasi jadwal dan event",
    icon: Calendar,
    iconSrc: "/google-calendar.png",
    accent: "bg-green-50 text-green-600",
  },
  {
    key: "jira",
    label: "Jira",
    description: "Akses project, issue, dan sprint",
    icon: ShieldCheck,
    iconSrc: "/jira.png",
    accent: "bg-cyan-50 text-cyan-600",
  },
];

function SettingsSidebar({ activeTab, onChange }) {
  return (
    <aside className="h-fit max-w-5xl self-start rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)] lg:sticky lg:top-0 lg:w-[280px] lg:max-w-none lg:flex-shrink-0">
      <div className="space-y-1.5">
        {tabItems.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`flex w-full items-center gap-3 border-b-2 px-4 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? "border-[#ff623d] text-slate-950"
                  : "border-transparent text-slate-600 hover:text-slate-950"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Custom hooks for state and logic
  const profileSettings = useProfileSettings();
  const googleIntegration = useGoogleIntegration();
  const jiraIntegration = useJiraIntegration();
  const webhookSettings = useWebhookSettings();

  // Combine errors from all hooks
  const error =
    profileSettings.error ||
    googleIntegration.error ||
    jiraIntegration.error ||
    webhookSettings.error;

  const connectedStates = {
    email: Boolean(googleIntegration.googleAccount),
    calendar: Boolean(googleIntegration.googleAccount),
    jira: Boolean(jiraIntegration.jira?.connected),
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="mx-auto max-w-[1540px]">
        <header className="mb-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-[280px]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-2xl text-[#ff623d]">
                  <Settings2 className="h-10 w-10" />
                </div>
                <h1 className="text-[2rem] font-bold leading-tight text-[#ff623d]">
                  Settings
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Kelola profil, integrasi, dan koneksi akun Anda.
              </p>
            </div>
          </div>
        </header>

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-7 flex w-full flex-col gap-4 md:items-start lg:flex-row">
          <SettingsSidebar activeTab={activeTab} onChange={setActiveTab} />

          <section className={`${panelCardClassName} min-w-0 flex-1`}>
            {activeTab === "profile" ? (
              <ProfileTab {...profileSettings} />
            ) : (
              <AccountTab
                {...googleIntegration}
                {...jiraIntegration}
                {...webhookSettings}
                integrationItems={integrationItems}
                connectedStates={connectedStates}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
