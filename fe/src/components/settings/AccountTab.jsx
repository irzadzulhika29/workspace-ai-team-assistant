import GoogleAccountSection from './GoogleAccountSection';
import JiraSettingsSection from './JiraSettingsSection';
import WebhookEnvironmentSection from './WebhookEnvironmentSection';
import IntegrationListSection from './IntegrationListSection';

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
  return (
    <div className="space-y-6">
      {/* Account Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Account & Integrations</h2>
        <p className="mt-1 text-sm text-gray-500">
          Connect your accounts and manage integrations
        </p>
      </div>

      {/* Google Account Section */}
      <GoogleAccountSection
        googleAccount={googleAccount}
        isGoogleConnecting={isGoogleConnecting}
        onConnect={onGoogleConnect}
        onDisconnect={onGoogleDisconnect}
      />

      {/* Jira Settings Section */}
      <JiraSettingsSection />

      {/* Webhook Environment Section */}
      <WebhookEnvironmentSection
        webhookMode={webhookMode}
        webhookUrl={webhookUrl}
        onModeChange={onWebhookEnvironmentChange}
      />

      {/* Integration List Section */}
      <IntegrationListSection
        integrationItems={integrationItems}
        connectedStates={connectedStates}
      />
    </div>
  );
}
