import React from 'react'

export default function QuickGuideSection() {
  return (
    <div className="mt-8 p-5 panel-muted">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Panduan Cepat</p>
      <ul className="space-y-2 text-sm text-slate-600">
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full mt-2 flex-shrink-0" />
          Gunakan <strong>Settings</strong> di sidebar untuk mengubah URL webhook n8n tanpa perlu rebuild.
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-2 flex-shrink-0" />
          Upload dokumen SOP ke folder <strong>Input (SOP)</strong> agar bisa digunakan oleh Knowledge Agent.
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
          Riwayat chat tersimpan selama sesi aktif browser. Refresh halaman tidak akan menghapus riwayat percakapan.
        </li>
      </ul>
    </div>
  )
}
