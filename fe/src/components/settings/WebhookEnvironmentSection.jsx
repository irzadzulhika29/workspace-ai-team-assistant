import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

const primaryToggleClassName = 'bg-[#ff623d] text-white shadow-sm';
const secondaryToggleClassName =
  'text-slate-600 hover:bg-white hover:text-slate-900';
const outlineButtonClassName =
  'rounded-2xl border border-[#ff623d] px-4 py-2 text-[#ff623d] transition-colors hover:bg-[#fff4ef]';

export default function WebhookEnvironmentSection({ webhookMode, webhookUrl, onModeChange }) {
  const [copied, setCopied] = useState(false);

  const handleCopyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy webhook URL:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Webhook Environment
      </h2>

      {/* Mode Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Environment Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onModeChange('publish')}
            className={`flex-1 rounded-2xl px-4 py-2 font-medium transition-colors ${
              webhookMode === 'publish'
                ? primaryToggleClassName
                : secondaryToggleClassName
            }`}
          >
            Production
          </button>
          <button
            onClick={() => onModeChange('test')}
            className={`flex-1 rounded-2xl px-4 py-2 font-medium transition-colors ${
              webhookMode === 'test'
                ? primaryToggleClassName
                : secondaryToggleClassName
            }`}
          >
            Test
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {webhookMode === 'publish'
            ? 'Using production webhook endpoint'
            : 'Using test webhook endpoint for development'}
        </p>
      </div>

      {/* Webhook URL Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Webhook URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={webhookUrl}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
          />
          <button
            onClick={handleCopyWebhookUrl}
            className={`flex items-center gap-2 ${outlineButtonClassName}`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Use this URL in your n8n webhook configuration
        </p>
      </div>
    </div>
  );
}
