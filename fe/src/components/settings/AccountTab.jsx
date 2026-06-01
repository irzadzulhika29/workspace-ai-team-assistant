import { LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import GoogleAccountSection from './GoogleAccountSection';
import JiraSettingsSection from './JiraSettingsSection';
import WebhookEnvironmentSection from './WebhookEnvironmentSection';
import IntegrationListSection from './IntegrationListSection';

const logoutButtonClassName =
  'w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50';

export default function AccountTab({
  googleAccount,
  isGoogleConnecting,
  onGoogleConnect,
  onGoogleDisconnect,
  webhookMode,
  webhookUrl,
  onWebhookEnvironmentChange,
  integrationItems,
  connectedStates,
}) {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Account & Integrations</h2>
        <p className="mt-1 text-sm text-gray-500">
          Connect your accounts and manage integrations
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Connected Apps</h3>
          <p className="mt-1 text-sm text-gray-500">
            Hubungkan layanan kerja utama Anda dari satu panel yang sama.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GoogleAccountSection
            googleAccount={googleAccount}
            isGoogleConnecting={isGoogleConnecting}
            onConnect={onGoogleConnect}
            onDisconnect={onGoogleDisconnect}
          />

          <JiraSettingsSection />
        </div>
      </div>

      {/* Integration List Section */}
      <IntegrationListSection
        integrationItems={integrationItems}
        connectedStates={connectedStates}
      />

      {/* Webhook Environment Section */}
      <WebhookEnvironmentSection
        webhookMode={webhookMode}
        webhookUrl={webhookUrl}
        onModeChange={onWebhookEnvironmentChange}
      />

      {/* Logout Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Session</h3>
          <p className="mt-1 text-sm text-gray-500">
            Keluar dari akun workspace Anda pada perangkat ini.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className={logoutButtonClassName}
        >
          {loggingOut ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging out...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
