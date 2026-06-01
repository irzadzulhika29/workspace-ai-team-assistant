import { CheckCircle2, Loader2 } from 'lucide-react';

const primaryButtonClassName =
  'rounded-xl bg-[#ff623d] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff744f] disabled:cursor-not-allowed disabled:opacity-50';

export default function GoogleAccountSection({
  googleAccount,
  isGoogleConnecting,
  onConnect,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
          <img
            src="/google.png"
            alt="Google"
            className="h-7 w-7 rounded-md object-contain"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900">Google</h3>
        </div>
      </div>

      {googleAccount ? (
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          Connected
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={isGoogleConnecting}
          className={`mt-auto ${primaryButtonClassName}`}
        >
          {isGoogleConnecting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </span>
          ) : (
            'Hubungkan'
          )}
        </button>
      )}
    </div>
  );
}
