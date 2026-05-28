import { Button } from '@/components/ui';

export default function IntegrationListSection({ integrationItems, connectedStates }) {
  return (
    <div className="border-t border-slate-200 pt-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Aplikasi Pihak Ketiga yang Terhubung
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Status layanan yang dipakai agent untuk bekerja di workspace.
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-[20px] border border-slate-200 bg-white">
        {integrationItems.map((item, index) => {
          const Icon = item.icon;
          const connected = connectedStates[item.key];

          return (
            <div
              key={item.key}
              className={`flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between ${
                index !== integrationItems.length - 1
                  ? 'border-b border-slate-200'
                  : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${item.accent}`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[1.05rem] font-medium text-slate-950">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>
                    {connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="h-10 rounded-lg border-[#ff623d] px-5 text-[#ff623d] hover:bg-[#fff4ef]"
                >
                  Kelola
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-5 text-sm font-medium text-[#ff623d] hover:text-[#ff744f]"
      >
        Lihat semua integrasi
      </button>
    </div>
  );
}
