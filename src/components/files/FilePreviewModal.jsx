import React from 'react';
import { X, Download, FileText } from 'lucide-react'

/**
 * FilePreviewModal — overlay with PDF/document preview
 * @param {Object}   props.file - { name, url, type }
 * @param {Function} props.onClose
 */
export default function FilePreviewModal({ file, onClose }) {
  if (!file) return null

  const isPdf = file.name?.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'

  // Validasi URL: harus ada, harus string, dan harus dimulai dengan http:// atau https://
  const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false
    const trimmed = url.trim()
    return trimmed.startsWith('http://') || trimmed.startsWith('https://')
  }

  const hasValidUrl = isValidUrl(file.url)

  // Debug log untuk investigasi (bisa dihapus setelah fix)
  if (import.meta.env.DEV) {
    console.log('[FilePreviewModal] Debug:', {
      fileName: file.name,
      rawUrl: file.url,
      urlType: typeof file.url,
      hasValidUrl,
      isPdf
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="
        bg-white rounded-xl shadow-2xl flex flex-col
        w-full max-w-4xl h-[90vh]
        border border-gray-200 animate-slide-up overflow-hidden
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText size={16} className="text-slate-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {hasValidUrl && (
              <a
                href={file.url}
                download={file.name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                <Download size={13} />
                Download
              </a>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden">
          {!hasValidUrl ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <FileText size={48} className="opacity-30" />
              <p className="text-sm font-semibold text-red-500">URL file tidak valid</p>
              <p className="text-xs text-slate-500 max-w-md text-center">
                File ini tidak memiliki URL yang valid. Pastikan file sudah ter-upload dengan benar ke Supabase Storage.
              </p>
              {file.url && (
                <code className="text-xs bg-gray-100 px-3 py-1 rounded mt-2 text-slate-600">
                  {String(file.url).substring(0, 100)}...
                </code>
              )}
            </div>
          ) : isPdf ? (
            <iframe
              src={file.url}
              className="w-full h-full"
              title={file.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <FileText size={48} className="opacity-30" />
              <p className="text-sm">Preview tidak tersedia untuk tipe file ini.</p>
              <a href={file.url} download={file.name} className="text-brand-600 text-sm font-medium hover:underline">
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
