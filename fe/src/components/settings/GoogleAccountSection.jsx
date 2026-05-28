import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const primaryButtonClassName =
  'rounded-2xl bg-[#ff623d] px-4 py-2 font-medium text-white transition-colors hover:bg-[#ff744f] disabled:cursor-not-allowed disabled:opacity-50';
const dangerOutlineButtonClassName =
  'rounded-2xl border border-rose-300 px-4 py-2 font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50';

export default function GoogleAccountSection({
  googleAccount,
  isGoogleConnecting,
  onConnect,
  onDisconnect
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <img
            src="/google.png"
            alt="Google"
            className="mt-0.5 h-8 w-8 rounded-md object-contain"
          />
          <div>
          <h3 className="text-lg font-semibold text-gray-900">Google Account</h3>
          <p className="text-sm text-gray-500 mt-1">
            Connect your Google account to access Calendar and Gmail
          </p>
          </div>
        </div>
        {googleAccount ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Connected
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Not Connected
          </div>
        )}
      </div>

      {googleAccount ? (
        <div className="mt-auto space-y-4">
          <button
            onClick={onDisconnect}
            disabled={isGoogleConnecting}
            className={dangerOutlineButtonClassName}
          >
            {isGoogleConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Disconnecting...
              </span>
            ) : (
              'Disconnect '
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={isGoogleConnecting}
          className={`mt-auto ${primaryButtonClassName}`}
        >
          {isGoogleConnecting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </span>
          ) : (
            'Connect Google Account'
          )}
        </button>
      )}
    </div>
  );
}
