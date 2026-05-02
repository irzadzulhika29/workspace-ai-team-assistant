import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CalendarDays,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ConfirmationModal } from '@/components/ui'
import UploadZone from '../components/files/UploadZone'
import DocumentChat from '../components/documents/DocumentChat'
import { fileApi } from '../services/api'

const SUPABASE_BASE_URL = import.meta.env.VITE_SUPABASE_URL

const normalizeFileUrl = (rawUrl) => {
  if (!rawUrl) return null

  const cleaned = String(rawUrl)
    .trim()
    .replace(/^["'=]+|["']+$/g, '')
    .trim()

  if (!cleaned) return null

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    if (cleaned.startsWith('http://localhost:8000/')) {
      return `${SUPABASE_BASE_URL}${cleaned.replace('http://localhost:8000', '')}`
    }
    return cleaned
  }

  if (cleaned.startsWith('/')) {
    return `${SUPABASE_BASE_URL}${cleaned}`
  }

  console.warn('[normalizeFileUrl] Format URL tidak dikenali:', rawUrl)
  return null
}

const formatDateLabel = (value) => {
  if (!value) return 'Tanggal tidak tersedia'

  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return 'Tanggal tidak tersedia'
  }
}

// Unused helper - removed to fix linting
// const formatDateTimeLabel = (value) => {
//   if (!value) return 'Belum tersedia'
//   try {
//     return new Date(value).toLocaleString('id-ID', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     })
//   } catch {
//     return 'Belum tersedia'
//   }
// }

const getDocumentBadge = (doc) => {
  const type = doc.documentType || 'uncategorized'
  return type.replace(/[_-]/g, ' ')
}

const getDocumentSnippet = (doc) => {
  const metadata = doc.metadata || {}

  return (
    metadata.summary ||
    metadata.description ||
    metadata.snippet ||
    metadata.preview ||
    (doc.kategori === 'generated'
      ? 'Dokumen hasil generate AI. Buka panel detail untuk preview, metadata, dan tindakan lanjutan.'
      : 'Dokumen yang diunggah ke workspace. Gunakan panel detail untuk preview dan tanyakan isi dokumen ke AI.')
  )
}

const getDocumentTone = (doc) => {
  if (doc.kategori === 'generated') {
    return {
      accent: 'border-cyan-200 bg-cyan-50 text-cyan-800',
      iconWrap: 'bg-cyan-50 text-cyan-700',
      sideLine: 'bg-brand-600',
      metaTone: 'text-cyan-700',
      label: 'AI',
    }
  }

  return {
    accent: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    iconWrap: 'bg-emerald-50 text-emerald-700',
    sideLine: 'bg-emerald-500',
    metaTone: 'text-emerald-700',
    label: 'User',
  }
}

export default function FileWorkspace() {
  const navigate = useNavigate()
  const [supabaseDocs, setSupabaseDocs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [activeTab, setActiveTab] = useState('generated')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadDokumen = useCallback(async () => {
    try {
      setIsLoading(true)
      setFetchError(null)
      const data = await fileApi.fetchDokumen()

      const documents = []

      for (const doc of data) {
        const cleanUrl = normalizeFileUrl(doc.file_url)
        if (!cleanUrl) continue

        documents.push({
          id: doc.id ?? crypto.randomUUID(),
          name: doc.nama_file ?? 'Untitled',
          type: 'file',
          url: cleanUrl,
          downloadUrl: cleanUrl,
          source: 'supabase',
          createdAt: doc.created_at,
          kategori: doc.kategori || 'uploaded',
          documentType: doc.document_type || 'uncategorized',
          metadata: doc.metadata || {},
        })
      }

      setSupabaseDocs(documents)
    } catch (err) {
      console.error('Gagal memuat dokumen dari Supabase:', err)
      setFetchError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDokumen()
  }, [loadDokumen])

  const handleUploaded = useCallback(() => {
    setUploadModalOpen(false)
    loadDokumen()
  }, [loadDokumen])

  const allDocuments = useMemo(() => supabaseDocs, [supabaseDocs])

  const generatedDocuments = useMemo(
    () => allDocuments.filter((doc) => doc.kategori === 'generated'),
    [allDocuments],
  )

  const uploadedDocuments = useMemo(
    () => allDocuments.filter((doc) => doc.kategori !== 'generated'),
    [allDocuments],
  )

  const filteredDocuments = useMemo(() => {
    if (activeTab === 'generated') return generatedDocuments
    if (activeTab === 'uploaded') return uploadedDocuments
    return allDocuments
  }, [activeTab, generatedDocuments, uploadedDocuments, allDocuments])

  useEffect(() => {
    if (allDocuments.length === 0) {
      setSelectedDocument(null)
      return
    }

    setSelectedDocument((current) => {
      if (current && allDocuments.some((doc) => doc.id === current.id)) {
        return allDocuments.find((doc) => doc.id === current.id) || current
      }

      if (generatedDocuments.length > 0) return generatedDocuments[0]
      if (uploadedDocuments.length > 0) return uploadedDocuments[0]
      return allDocuments[0]
    })
  }, [allDocuments, generatedDocuments, uploadedDocuments])

  useEffect(() => {
    if (activeTab === 'generated' && generatedDocuments.length === 0 && uploadedDocuments.length > 0) {
      setActiveTab('uploaded')
    }

    if (activeTab === 'uploaded' && uploadedDocuments.length === 0 && generatedDocuments.length > 0) {
      setActiveTab('generated')
    }
  }, [activeTab, generatedDocuments.length, uploadedDocuments.length])

  const handleCreateDocument = useCallback(() => {
    navigate('/chat/supervisor', {
      state: {
        autoSendMessage: 'Buatkan dokumen / laporan progres untuk project saya. Tolong tanyakan detail yang diperlukan terlebih dahulu.',
        preFillOnly: true,
      },
    })
  }, [navigate])

  const handleSelectDocument = useCallback((document) => {
    setSelectedDocument(document)
  }, [])

  const handleDeleteClick = useCallback((document) => {
    setDocumentToDelete(document)
    setDeleteModalOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!documentToDelete) return

    try {
      setIsDeleting(true)
      await fileApi.deleteDokumen(documentToDelete.id)
      
      // Close modal
      setDeleteModalOpen(false)
      setDocumentToDelete(null)
      
      // Reload documents
      await loadDokumen()
      
      // Clear selected document if it was deleted
      if (selectedDocument?.id === documentToDelete.id) {
        setSelectedDocument(null)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Gagal menghapus dokumen: ' + error.message)
    } finally {
      setIsDeleting(false)
    }
  }, [documentToDelete, loadDokumen, selectedDocument])

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false)
    setDocumentToDelete(null)
  }, [])

  const selectedTone = getDocumentTone(selectedDocument || { kategori: 'generated' })

  return (
    <div className="relative h-full overflow-hidden px-5 py-6 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,_rgba(196,231,255,0.55),_transparent_58%)]" />

      <div className="relative mx-auto flex h-full max-w-7xl gap-6 overflow-hidden">
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-800">
                Documents Workspace
              </p>
              <h1 className="mt-2 text-3xl font-bold font-headline tracking-tight text-slateui-900 md:text-4xl">
                Documents
              </h1>
              <p className="mt-3 text-sm leading-7 text-slateui-500">
                Kelola dokumen generated dan uploaded dalam satu workspace untuk download dan tanya isi dokumen dengan AI.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Total File</p>
                <p className="mt-1 text-sm font-semibold text-slateui-900">{allDocuments.length} dokumen</p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex w-fit rounded-2xl border border-slate-200 bg-white/85 p-1 shadow-sm">
              {[
                { key: 'generated', label: `Generated (${generatedDocuments.length})` },
                { key: 'uploaded', label: `Uploaded (${uploadedDocuments.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-slate-100 text-slateui-900 shadow-[0_1px_4px_rgba(25,28,29,0.08)]'
                      : 'text-slateui-500 hover:text-slateui-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCreateDocument}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(0,97,132,0.18)] transition-colors hover:bg-brand-700"
              >
                <Sparkles size={16} />
                Buat Dokumen
              </button>

              {activeTab === 'uploaded' ? (
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slateui-900 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <Upload size={16} className="text-brand-600" />
                  Upload File
                </button>
              ) : null}
            </div>
          </div>

          {fetchError ? (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>Gagal memuat dokumen dari database: {fetchError}</span>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="skeleton h-56 rounded-[1.4rem]" />
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="panel flex min-h-[320px] items-center justify-center border border-slate-200/80 p-8 text-center">
                <div>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FileText size={24} />
                  </div>
                  <h2 className="text-xl font-semibold font-headline text-slateui-900">Belum ada dokumen</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slateui-500">
                    Upload file terlebih dahulu atau generate dokumen baru dari Supervisor agar workspace ini terisi.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredDocuments.map((doc) => {
                  const tone = getDocumentTone(doc)
                  const isSelected = selectedDocument?.id === doc.id
                  const badgeLabel = getDocumentBadge(doc)

                  return (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectDocument(doc)}
                      className={`group relative flex min-h-[250px] flex-col overflow-hidden rounded-[1.4rem] border bg-white/90 p-5 text-left shadow-[0_8px_24px_rgba(25,28,29,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(25,28,29,0.08)] ${
                        isSelected ? 'border-brand-300 ring-2 ring-brand-100' : 'border-slate-200'
                      }`}
                    >
                      {isSelected ? <div className={`absolute inset-y-0 left-0 w-1 ${tone.sideLine}`} /> : null}

                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone.iconWrap}`}>
                          {doc.kategori === 'generated' ? <Sparkles size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                            {badgeLabel}
                          </span>
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tone.accent}`}>
                            {tone.label}
                          </span>
                        </div>
                      </div>

                      <h3 className="line-clamp-2 text-xl font-semibold font-headline leading-tight text-slateui-900 transition-colors group-hover:text-brand-700">
                        {doc.name}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-xs leading-6 text-slateui-500">
                        {getDocumentSnippet(doc)}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} />
                          {formatDateLabel(doc.createdAt)}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 font-medium ${tone.metaTone}`}>
                          <Eye size={13} />
                          Buka detail
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="hidden w-[380px] flex-shrink-0 xl:flex">
          <div className="panel sticky top-0 flex h-[calc(100vh-8rem)] w-full flex-col overflow-hidden border border-slate-200/80">
            {selectedDocument ? (
              <>
                <div className="border-b border-slate-200 bg-white/75 px-6 py-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                      {getDocumentBadge(selectedDocument)}
                    </span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${selectedTone.accent}`}>
                      {selectedDocument.kategori === 'generated' ? 'Generated' : 'Uploaded'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold font-headline leading-tight text-slateui-900">
                    {selectedDocument.name}
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Created</p>
                      <p className="mt-1 font-medium text-slateui-900">{formatDateLabel(selectedDocument.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Author</p>
                      <p className="mt-1 flex items-center gap-2 font-medium text-slateui-900">
                        {selectedDocument.kategori === 'generated' ? <Bot size={14} className="text-brand-600" /> : <Upload size={14} className="text-emerald-600" />}
                        {selectedDocument.kategori === 'generated' ? 'Sahara AI' : 'Workspace User'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Category</p>
                      <p className="mt-1 font-medium text-slateui-900">{selectedDocument.kategori}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Source</p>
                      <p className="mt-1 font-medium text-slateui-900">{selectedDocument.source}</p>
                    </div>
                  </div>

                  <div className="my-6 border-t border-slate-200" />

                  <div className="mt-6 flex gap-3">
                    <a
                      href={selectedDocument.downloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                    >
                      <Download size={15} />
                      Download
                    </a>
                    <a
                      href={selectedDocument.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Eye size={15} />
                      Lihat File
                    </a>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => handleDeleteClick(selectedDocument)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Hapus Dokumen
                    </button>
                  </div>

                  {selectedDocument.kategori === 'generated' ? (
                    <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                      <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-cyan-900">
                        <Sparkles size={15} />
                        Ask Supervisor
                      </p>
                      <p className="text-xs leading-6 text-cyan-800">
                        Dokumen generated belum memakai panel chat dokumen. Gunakan Supervisor untuk revisi, tindak lanjut, atau permintaan dokumen lanjutan.
                      </p>
                      <button
                        onClick={handleCreateDocument}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-800"
                      >
                        Buka Supervisor
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <DocumentChat document={selectedDocument} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FolderOpen size={24} />
                  </div>
                  <h2 className="text-xl font-semibold font-headline text-slateui-900">Pilih dokumen</h2>
                  <p className="mt-2 text-sm leading-6 text-slateui-500">
                    Panel kanan akan menampilkan metadata, preview, dan chat dokumen ketika Anda memilih salah satu file.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {uploadModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-800">
                  <Upload size={12} />
                  Uploaded Panel
                </div>
                <h2 className="mt-4 text-2xl font-semibold font-headline text-slateui-900">
                  Upload file ke workspace
                </h2>
                <p className="mt-2 text-sm leading-6 text-slateui-500">
                  Gunakan area upload yang sama untuk menambahkan PDF atau DOCX ke panel uploaded.
                </p>
              </div>

              <button
                onClick={() => setUploadModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slateui-900"
                aria-label="Tutup modal upload"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
              <UploadZone onUploaded={handleUploaded} targetFolder="uploaded" />
            </div>
          </div>
        </div>
      ) : null}

      {deleteModalOpen ? (
        <ConfirmationModal
          open={deleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          variant="danger"
          title="Hapus Dokumen"
          description={
            <>
              Apakah Anda yakin ingin menghapus dokumen{' '}
              <span className="font-semibold text-slateui-900">
                {documentToDelete?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </>
          }
          confirmLabel="Hapus"
          cancelLabel="Batal"
          loading={isDeleting}
          loadingLabel="Menghapus..."
          icon={<Trash2 />}
        />
      ) : null}
    </div>
  )
}
