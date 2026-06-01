import React, { useEffect, useState, useMemo } from 'react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { ConfirmationModal } from '@/components/ui'
import DocumentSection from '@/components/files/DocumentSection'
import FileWorkspaceHeader from '@/components/files/FileWorkspaceHeader'
import SelectedDocumentPanel from '@/components/files/SelectedDocumentPanel'
import UploadZone from '@/components/files/UploadZone'
import { useFileWorkspace } from '@/hooks/useFileWorkspace'

const PAGE_SIZE = 4;

export default function FileWorkspace() {
  const {
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
    setIsDetailExpanded,
  } = useFileWorkspace()

  const [page, setPage] = useState(1);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(visibleDocuments.length / PAGE_SIZE)), [visibleDocuments.length]);
  const safePage = Math.min(page, totalPages);
  const shouldPaginate = activeTab === 'all' || activeTab === 'generated';
  const paginatedDocuments = useMemo(
    () => visibleDocuments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [visibleDocuments, safePage],
  );
  const displayedDocuments = shouldPaginate ? paginatedDocuments : visibleDocuments;

  useEffect(() => {
    setPage(1)
  }, [activeTab, searchQuery])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  return (
    <div className="h-full overflow-y-auto">
      <div>
        <FileWorkspaceHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onOpenGenerated={handleCreateDocument}
          onOpenUploaded={() => {
            setActiveTab('uploaded')
            setUploadModalOpen(true)
          }}
        />

        <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_470px]">
          <section className="min-w-0 rounded-3xl bg-white">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-4xl font-semibold text-neutral-700">Dokumen Terbaru</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[#ff6a52] px-3 text-[#ff6a52]"
                >
                  <Upload size={14} />
                </button>
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-semibold ${
                      activeTab === 'all' ? 'bg-[#ff5a3f] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('uploaded')}
                    className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-semibold ${
                      activeTab === 'uploaded' ? 'bg-[#ff5a3f] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Uploaded
                  </button>
                  <button
                    onClick={() => setActiveTab('generated')}
                    className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-semibold ${
                      activeTab === 'generated' ? 'bg-[#ff5a3f] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Generated
                  </button>
                </div>
              </div>
            </div>

            {fetchError ? (
              <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-error">
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
              ) : filteredDocuments.length === 0 ? (
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
                    <DocumentSection
                      documents={recentDocuments}
                      selectedDocument={selectedDocument}
                      onSelectDocument={handleSelectDocument}
                      showBadge
                      variant="recent"
                    />
                  </div>

                  <div>
                    <DocumentSection
                      title={
                        activeTab === 'generated'
                          ? 'Dokumen Generated'
                          : activeTab === 'uploaded'
                            ? 'Dokumen Terupload'
                            : 'Semua Dokumen'
                      }
                      documents={displayedDocuments}
                      selectedDocument={selectedDocument}
                      onSelectDocument={handleSelectDocument}
                      variant={activeTab === 'generated' ? 'single-row' : 'grid'}
                    />
                    {shouldPaginate && totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={safePage <= 1}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium text-slate-600">
                          {safePage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={safePage >= totalPages}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          <SelectedDocumentPanel
            selectedDocument={selectedDocument}
            mobileDetailRef={mobileDetailRef}
            isDetailExpanded={isDetailExpanded}
            onToggleDetail={() => setIsDetailExpanded((prev) => !prev)}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </div>

      {uploadModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
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
