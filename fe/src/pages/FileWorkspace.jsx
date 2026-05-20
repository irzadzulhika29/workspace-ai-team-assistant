import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Search,
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



const getDocumentBadge = (doc) => {
  const type = doc.documentType || 'uncategorized'
  return type.replace(/[_-]/g, ' ')
}

const GENERATED_CATEGORIES = new Set(['generated', 'report', 'presentation', 'output'])

const normalizeCategoryGroup = (kategori) => {
  const normalized = String(kategori || '').trim().toLowerCase()
  if (GENERATED_CATEGORIES.has(normalized)) return 'generated'
  return 'uploaded'
}

const isGeneratedDocument = (doc) =>
  normalizeCategoryGroup(doc?.categoryGroup || doc?.kategori) === 'generated'

const getDocumentSnippet = (doc) => {
  const metadata = doc.metadata || {}

  return (
    metadata.summary ||
    metadata.description ||
    metadata.snippet ||
    metadata.preview ||
    (isGeneratedDocument(doc)
      ? 'Dokumen hasil generate AI. Buka panel detail untuk preview, metadata, dan tindakan lanjutan.'
      : 'Dokumen yang diunggah ke workspace. Gunakan panel detail untuk preview dan tanyakan isi dokumen ke AI.')
  )
}

const getDocumentTone = (doc) => {
  if (isGeneratedDocument(doc)) {
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
  const mobileDetailRef = useRef(null)
  const [supabaseDocs, setSupabaseDocs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [activeTab, setActiveTab] = useState('generated')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDetailExpanded, setIsDetailExpanded] = useState(true)

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
          categoryGroup: normalizeCategoryGroup(doc.kategori),
          documentType: doc.document_type || 'uncategorized',
          metadata: doc.metadata || {},
        })
      }

      setSupabaseDocs(documents)
      setSelectedDocument(null)
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
    () => allDocuments.filter((doc) => doc.categoryGroup === 'generated'),
    [allDocuments],
  )

  const uploadedDocuments = useMemo(
    () => allDocuments.filter((doc) => doc.categoryGroup !== 'generated'),
    [allDocuments],
  )

  const recentDocuments = useMemo(
    () => allDocuments.slice(0, 4),
    [allDocuments],
  )

  useEffect(() => {
    if (allDocuments.length === 0) {
      setSelectedDocument(null)
      return
    }

    setSelectedDocument((current) => {
      if (!current) return null
      if (allDocuments.some((doc) => doc.id === current.id)) {
        return allDocuments.find((doc) => doc.id === current.id) || current
      }
      return null
    })
  }, [allDocuments])

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
    setIsDetailExpanded(true)

    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      window.requestAnimationFrame(() => {
        mobileDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
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

  return (
    <div className="h-full overflow-y-auto">
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
            <input
              readOnly
              value=""
              placeholder="Search"
              className="h-12 w-full rounded-full border border-neutral-300 bg-[#e9eaed] pl-12 pr-4 text-sm text-neutral-700 outline-none"
            />
          </div>
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-neutral-800">Irza</p>
            <p className="text-xs text-neutral-600">Admin</p>
          </div>
        </div>

        <section className="mb-5 overflow-hidden rounded-3xl border border-black/10 bg-[linear-gradient(90deg,#ff5a3f_0%,#55251d_42%,#141414_100%)] px-5 py-5 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold font-headline text-white leading-tight">Document</h1>
              <p className="mt-2 text-md leading-relaxed text-white/95 ">
                Kelola dokumen generated dan uploaded dalam satu workspace untuk download dan tanya isi dokumen dengan AI.
              </p>
            </div>
            <div className="inline-flex rounded-2xl border border-white/80 bg-white p-1">
              {[
                { key: 'generated', label: 'Generated' },
                { key: 'uploaded', label: 'Uploaded' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-xl px-8 py-2.5 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-[#ff5a3f] text-white'
                      : 'text-[#ff5a3f]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_470px]">
          <section className="min-w-0 rounded-3xl border border-neutral-300 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-300 px-6 py-4">
              <h2 className="text-4xl font-semibold text-neutral-700">Dokumen Terbaru</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[#ff6a52] px-3 text-[#ff6a52]"
                >
                  <Upload size={14} />
                </button>
                <button
                  onClick={handleCreateDocument}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[#ff5a3f] px-4 text-sm font-semibold text-white"
                >
                  Buat Document
                </button>
              </div>
            </div>

          {fetchError ? (
            <div className="flex items-center gap-2 rounded-2xl  bg-red-50 px-4 py-3 text-sm text-error">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>Gagal memuat dokumen dari database: {fetchError}</span>
            </div>
          ) : null}

            <div className="space-y-7 p-4">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="skeleton h-56 rounded-[1.4rem]" />
                ))}
              </div>
            ) : allDocuments.length === 0 ? (
              <div className="panel flex min-h-[320px] items-center justify-center border border-neutral-200 p-8 text-center">
                <div>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                    <FileText size={24} />
                  </div>
                  <h2 className="text-xl font-semibold font-headline text-neutral-900">Belum ada dokumen</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                    Upload file terlebih dahulu atau generate dokumen baru dari Supervisor agar workspace ini terisi.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-[#ffedea] p-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {recentDocuments.map((doc) => {
                  const tone = getDocumentTone(doc)
                  const isSelected = selectedDocument?.id === doc.id
                  const badgeLabel = getDocumentBadge(doc)

                  return (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectDocument(doc)}
                      className={`group relative flex min-h-[250px] flex-col overflow-hidden rounded-lg border bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        isSelected ? 'border-[#ff5a3f] ring-2 ring-[#ff5a3f]/20' : 'border-neutral-200'
                      }`}
                    >
                      <div className="mb-2 flex min-h-[150px] items-center justify-center rounded border border-neutral-200 bg-[#f8f8f8]">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone.iconWrap}`}>
                          {isGeneratedDocument(doc) ? <Sparkles size={18} /> : <FileText size={18} />}
                        </div>
                      </div>

                      <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900">
                        {doc.name}
                      </h3>
                      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={11} />
                          {formatDateLabel(doc.createdAt)}
                        </span>
                        <span className="rounded bg-neutral-100 px-2 py-0.5">{badgeLabel}</span>
                      </div>
                    </button>
                  )
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-4xl font-semibold text-neutral-700">
                    {activeTab === 'generated' ? 'Dokumen Generated' : 'Dokumen Terupload'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {(activeTab === 'generated' ? generatedDocuments : uploadedDocuments).map((doc) => {
                      const isSelected = selectedDocument?.id === doc.id
                      return (
                        <button
                          key={doc.id}
                          onClick={() => handleSelectDocument(doc)}
                          className={`rounded-lg border bg-white p-3 text-left ${
                            isSelected ? 'border-[#ff5a3f] ring-2 ring-[#ff5a3f]/20' : 'border-neutral-200'
                          }`}
                        >
                          <div className="mb-2 flex min-h-[150px] items-center justify-center rounded border border-neutral-200 bg-[#f8f8f8]">
                            {isGeneratedDocument(doc) ? (
                              <Sparkles size={18} className="text-[#ff5a3f]" />
                            ) : (
                              <FileText size={18} className="text-blue-500" />
                            )}
                          </div>
                          <p className="line-clamp-1 text-sm font-semibold text-neutral-900">{doc.name}</p>
                          <p className="mt-1 text-xs text-neutral-500">{formatDateLabel(doc.createdAt)}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          </section>

          <aside ref={mobileDetailRef} className="min-w-0 rounded-3xl border border-neutral-300 bg-[#efefef] xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-hidden">
            {selectedDocument ? (
              <>
                <div className="bg-[#ff5a3f] px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="line-clamp-1 text-[1.15rem] font-semibold text-white">{selectedDocument.name}</h2>
                    <button
                      onClick={() => setIsDetailExpanded((prev) => !prev)}
                      className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/40 bg-white/10 text-white hover:bg-white/20"
                      aria-label={isDetailExpanded ? 'Collapse detail' : 'Expand detail'}
                      title={isDetailExpanded ? 'Collapse detail' : 'Expand detail'}
                    >
                      {isDetailExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-4 p-4 xl:h-[calc(100%-72px)] xl:overflow-y-auto">
                  <div className={`${isDetailExpanded ? 'block' : 'hidden'} space-y-4`}>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <p className="text-[11px] font-semibold text-neutral-700">Created</p>
                      <p className="mt-0.5 text-sm text-neutral-800">{formatDateLabel(selectedDocument.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-neutral-700">Author</p>
                      <p className="mt-0.5 text-sm text-neutral-800">{selectedDocument.categoryGroup === 'generated' ? 'Sahara AI' : 'Workspace User'}</p>
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

                  <div>
                    <p className="text-base font-semibold text-neutral-700">Summary Preview</p>
                    <div className="mt-2 rounded-2xl bg-[#dcdcdc] p-4 text-sm text-neutral-700">
                      <p className="line-clamp-4 leading-6">{getDocumentSnippet(selectedDocument)}</p>
                      <a href={selectedDocument.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-[#ff5a3f]">
                        Open full document →
                      </a>
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
                      onClick={() => handleDeleteClick(selectedDocument)}
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
                      onClick={() => setIsDetailExpanded(true)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700"
                    >
                      <ChevronDown size={14} />
                      Expand Detail Dokumen
                    </button>
                  </div>
                  ) : null}

                  <div className="overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#f15a3f_0%,#6b3d35_100%)] p-4 text-white">
                    <p className="text-xl font-bold">Tanya AI</p>
                    <p className="mt-0.5 text-xs text-white/90">Tanya ai untuk dokumen kamu</p>
                    <div className="mt-3 overflow-hidden rounded-xl bg-white">
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
        </div>
      </div>

      {uploadModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-700">
                  <Upload size={12} />
                  Uploaded Panel
                </div>
                <h2 className="mt-4 text-2xl font-semibold font-headline text-neutral-900">
                  Upload file ke workspace
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Gunakan area upload yang sama untuk menambahkan PDF atau DOCX ke panel uploaded.
                </p>
              </div>

              <button
                onClick={() => setUploadModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Tutup modal upload"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
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
              <span className="font-semibold text-neutral-900">
                {documentToDelete?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </>
          }
          confirmLabel="Hapus"
          cancelLabel="Batal"
          loading={isDeleting}
          loadingLabel="Menghapus..."
          icon={Trash2}
        />
      ) : null}
    </div>
  )
}
