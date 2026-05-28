import { useState } from "react";
import { AlertCircle, CheckCircle, Workflow } from "lucide-react";
import { useJiraIntegration } from "@/hooks/useJiraIntegration";

const primaryButtonClassName =
  "rounded-2xl bg-[#ff623d] px-4 py-2 font-medium text-white transition-colors hover:bg-[#ff744f] disabled:cursor-not-allowed disabled:opacity-50";
const outlineButtonClassName =
  "rounded-2xl border border-[#ff623d] px-4 py-2 font-medium text-[#ff623d] transition-colors hover:bg-[#fff4ef] disabled:cursor-not-allowed disabled:opacity-50";
const dangerOutlineButtonClassName =
  "rounded-2xl border border-rose-300 px-4 py-2 font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50";
const textButtonClassName =
  "px-3 py-1 text-sm text-[#ff623d] transition-colors hover:text-[#ff744f]";

export default function JiraSettingsSection() {
  const {
    jiraForm,
    setJiraForm,
    jira,
    handleJiraSave,
    handleJiraTest,
    handleJiraDisconnect,
  } = useJiraIntegration();

  const [showApiToken, setShowApiToken] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <Workflow className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Jira Integration
          </h3>
          <p className="text-sm text-gray-500">Connect your Jira workspace</p>
        </div>
      </div>

      {jira.connected ? (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-900">
              Connected to Jira
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              {jiraForm.subdomain} • {jiraForm.email}
            </p>
          </div>
        </div>
      ) : null}

      {!jira.connected && jira.error ? (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">Not Connected</p>
            <p className="mt-1 text-sm text-amber-700">{jira.error}</p>
          </div>
        </div>
      ) : null}

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
            disabled={jira.connected}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={jiraForm.email}
            onChange={(e) => setJiraForm({ ...jiraForm, email: e.target.value })}
            placeholder="your-email@company.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            disabled={jira.connected}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            API Token
          </label>
          <div className="relative">
            <input
              type={showApiToken ? "text" : "password"}
              value={jiraForm.apiToken}
              onChange={(e) =>
                setJiraForm({ ...jiraForm, apiToken: e.target.value })
              }
              placeholder="Enter your Jira API token"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-24 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              disabled={jira.connected}
            />
            <button
              type="button"
              onClick={() => setShowApiToken((current) => !current)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 ${textButtonClassName}`}
              disabled={jira.connected}
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
      </div>

      <div className="mt-6 flex gap-3">
        {!jira.connected ? (
          <>
            <button
              onClick={handleJiraTest}
              disabled={
                jira.saving ||
                !jiraForm.subdomain ||
                !jiraForm.email ||
                !jiraForm.apiToken
              }
              className={`flex-1 ${outlineButtonClassName}`}
            >
              {jira.saving ? "Testing..." : "Test Connection"}
            </button>
            <button
              onClick={handleJiraSave}
              disabled={
                jira.saving ||
                !jiraForm.subdomain ||
                !jiraForm.email ||
                !jiraForm.apiToken
              }
              className={`flex-1 ${primaryButtonClassName}`}
            >
              {jira.saving ? "Connecting..." : "Connect"}
            </button>
          </>
        ) : (
          <button
            onClick={handleJiraDisconnect}
            disabled={jira.disconnecting}
            className={dangerOutlineButtonClassName}
          >
            {jira.disconnecting ? "Disconnecting..." : "Disconnect"}
          </button>
        )}
      </div>
    </div>
  );
}
