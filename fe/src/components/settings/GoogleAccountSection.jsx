import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const primaryButtonClassName =
  'w-full rounded-2xl bg-[#ff623d] px-4 py-2 font-medium text-white transition-colors hover:bg-[#ff744f] disabled:cursor-not-allowed disabled:opacity-50';
const dangerOutlineButtonClassName =
  'w-full rounded-2xl border border-rose-300 px-4 py-2 font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50';

export default function GoogleAccountSection({
  googleAccount,
  isGoogleConnecting,
  onConnect,
  onDisconnect
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Google Account</h3>
          <p className="text-sm text-gray-500 mt-1">
            Connect your Google account to access Calendar and Gmail
          </p>
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
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            {googleAccount.picture && (
              <img
                src={googleAccount.picture}
                alt={googleAccount.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{googleAccount.name}</p>
              <p className="text-sm text-gray-500">{googleAccount.email}</p>
            </div>
          </div>
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
              'Disconnect Google Account'
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={isGoogleConnecting}
          className={primaryButtonClassName}
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
