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

      <div className="mt-4 flex flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white lg:flex-row">
        {integrationItems.map((item, index) => {
          const Icon = item.icon;
          const connected = connectedStates[item.key];

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
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
