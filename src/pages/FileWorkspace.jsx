import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Sparkles,
  Upload,
} from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Modal,
  ModalBody,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useNavigate } from 'react-router-dom'
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
      accent: 'info',
      iconWrap: 'bg-info-bg text-info',
      sideLine: 'bg-primary-500',
      metaTone: 'text-info',
      label: 'AI',
    }
  }

  return {
    accent: 'success',
    iconWrap: 'bg-success-bg text-success',
    sideLine: 'bg-success',
    metaTone: 'text-success',
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

  const selectedTone = getDocumentTone(selectedDocument || { kategori: 'generated' })

  return (
    <div className="relative h-full overflow-hidden px-5 py-6 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,_rgba(196,231,255,0.55),_transparent_58%)]" />

      <div className="relative mx-auto flex h-full max-w-7xl gap-6 overflow-hidden">
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-600">
                Documents Workspace
              </p>
              <h1 className="mt-2 text-3xl font-bold font-headline tracking-tight text-neutral-900 md:text-4xl">
                Documents
              </h1>
              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Kelola dokumen generated dan uploaded dalam satu workspace untuk download dan tanya isi dokumen dengan AI.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Card className="rounded-2xl border-neutral-200 bg-white/85 shadow-sm hover:shadow-sm">
                <CardContent className="px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Total File</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">{allDocuments.length} dokumen</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
              <TabsList className="w-fit rounded-2xl border border-neutral-200 bg-white/85 p-1 shadow-sm">
                <TabsTrigger value="generated" className="rounded-xl border-b-0 -mb-0 px-4 py-2.5">
                  Generated ({generatedDocuments.length})
                </TabsTrigger>
                <TabsTrigger value="uploaded" className="rounded-xl border-b-0 -mb-0 px-4 py-2.5">
                  Uploaded ({uploadedDocuments.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleCreateDocument}
                variant="primary"
                className="gap-2 rounded-xl"
              >
                <Sparkles size={16} />
                Buat Dokumen
              </Button>

              {activeTab === 'uploaded' ? (
                <Button
                  onClick={() => setUploadModalOpen(true)}
                  variant="outline"
                  className="gap-2 rounded-xl"
                >
                  <Upload size={16} className="text-primary-500" />
                  Upload File
                </Button>
              ) : null}
            </div>
          </div>

          {fetchError ? (
            <Alert variant="warning" title="Gagal memuat dokumen" className="mb-5">
              Gagal memuat dokumen dari database: {fetchError}
            </Alert>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="skeleton h-56 rounded-[1.4rem]" />
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <Card className="flex min-h-[320px] items-center justify-center border-neutral-200/80 p-8 text-center hover:shadow-sm">
                <EmptyState
                  icon={<FileText size={24} />}
                  title="Belum ada dokumen"
                  description="Upload file terlebih dahulu atau generate dokumen baru dari Supervisor agar workspace ini terisi."
                />
              </Card>
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
                        isSelected ? 'border-primary-300 ring-2 ring-primary-100' : 'border-neutral-200'
                      }`}
                    >
                      {isSelected ? <div className={`absolute inset-y-0 left-0 w-1 ${tone.sideLine}`} /> : null}

                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone.iconWrap}`}>
                          {doc.kategori === 'generated' ? <Sparkles size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                            {badgeLabel}
                          </Badge>
                          <Badge variant={tone.accent} className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                            {tone.label}
                          </Badge>
                        </div>
                      </div>

                      <h3 className="line-clamp-2 text-xl font-semibold font-headline leading-tight text-neutral-900 transition-colors group-hover:text-primary-600">
                        {doc.name}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-xs leading-6 text-neutral-500">
                        {getDocumentSnippet(doc)}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
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
          <Card className="sticky top-0 flex h-[calc(100vh-8rem)] w-full flex-col overflow-hidden border-neutral-200/80 hover:shadow-sm">
            {selectedDocument ? (
              <>
                <CardHeader className="border-b border-neutral-200 bg-white/75 px-6 py-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                      {getDocumentBadge(selectedDocument)}
                    </Badge>
                    <Badge variant={selectedTone.accent} className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                      {selectedDocument.kategori === 'generated' ? 'Generated' : 'Uploaded'}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-semibold font-headline leading-tight text-neutral-900">
                    {selectedDocument.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Created</p>
                      <p className="mt-1 font-medium text-neutral-900">{formatDateLabel(selectedDocument.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Author</p>
                      <p className="mt-1 flex items-center gap-2 font-medium text-neutral-900">
                        {selectedDocument.kategori === 'generated' ? <Bot size={14} className="text-primary-500" /> : <Upload size={14} className="text-success" />}
                        {selectedDocument.kategori === 'generated' ? 'Sahara AI' : 'Workspace User'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Category</p>
                      <p className="mt-1 font-medium text-neutral-900">{selectedDocument.kategori}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Source</p>
                      <p className="mt-1 font-medium text-neutral-900">{selectedDocument.source}</p>
                    </div>
                  </div>

                  <div className="my-6 border-t border-neutral-200" />

                  <div className="mt-6 flex gap-3">
                    <Button asChild variant="primary" className="flex-1 rounded-xl">
                      <a
                        href={selectedDocument.downloadUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download size={15} />
                        Download
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 rounded-xl">
                      <a
                        href={selectedDocument.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye size={15} />
                        Lihat File
                      </a>
                    </Button>
                  </div>

                  {selectedDocument.kategori === 'generated' ? (
                    <Card className="mt-6 rounded-2xl border-info/30 bg-info-bg shadow-none hover:shadow-none">
                      <CardContent className="p-4">
                      <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-info">
                        <Sparkles size={15} />
                        Ask Supervisor
                      </p>
                      <p className="text-xs leading-6 text-info">
                        Dokumen generated belum memakai panel chat dokumen. Gunakan Supervisor untuk revisi, tindak lanjut, atau permintaan dokumen lanjutan.
                      </p>
                      <Button
                        onClick={handleCreateDocument}
                        variant="link"
                        size="sm"
                        className="mt-3 h-auto px-0 text-xs font-semibold text-primary-600"
                      >
                        Buka Supervisor
                        <ArrowRight size={13} />
                      </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                      <DocumentChat document={selectedDocument} />
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <EmptyState
                  icon={<FolderOpen size={24} />}
                  title="Pilih dokumen"
                  description="Panel kanan akan menampilkan metadata, preview, dan chat dokumen ketika Anda memilih salah satu file."
                />
              </div>
            )}
          </Card>
        </aside>
      </div>

      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload file ke workspace"
        description="Gunakan area upload yang sama untuk menambahkan PDF atau DOCX ke panel uploaded."
        size="lg"
        className="rounded-[1.75rem] border border-neutral-200 shadow-xl"
      >
        <ModalBody>
          <div className="mb-5">
            <Badge variant="info" className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]">
              <Upload size={12} />
              Uploaded Panel
            </Badge>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50/70 p-4">
            <UploadZone onUploaded={handleUploaded} targetFolder="uploaded" />
          </div>
        </ModalBody>
      </Modal>
    </div>
  )
}
