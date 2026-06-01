import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "@/components/ui";
import { useJiraIntegration } from "@/hooks/useJiraIntegration";

const primaryButtonClassName =
  "rounded-xl bg-[#ff623d] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff744f] disabled:cursor-not-allowed disabled:opacity-50";
const outlineButtonClassName =
  "rounded-2xl border border-[#ff623d] px-4 py-2 font-medium text-[#ff623d] transition-colors hover:bg-[#fff4ef] disabled:cursor-not-allowed disabled:opacity-50";
const textButtonClassName =
  "px-3 py-1 text-sm text-[#ff623d] transition-colors hover:text-[#ff744f]";

export default function JiraSettingsSection() {
  const {
    jiraForm,
    setJiraForm,
    jira,
    handleJiraSave,
  } = useJiraIntegration();

  const [showApiToken, setShowApiToken] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
            <img
              src="/jira.png"
              alt="Jira"
              className="h-7 w-7 rounded-md object-contain"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900">Jira</h3>
          </div>
        </div>

        {jira.connected ? (
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Connected
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            disabled={jira.saving}
            className={primaryButtonClassName}
          >
            {jira.saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </span>
            ) : (
              "Hubungkan"
            )}
          </button>
        )}
      </div>

      <Modal
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Konfigurasi Jira"
        description="Atur kredensial Jira workspace Anda di sini."
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Jira Workspace URL
              </label>
              <input
                type="text"
                value={jiraForm.subdomain}
                onChange={(e) =>
                  setJiraForm({ ...jiraForm, subdomain: e.target.value })
                }
                placeholder="https://your-company.atlassian.net"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={jiraForm.email}
                onChange={(e) => setJiraForm({ ...jiraForm, email: e.target.value })}
                placeholder="your-email@company.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">API Token</label>
              <div className="relative">
                <input
                  type={showApiToken ? "text" : "password"}
                  value={jiraForm.apiToken}
                  onChange={(e) =>
                    setJiraForm({ ...jiraForm, apiToken: e.target.value })
                  }
                  placeholder="Enter your Jira API token"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-24 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiToken((current) => !current)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 ${textButtonClassName}`}
                >
                  {showApiToken ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Generate an API token from{" "}
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Atlassian Account Settings
                </a>
              </p>
            </div>

            {jira.error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {jira.error}
              </div>
            ) : null}
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={() => setIsConfigOpen(false)}
            className={outlineButtonClassName}
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={async () => {
              await handleJiraSave();
              setIsConfigOpen(false);
            }}
            disabled={
              jira.saving ||
              !jiraForm.subdomain ||
              !jiraForm.email ||
              !jiraForm.apiToken
            }
            className={primaryButtonClassName}
          >
            {jira.saving ? "Connecting..." : "Connect"}
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}
