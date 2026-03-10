import { FileText } from 'lucide-react'

/**
 * SourceCitation — clickable document citation chip for RAG responses
 * @param {string} props.filename
 * @param {number} props.page
 * @param {Function} [props.onClick]
 */
export default function SourceCitation({ filename, page, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        border border-blue-200 bg-blue-50
        text-xs text-blue-600 font-medium
        hover:bg-blue-100 hover:border-blue-300
        transition-colors duration-150
        cursor-pointer
      "
      title={`Buka ${filename}, Halaman ${page}`}
    >
      <FileText size={11} />
      <span className="truncate max-w-[160px]">{filename}</span>
      {page && <span className="text-blue-400 font-mono flex-shrink-0">p.{page}</span>}
    </button>
  )
}
