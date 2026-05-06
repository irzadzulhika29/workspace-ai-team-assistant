import React, { useState } from "react";
import { X, Save, RotateCcw } from "lucide-react";
import { urls } from "../../services/api";

/**
 * SettingsModal - webhook configuration manager
 * Supports webhook mode selection on a single n8n base URL.
 */
export default function SettingsModal({ open, onClose }) {
  const [mode, setMode] = useState(() => urls.getMode());
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    urls.setMode(mode);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setMode(urls.getMode());
  };

  const config = urls.getConfig();
  const currentUrls = urls.getAll();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="
        bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4
        border border-gray-200 animate-slide-up max-h-[90vh] overflow-y-auto
      "
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Webhook Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Konfigurasi mode webhook n8n antara production dan test</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Base URL
            </label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <code className="text-sm text-slate-700 font-mono break-all">{config.baseUrl}</code>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Semua webhook n8n sekarang memakai satu base URL production.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Mode
            </label>
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setMode("publish")}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  mode === "publish"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Production
              </button>
              <button
                onClick={() => setMode("test")}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  mode === "test"
                    ? "bg-amber-600 text-white"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Test
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Production: <span className="font-mono">/webhook</span> | Test: <span className="font-mono">/webhook-test</span>
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">
              Preview URL Webhook
            </label>
            <div className="space-y-2">
              {Object.entries(currentUrls).map(([key, url]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="text-xs font-medium text-slate-500 min-w-[80px] capitalize">
                    {key}:
                  </span>
                  <code className="text-xs text-slate-700 font-mono bg-gray-50 px-2 py-1 rounded flex-1 break-all">
                    {url}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl sticky bottom-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <RotateCcw size={13} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold
              transition-all duration-150
              ${saved ? "bg-emerald-500 text-white" : "bg-brand-600 hover:bg-brand-700 text-white"}
            `}
          >
            <Save size={14} />
            {saved ? "Tersimpan!" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
