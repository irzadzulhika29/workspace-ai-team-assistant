import {
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FolderOpen,
  Trash2,
} from 'lucide-react'
import DocumentChat from '@/components/documents/DocumentChat'
import { formatDateLabel } from '@/utils/fileWorkspace'

export default function SelectedDocumentPanel({
  selectedDocument,
  mobileDetailRef,
  isDetailExpanded,
  onToggleDetail,
  onDeleteClick,
}) {
  return (
    <aside
      ref={mobileDetailRef}
      className="min-w-0 rounded-3xl bg-white xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-hidden"
    >
      {selectedDocument ? (
        <>
          <div className="bg-[#ff5a3f] px-5 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="line-clamp-1 text-[1.15rem] font-semibold text-white">
                {selectedDocument.name}
              </h2>
              <button
                onClick={onToggleDetail}
                className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/40 bg-white/10 text-white hover:bg-white/20"
                aria-label={isDetailExpanded ? 'Collapse detail' : 'Expand detail'}
                title={isDetailExpanded ? 'Collapse detail' : 'Expand detail'}
              >
                {isDetailExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4 p-4 xl:h-[calc(100%-72px)]">
            <div className={`${isDetailExpanded ? 'block' : 'hidden'} space-y-4`}>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-[11px] font-semibold text-neutral-700">Created</p>
                  <p className="mt-0.5 text-sm text-neutral-800">
                    {formatDateLabel(selectedDocument.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-neutral-700">Category</p>
                  <p className="mt-0.5 text-sm text-neutral-800">{selectedDocument.kategori}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-neutral-700">Source</p>
                  <p className="mt-0.5 text-sm text-neutral-800">1 Link</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={selectedDocument.downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#ff5a3f] px-3 py-2.5 text-xs font-semibold text-white"
                >
                  <Download size={13} />
                  Download
                </a>
                <a
                  href={selectedDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700"
                >
                  <Eye size={13} />
                  Lihat File
                </a>
              </div>

              <div className="mt-3">
                <button
                  onClick={() => onDeleteClick(selectedDocument)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-600"
                >
                  <Trash2 size={13} />
                  Hapus Dokumen
                </button>
              </div>
            </div>

            {!isDetailExpanded ? (
              <div className="p-4">
                <button
                  onClick={onToggleDetail}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700"
                >
                  <ChevronDown size={14} />
                  Expand Detail Dokumen
                </button>
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl">
              <div className="h-full overflow-hidden rounded-xl bg-white">
                <DocumentChat document={selectedDocument} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full min-h-[320px] items-center justify-center p-8 text-center">
          <div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <FolderOpen size={24} />
            </div>
            <h2 className="text-xl font-semibold font-headline text-neutral-900">Pilih dokumen</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Panel kanan akan menampilkan metadata, preview, dan chat dokumen ketika Anda memilih salah satu file.
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
