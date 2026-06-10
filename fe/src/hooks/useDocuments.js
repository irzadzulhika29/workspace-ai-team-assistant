import { useState, useEffect, useCallback } from 'react';
import { fileApi } from '@/services/api';
import { normalizeFileUrl, groupDocumentsByDate } from '@/utils/documentUtils';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [groupedDocuments, setGroupedDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fileApi.fetchDocuments();
      
      const normalizedDocs = data.map(doc => ({
        ...doc,
        file_url: normalizeFileUrl(doc.file_url)
      }));
      
      setDocuments(normalizedDocs);
      setFilteredDocuments(normalizedDocs);
      setGroupedDocuments(groupDocumentsByDate(normalizedDocs));
    } catch (err) {

      setError(err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const newDoc = await fileApi.uploadDocument(formData);
    
    const normalizedDoc = {
      ...newDoc,
      file_url: normalizeFileUrl(newDoc.file_url)
    };
    
    const updatedDocs = [normalizedDoc, ...documents];
    setDocuments(updatedDocs);
    setFilteredDocuments(updatedDocs);
    setGroupedDocuments(groupDocumentsByDate(updatedDocs));
    
    return normalizedDoc;
  }, [documents]);

  const deleteDocument = useCallback(async (documentId) => {
    await fileApi.deleteDocument(documentId);
    
    const updatedDocs = documents.filter(doc => doc.id !== documentId);
    setDocuments(updatedDocs);
    setFilteredDocuments(updatedDocs);
    setGroupedDocuments(groupDocumentsByDate(updatedDocs));
    
    if (selectedDocument?.id === documentId) {
      setSelectedDocument(null);
      setShowDetailPanel(false);
      setShowChatPanel(false);
    }
  }, [documents, selectedDocument]);

  const searchDocuments = useCallback((query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredDocuments(documents);
      setGroupedDocuments(groupDocumentsByDate(documents));
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = documents.filter(doc => 
      doc.file_name?.toLowerCase().includes(lowerQuery) ||
      doc.description?.toLowerCase().includes(lowerQuery)
    );
    
    setFilteredDocuments(filtered);
    setGroupedDocuments(groupDocumentsByDate(filtered));
  }, [documents]);

  const selectDocument = useCallback((doc) => {
    setSelectedDocument(doc);
    setShowDetailPanel(true);
    setShowChatPanel(false);
  }, []);

  const openDocumentChat = useCallback((doc) => {
    setSelectedDocument(doc);
    setShowChatPanel(true);
    setShowDetailPanel(false);
  }, []);

  const closeDetailPanel = useCallback(() => {
    setShowDetailPanel(false);
    setSelectedDocument(null);
  }, []);

  const closeChatPanel = useCallback(() => {
    setShowChatPanel(false);
    setSelectedDocument(null);
  }, []);

  const openUploadModal = useCallback(() => {
    setShowUploadModal(true);
  }, []);

  const closeUploadModal = useCallback(() => {
    setShowUploadModal(false);
  }, []);

  const openDeleteModal = useCallback((doc) => {
    setDocumentToDelete(doc);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!documentToDelete) return;
    
    await deleteDocument(documentToDelete.id);
    closeDeleteModal();
  }, [documentToDelete, deleteDocument, closeDeleteModal]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    filteredDocuments,
    groupedDocuments,
    loading,
    error,
    searchQuery,
    selectedDocument,
    showUploadModal,
    showDeleteModal,
    documentToDelete,
    showDetailPanel,
    showChatPanel,
    
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    searchDocuments,
    selectDocument,
    openDocumentChat,
    closeDetailPanel,
    closeChatPanel,
    openUploadModal,
    closeUploadModal,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete
  };
}
