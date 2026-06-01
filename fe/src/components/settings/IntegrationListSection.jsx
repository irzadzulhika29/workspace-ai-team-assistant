import { Link } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';

export default function IntegrationListSection({ integrationItems, connectedStates }) {
  const hasConnectedIntegration = Object.values(connectedStates || {}).some(Boolean);

  return (
    <div className="border-t border-slate-200 pt-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Aplikasi yang Terhubung
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Status layanan yang dipakai agent untuk bekerja di workspace.
        </p>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[20px] border border-slate-200 bg-white">
        <div className={`flex flex-col lg:flex-row ${hasConnectedIntegration ? '' : 'blur-[2px] opacity-45'}`}>
          {integrationItems.map((item, index) => {
            const Icon = item.icon;
            const isConnected = connectedStates[item.key];

            return (
              <div
                key={item.key}
                className={`flex flex-1 flex-col gap-4 px-5 py-5 ${
                  index !== integrationItems.length - 1
                    ? 'border-b border-slate-200 lg:border-b-0 lg:border-r'
                    : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${item.accent}`}
                  >
                    {item.iconSrc ? (
                      <img
                        src={item.iconSrc}
                        alt={`${item.label} icon`}
                        className="h-7 w-7 object-contain"
                      />
                    ) : (
                      <Icon className="h-7 w-7" />
                    )}
                  </div>
                  <div>
                    <p className="text-[1.05rem] font-medium text-slate-950">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </p>
                    <p className={`mt-2 text-xs font-semibold ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {isConnected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!hasConnectedIntegration ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/70 px-6 text-center backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ef] text-[#ff623d]">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-950">
                Integrasi belum terkoneksi
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Hubungkan Google atau Jira terlebih dahulu agar panel ini aktif.
              </p>
            </div>
            <Link
              to="/settings"
              className="rounded-xl bg-[#ff623d] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff744f]"
            >
              Koneksikan di Settings
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
