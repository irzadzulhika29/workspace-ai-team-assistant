import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react'
import { FolderOpen, Loader2, AlertCircle, FileText, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import UploadZone from '../components/files/UploadZone'
import FolderTree from '../components/files/FolderTree'
import FilePreviewModal from '../components/files/FilePreviewModal'
import DocumentChat from '../components/documents/DocumentChat'
import { fileApi } from '../services/api'

const SUPABASE_BASE_URL = import.meta.env.VITE_SUPABASE_URL

const normalizeFileUrl = (rawUrl) => {
  // Handle null, undefined, atau empty string
  if (!rawUrl) return null

  // Clean: hapus quotes, tanda =, dan whitespace
  const cleaned = String(rawUrl)
    .trim()
    .replace(/^["'=]+|["']+$/g, '') // Hapus quotes dan = di awal/akhir
    .trim()

  if (!cleaned) return null

  // Jika sudah valid URL (http/https), return as-is
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    // Ganti localhost dengan Supabase URL jika ada
    if (cleaned.startsWith('http://localhost:8000/')) {
      return `${SUPABASE_BASE_URL}${cleaned.replace('http://localhost:8000', '')}`
    }
    return cleaned
  }

  // Jika path relatif, tambahkan base URL
  if (cleaned.startsWith('/')) {
    return `${SUPABASE_BASE_URL}${cleaned}`
  }

  // Jika format tidak dikenali, log warning dan return null
  console.warn('[normalizeFileUrl] Format URL tidak dikenali:', rawUrl)
  return null
}

export default function FileWorkspace() {
  const navigate = useNavigate()
  const [previewFile, setPreviewFile] = useState(null)
  const [supabaseDocs, setSupabaseDocs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)

  const loadDokumen = useCallback(async () => {
    try {
      setIsLoading(true)
      setFetchError(null)
      const data = await fileApi.fetchDokumen()

      console.log('[FileWorkspace] Raw data from Supabase:', data)

      const documents = []
      let skippedCount = 0

      for (const doc of data) {
        const cleanUrl = normalizeFileUrl(doc.file_url)

        // Skip dokumen dengan URL invalid
        if (!cleanUrl) {
          skippedCount++
          console.warn('[FileWorkspace] Skipping document with invalid URL:', {
            id: doc.id,
            name: doc.nama_file,
            rawUrl: doc.file_url
          })
          continue
        }

        documents.push({
          id: doc.id ?? crypto.randomUUID(),
          name: doc.nama_file ?? 'Untitled',
          type: 'file',
          url: cleanUrl,
          downloadUrl: cleanUrl,
          source: 'supabase',
          createdAt: doc.created_at,
          kategori: doc.kategori || 'uploaded', // uploaded or generated
          documentType: doc.document_type || 'uncategorized',
          metadata: doc.metadata || {},
        })
      }

      console.log('[FileWorkspace] Processed documents:', {
        total: data.length,
        loaded: documents.length,
        skipped: skippedCount,
      })

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

  const handleUploaded = useCallback((result) => {
    console.log('[FileWorkspace] File uploaded successfully:', result)
    // Reload documents from database after upload
    loadDokumen()
  }, [loadDokumen])

  const allDocuments = useMemo(
    () => supabaseDocs,
    [supabaseDocs]
  )

  const folderData = useMemo(() => {
    // First, separate by kategori (uploaded vs generated)
    const uploadedDocs = allDocuments.filter(doc => doc.kategori === 'uploaded')
    const generatedDocs = allDocuments.filter(doc => doc.kategori === 'generated')

    const createFolderStructure = (docs, parentName) => {
      // Group documents by document_type
      const groupedByType = docs.reduce((acc, doc) => {
        const type = doc.documentType || 'uncategorized'
        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(doc)
        return acc
      }, {})

      // Convert grouped data to folder structure
      const folders = Object.entries(groupedByType).map(([type, typeDocs]) => ({
        id: `${parentName}-${type}`,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        type: 'folder',
        defaultOpen: true,
        children: typeDocs,
      }))

      // Sort folders: uncategorized last, others alphabetically
      folders.sort((a, b) => {
        if (a.name === 'Uncategorized') return 1
        if (b.name === 'Uncategorized') return -1
        return a.name.localeCompare(b.name)
      })

      return folders
    }

    const result = []

    // Add Uploaded folder with subfolders by document_type
    if (uploadedDocs.length > 0) {
      result.push({
        id: 'uploaded',
        name: '📤 Uploaded Documents',
        type: 'folder',
        defaultOpen: true,
        children: createFolderStructure(uploadedDocs, 'uploaded'),
      })
    }

    // Add Generated folder with subfolders by document_type
    if (generatedDocs.length > 0) {
      result.push({
        id: 'generated',
        name: '🤖 Generated Documents',
        type: 'folder',
        defaultOpen: true,
        children: createFolderStructure(generatedDocs, 'generated'),
      })
    }

    return result
  }, [allDocuments])

  const handleCreateDocument = useCallback(() => {
    navigate('/chat/supervisor', {
      state: {
        autoSendMessage: 'Buatkan dokumen / laporan progres untuk project saya. Tolong tanyakan detail yang diperlukan terlebih dahulu.',
        preFillOnly: true, // Only pre-fill the input, don't auto-send
      }
    })
  }, [navigate])

  return (
    <>
      <div className="flex h-screen">
        {/* Left panel — folder tree */}
        <div className="w-64 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FolderOpen size={15} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-800">Documents</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Loading documents…</span>
              </div>
            ) : (
              <FolderTree 
                folders={folderData} 
                onFileClick={(file) => setSelectedDocument(file)} 
              />
            )}
            {fetchError && (
              <div className="mx-3 mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                <AlertCircle size={13} className="flex-shrink-0" />
                <span>Failed to load from database</span>
              </div>
            )}
          </div>
        </div>

        {/* Right panel — main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedDocument ? (
            // Document detail view
            <div className="flex-1 flex overflow-hidden">
              {/* Document preview/metadata */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50">
                <div className="max-w-4xl mx-auto">
                  {/* Document header */}
                  <div className="mb-6">
                    <button
                      onClick={() => setSelectedDocument(null)}
                      className="text-sm text-blue-600 hover:text-blue-700 mb-4"
                    >
                      ← Back to documents
                    </button>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                          {selectedDocument.name}
                        </h2>
                        {selectedDocument.kategori === 'generated' && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700 mb-2">
                            <span className="font-medium">🤖 Generated Document</span>
                            <span className="text-amber-600">• Chat not available</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <a
                          href={selectedDocument.downloadUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Document preview */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <iframe
                      src={selectedDocument.url}
                      className="w-full h-[700px]"
                      title="Document preview"
                    />
                  </div>

                  {/* Metadata */}
                  {selectedDocument.createdAt && (
                    <div className="mt-4 text-sm text-slate-500">
                      Uploaded: {new Date(selectedDocument.createdAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Document chat/RAG panel - only for uploaded documents */}
              {selectedDocument.kategori === 'uploaded' && (
                <div className="w-96 border-l border-gray-200 bg-white">
                  <DocumentChat document={selectedDocument} />
                </div>
              )}
            </div>
          ) : (
            // Upload area and file list
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
              {/* Header */}
              <div className="px-6 py-6 bg-white border-b border-gray-200">
                <h1 className="text-lg font-semibold text-slate-800">
                  Documents Workspace
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Upload and manage your documents for AI knowledge base
                </p>
              </div>

              {/* Upload zone */}
              <div className="p-6">
                <UploadZone onUploaded={handleUploaded} targetFolder="uploaded" />
              </div>

              {/* Document list */}
              {allDocuments.length > 0 && (
                <div className="px-6 pb-6">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <h3 className="text-sm font-semibold text-slate-700">
                        All Documents ({allDocuments.length})
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {allDocuments.map((file) => (
                        <button
                          key={file.id}
                          onClick={() => setSelectedDocument(file)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <FileText size={16} className="text-slate-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-slate-700 truncate block">
                              {file.name}
                            </span>
                            {file.kategori === 'generated' && (
                              <span className="text-xs text-amber-600 mt-0.5 block">
                                🤖 Generated
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-blue-600 font-medium flex-shrink-0">
                            View →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Magic Button */}
      <button
        onClick={handleCreateDocument}
        className="
          fixed bottom-8 right-8 z-50
          flex items-center gap-2.5 px-5 py-3.5
          bg-gradient-to-r from-purple-600 to-blue-600
          hover:from-purple-700 hover:to-blue-700
          text-white font-medium text-sm
          rounded-full shadow-lg hover:shadow-xl
          transition-all duration-200
          active:scale-95
          group
        "
        title="Buat dokumen dengan AI"
      >
        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
        <span>Buat Dokumen</span>
      </button>

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </>
  )
}
