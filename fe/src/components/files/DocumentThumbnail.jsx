import { useState } from 'react'
import { FileText, Sparkles } from 'lucide-react'
import {
  getDocumentExtension,
  getDocumentPreviewKind,
  getOfficePreviewUrl,
  getPdfPreviewUrl,
  isGeneratedDocument,
} from '@/utils/fileWorkspace'

export default function DocumentThumbnail({ doc, tone }) {
  const [previewFailed, setPreviewFailed] = useState(false)
  const previewKind = getDocumentPreviewKind(doc)
  const extension = getDocumentExtension(doc).toUpperCase() || 'FILE'

  if (!doc?.url || previewFailed || previewKind === 'fallback') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(180deg,#fafafa_0%,#f3f4f6_100%)] px-4 text-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tone.iconWrap}`}>
          {isGeneratedDocument(doc) ? <Sparkles size={18} /> : <FileText size={18} />}
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-neutral-700">{extension}</p>
          <p className="mt-1 line-clamp-2 text-[11px] text-neutral-500">{doc.name}</p>
        </div>
      </div>
    )
  }

  if (previewKind === 'image') {
    return (
      <img
        src={doc.url}
        alt={doc.name}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setPreviewFailed(true)}
      />
    )
  }

  if (previewKind === 'pdf') {
    return (
      <iframe
        src={getPdfPreviewUrl(doc.url)}
        title={`Preview ${doc.name}`}
        className="h-full w-full"
        loading="lazy"
        onError={() => setPreviewFailed(true)}
      />
    )
  }

  return (
    <iframe
      src={getOfficePreviewUrl(doc.url)}
      title={`Preview ${doc.name}`}
      className="h-full w-full"
      loading="lazy"
      onError={() => setPreviewFailed(true)}
    />
  )
}
