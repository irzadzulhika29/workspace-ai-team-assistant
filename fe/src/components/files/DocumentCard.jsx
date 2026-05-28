import { CalendarDays } from 'lucide-react'
import DocumentThumbnail from '@/components/files/DocumentThumbnail'
import {
  formatDateLabel,
  getDocumentBadge,
  getDocumentTone,
} from '@/utils/fileWorkspace'

export default function DocumentCard({ doc, isSelected, onSelect, showBadge = false, variant = 'grid' }) {
  const tone = getDocumentTone(doc)

  return (
    <button
      onClick={() => onSelect(doc)}
      className={`text-left ${
        variant === 'recent'
          ? `group relative flex min-h-[250px] flex-col overflow-hidden rounded-lg border bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
              isSelected ? 'border-[#ff5a3f] ring-2 ring-[#ff5a3f]/20' : 'border-neutral-200'
            }`
          : `rounded-lg border bg-white p-3 ${
              isSelected ? 'border-[#ff5a3f] ring-2 ring-[#ff5a3f]/20' : 'border-neutral-200'
            }`
      }`}
    >
      <div className="mb-2 min-h-[150px] overflow-hidden rounded border border-neutral-200 bg-[#f8f8f8]">
        <DocumentThumbnail doc={doc} tone={tone} />
      </div>

      <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900">{doc.name}</h3>

      {showBadge ? (
        <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={11} />
            {formatDateLabel(doc.createdAt)}
          </span>
          <span className="rounded bg-neutral-100 px-2 py-0.5">{getDocumentBadge(doc)}</span>
        </div>
      ) : (
        <p className="mt-1 text-xs text-neutral-500">{formatDateLabel(doc.createdAt)}</p>
      )}
    </button>
  )
}
