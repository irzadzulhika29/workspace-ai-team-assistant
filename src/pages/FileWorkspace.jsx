import { useState, useEffect, useMemo, useCallback } from 'react'
import { FolderOpen, Loader2, AlertCircle } from 'lucide-react'
import UploadZone from '../components/files/UploadZone'
import FolderTree from '../components/files/FolderTree'
import FilePreviewModal from '../components/files/FilePreviewModal'
import { fileApi } from '../services/api'

const SUPABASE_BASE_URL = import.meta.env.VITE_SUPABASE_URL

const normalizeFileUrl = (rawUrl) => {
  const cleaned = String(rawUrl ?? '').replace(/^"|"$/g, '')
  if (!cleaned) return null

  if (cleaned.startsWith('http://localhost:8000/')) {
    return `${SUPABASE_BASE_URL}${cleaned.replace('http://localhost:8000', '')}`
  }

  if (cleaned.startsWith('/')) {
    return `${SUPABASE_BASE_URL}${cleaned}`
  }

  return cleaned
}

const TABS = [
  { key: 'input', label: 'Input (SOP)' },
  { key: 'output', label: 'Output (AI Reports)' },
]

export default function FileWorkspace() {
  const [activeTab, setActiveTab] = useState('input')
  const [previewFile, setPreviewFile] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState({ input: [], output: [] })
  const [supabaseDocs, setSupabaseDocs] = useState({ input: [], output: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    const loadDokumen = async () => {
      try {
        setIsLoading(true)
        setFetchError(null)
        const data = await fileApi.fetchDokumen()

        const grouped = { input: [], output: [] }
        for (const doc of data) {
          const folder = doc.kategori === 'output' ? 'output' : 'input'
          const cleanUrl = normalizeFileUrl(doc.file_url)
          grouped[folder].push({
            id: doc.id ?? crypto.randomUUID(),
            name: doc.nama_file ?? 'Untitled',
            type: 'file',
            url: cleanUrl,
            downloadUrl: cleanUrl,
            source: 'supabase',
          })
        }
        setSupabaseDocs(grouped)
      } catch (err) {
        console.error('Gagal memuat dokumen dari Supabase:', err)
        setFetchError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDokumen()
  }, [])

  const handleUploaded = useCallback((result) => {
    const file = {
      id: crypto.randomUUID(),
      name: result?.filename ?? 'Dokumen baru',
      type: 'file',
      url: result?.url ?? null,
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], file],
    }))
  }, [activeTab])

  const folderData = useMemo(
    () => [
      {
        id: 'input',
        name: 'Input (SOP)',
        type: 'folder',
        defaultOpen: activeTab === 'input',
        children: [...supabaseDocs.input, ...uploadedFiles.input],
      },
      {
        id: 'output',
        name: 'Output (AI Reports)',
        type: 'folder',
        defaultOpen: activeTab === 'output',
        children: [...supabaseDocs.output, ...uploadedFiles.output],
      },
    ],
    [activeTab, supabaseDocs, uploadedFiles],
  )

  return (
    <>
      <div className="flex h-screen">
        {/* Left panel — folder tree */}
        <div className="w-64 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FolderOpen size={15} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-800">Dokumen</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Memuat dokumen…</span>
              </div>
            ) : (
              <FolderTree folders={folderData} onFileClick={setPreviewFile} />
            )}
            {fetchError && (
              <div className="mx-3 mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                <AlertCircle size={13} className="flex-shrink-0" />
                <span>Gagal memuat dari Supabase</span>
              </div>
            )}
          </div>
        </div>

        {/* Right panel — upload */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
            <h1 className="text-sm font-semibold text-slate-800">
              Document Workspace
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload SOP dan dokumen referensi untuk Knowledge Agent
            </p>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 px-6 pt-4 border-b border-gray-100 bg-white flex-shrink-0">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-t-md transition-colors duration-150
                  border-b-2 -mb-px
                  ${
                    activeTab === key
                      ? "border-brand-500 text-brand-600 bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Upload area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <UploadZone onUploaded={handleUploaded} targetFolder={activeTab} />

            {/* Files in active folder */}
            {uploadedFiles[activeTab].length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  File Ter-upload ({uploadedFiles[activeTab].length})
                </p>
                <div className="space-y-2">
                  {uploadedFiles[activeTab].map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setPreviewFile(file)}
                      className="
                        w-full flex items-center gap-3 px-4 py-3
                        bg-white border border-gray-200 rounded-lg
                        hover:border-brand-300 hover:shadow-sm
                        transition-all duration-150 text-left
                      "
                    >
                      <span className="text-sm text-slate-700 truncate">
                        {file.name}
                      </span>
                      <span className="ml-auto text-xs text-brand-600 font-medium flex-shrink-0">
                        Preview →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </>
  )
}
