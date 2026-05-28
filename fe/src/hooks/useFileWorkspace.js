import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fileApi } from '@/services/api'
import { normalizeDocumentRecord } from '@/utils/fileWorkspace'

export function useFileWorkspace() {
  const navigate = useNavigate()
  const mobileDetailRef = useRef(null)
  const [supabaseDocs, setSupabaseDocs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [activeTab, setActiveTab] = useState('generated')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDetailExpanded, setIsDetailExpanded] = useState(true)
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      setFetchError(null)
      const data = await fileApi.fetchDokumen()
      const documents = data.map(normalizeDocumentRecord).filter(Boolean)
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
    loadDocuments()
  }, [loadDocuments])

  const filteredDocuments = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase()
    if (!query) return supabaseDocs

    return supabaseDocs.filter((doc) => {
      const haystack = [
        doc.name,
        doc.kategori,
        doc.documentType,
        doc.metadata?.summary,
        doc.metadata?.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [deferredSearchQuery, supabaseDocs])

  const generatedDocuments = useMemo(
    () => filteredDocuments.filter((doc) => doc.categoryGroup === 'generated'),
    [filteredDocuments],
  )

  const uploadedDocuments = useMemo(
    () => filteredDocuments.filter((doc) => doc.categoryGroup !== 'generated'),
    [filteredDocuments],
  )

  const recentDocuments = useMemo(
    () => filteredDocuments.slice(0, 4),
    [filteredDocuments],
  )

  const visibleDocuments = activeTab === 'generated' ? generatedDocuments : uploadedDocuments

  useEffect(() => {
    if (filteredDocuments.length === 0) {
      setSelectedDocument(null)
      return
    }

    setSelectedDocument((current) => {
      if (!current) return null
      if (filteredDocuments.some((doc) => doc.id === current.id)) {
        return filteredDocuments.find((doc) => doc.id === current.id) || current
      }
      return null
    })
  }, [filteredDocuments])

  useEffect(() => {
    if (activeTab === 'generated' && generatedDocuments.length === 0 && uploadedDocuments.length > 0) {
      setActiveTab('uploaded')
    }

    if (activeTab === 'uploaded' && uploadedDocuments.length === 0 && generatedDocuments.length > 0) {
      setActiveTab('generated')
    }
  }, [activeTab, generatedDocuments.length, uploadedDocuments.length])

  const handleCreateDocument = useCallback(() => {
    setActiveTab('generated')
    navigate('/chat/supervisor', {
      state: {
        autoSendMessage:
          'Buatkan dokumen / laporan progres untuk project saya. Tolong tanyakan detail yang diperlukan terlebih dahulu.',
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

  const handleUploaded = useCallback(() => {
    setUploadModalOpen(false)
    loadDocuments()
  }, [loadDocuments])

  const handleDeleteClick = useCallback((document) => {
    setDocumentToDelete(document)
    setDeleteModalOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!documentToDelete) return

    try {
      setIsDeleting(true)
      await fileApi.deleteDokumen(documentToDelete.id)
      setDeleteModalOpen(false)
      setDocumentToDelete(null)
      await loadDocuments()

      if (selectedDocument?.id === documentToDelete.id) {
        setSelectedDocument(null)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Gagal menghapus dokumen: ' + error.message)
    } finally {
      setIsDeleting(false)
    }
  }, [documentToDelete, loadDocuments, selectedDocument])

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false)
    setDocumentToDelete(null)
  }, [])

  return {
    mobileDetailRef,
    selectedDocument,
    activeTab,
    searchQuery,
    uploadModalOpen,
    deleteModalOpen,
    documentToDelete,
    isDeleting,
    isDetailExpanded,
    isLoading,
    fetchError,
    filteredDocuments,
    recentDocuments,
    visibleDocuments,
    handleCreateDocument,
    handleSelectDocument,
    handleUploaded,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    setSearchQuery,
    setActiveTab,
    setUploadModalOpen,
    setDeleteModalOpen,
    setIsDetailExpanded,
  }
}
