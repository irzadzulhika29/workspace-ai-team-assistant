import { X, Download, FileText } from 'lucide-react'

/**
 * FilePreviewModal — overlay with PDF/document preview
 * @param {Object}   props.file - { name, url, type }
 * @param {Function} props.onClose
 */
export default function FilePreviewModal({ file, onClose }) {
  if (!file) return null

  const isPdf = file.name?.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'

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
            {file.url && (
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
          {isPdf && file.url ? (
            <iframe
              src={file.url}
              className="w-full h-full"
              title={file.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <FileText size={48} className="opacity-30" />
              <p className="text-sm">Preview tidak tersedia untuk tipe file ini.</p>
              {file.url && (
                <a href={file.url} download={file.name} className="text-brand-600 text-sm font-medium hover:underline">
                  Download file
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
