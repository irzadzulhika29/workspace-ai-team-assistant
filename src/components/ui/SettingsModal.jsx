import React, { useState } from 'react'
import { X, Save, RotateCcw } from 'lucide-react'
import { urls } from '../../services/api'

const FIELDS = [
  { key: 'supervisor', label: 'Supervisor Agent',    getter: urls.getSupervisor },
  { key: 'knowledge',  label: 'Knowledge Agent',     getter: urls.getKnowledge  },
  { key: 'upload',     label: 'Upload Dokumen',      getter: urls.getUpload     },
]

/**
 * SettingsModal — webhook URL manager, persists to localStorage
 */
export default function SettingsModal({ open, onClose }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(FIELDS.map(({ key, getter }) => [key, getter()]))
  )
  const [environment, setEnvironment] = useState(() => urls.getEnvironment())
  const [saved, setSaved] = useState(false)

  if (!open) return null

  const handleSave = () => {
    const convertedValues = urls.convertForEnvironment(values, environment)
    urls.setAll(convertedValues)
    urls.setEnvironment(environment)
    setValues(convertedValues)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setValues(Object.fromEntries(FIELDS.map(({ key, getter }) => [key, getter()])))
    setEnvironment(urls.getEnvironment())
  }

  const handleEnvironmentChange = (nextEnvironment) => {
    setEnvironment(nextEnvironment)
    setValues((currentValues) => urls.convertForEnvironment(currentValues, nextEnvironment))
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="
        bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4
        border border-gray-200 animate-slide-up
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Konfigurasi URL webhook n8n</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Environment
            </label>
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => handleEnvironmentChange('dev')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  environment === 'dev'
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Dev
              </button>
              <button
                onClick={() => handleEnvironmentChange('prod')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  environment === 'prod'
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Prod
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Dev: otomatis pakai <span className="font-mono">/webhook-test</span>, Prod: otomatis pakai <span className="font-mono">/webhook</span>
            </p>
          </div>

          {FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                {label}
              </label>
              <input
                type="url"
                value={values[key]}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                placeholder="https://..."
                className="
                  w-full px-3 py-2 rounded-md border border-gray-200
                  text-sm text-slate-800 font-mono bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500
                  transition-all duration-150
                "
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
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
              ${saved
                ? 'bg-emerald-500 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
              }
            `}
          >
            <Save size={14} />
            {saved ? 'Tersimpan!' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
