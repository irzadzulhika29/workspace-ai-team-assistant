import React, { useState } from 'react'
import { ConfirmationModal } from '@/components/ui'
import { Trash2 } from 'lucide-react'

/**
 * ConfirmationModalExamples — Contoh penggunaan ConfirmationModal
 * 
 * File ini mendemonstrasikan berbagai cara menggunakan ConfirmationModal
 * dengan berbagai variant, size, dan konfigurasi.
 */
export default function ConfirmationModalExamples() {
  const [dangerOpen, setDangerOpen] = useState(false)
  const [warningOpen, setWarningOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [loadingOpen, setLoadingOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)

  const handleDangerConfirm = () => {
    console.log('Danger action confirmed')
    setDangerOpen(false)
  }

  const handleWarningConfirm = () => {
    console.log('Warning action confirmed')
    setWarningOpen(false)
  }

  const handleInfoConfirm = () => {
    console.log('Info action confirmed')
    setInfoOpen(false)
  }

  const handleSuccessConfirm = () => {
    console.log('Success action confirmed')
    setSuccessOpen(false)
  }

  const handleLoadingConfirm = () => {
    setIsLoading(true)
    // Simulate async operation
    setTimeout(() => {
      setIsLoading(false)
      setLoadingOpen(false)
      console.log('Async operation completed')
    }, 2000)
  }

  const handleCustomConfirm = () => {
    console.log('Custom action confirmed')
    setCustomOpen(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-neutral-900">
          ConfirmationModal Examples
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Danger Variant */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">
              Danger Variant
            </h2>
            <p className="mb-4 text-sm text-neutral-600">
              Untuk aksi destructive seperti delete, remove, atau cancel yang tidak bisa di-undo.
            </p>
            <button
              onClick={() => setDangerOpen(true)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Open Danger Modal
            </button>
          </div>

          {/* Warning Variant */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">
              Warning Variant
            </h2>
            <p className="mb-4 text-sm text-neutral-600">
              Untuk peringatan seperti unsaved changes atau aksi yang perlu perhatian ekstra.
            </p>
            <button
              onClick={() => setWarningOpen(true)}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Open Warning Modal
            </button>
          </div>

          {/* Info Variant */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">
              Info Variant
            </h2>
            <p className="mb-4 text-sm text-neutral-600">
              Untuk konfirmasi umum atau informasi yang memerlukan acknowledgment.
            </p>
            <button
              onClick={() => setInfoOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Open Info Modal
            </button>
          </div>

          {/* Success Variant */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">
              Success Variant
            </h2>
            <p className="mb-4 text-sm text-neutral-600">
              Untuk konfirmasi aksi positif seperti complete task atau approve.
            </p>
            <button
              onClick={() => setSuccessOpen(true)}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Open Success Modal
            </button>
          </div>

          {/* Loading State */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">
              Loading State
            </h2>
            <p className="mb-4 text-sm text-neutral-600">
              Modal dengan loading state untuk operasi async.
            </p>
            <button
              onClick={() => setLoadingOpen(true)}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Open Loading Modal
            </button>
          </div>

          {/* Custom Icon */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">
              Custom Icon & Size
            </h2>
            <p className="mb-4 text-sm text-neutral-600">
              Modal dengan custom icon dan ukuran large.
            </p>
            <button
              onClick={() => setCustomOpen(true)}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
            >
              Open Custom Modal
            </button>
          </div>
        </div>

        {/* Modals */}
        <ConfirmationModal
          open={dangerOpen}
          onClose={() => setDangerOpen(false)}
          onConfirm={handleDangerConfirm}
          variant="danger"
          title="Hapus Dokumen"
          description="Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan."
          confirmLabel="Hapus"
          cancelLabel="Batal"
        />

        <ConfirmationModal
          open={warningOpen}
          onClose={() => setWarningOpen(false)}
          onConfirm={handleWarningConfirm}
          variant="warning"
          title="Perubahan Belum Disimpan"
          description="Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar tanpa menyimpan?"
          confirmLabel="Keluar Tanpa Menyimpan"
          cancelLabel="Kembali"
        />

        <ConfirmationModal
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          onConfirm={handleInfoConfirm}
          variant="info"
          title="Konfirmasi Tindakan"
          description="Apakah Anda yakin ingin melanjutkan dengan tindakan ini?"
          confirmLabel="Lanjutkan"
          cancelLabel="Batal"
        />

        <ConfirmationModal
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          onConfirm={handleSuccessConfirm}
          variant="success"
          title="Selesaikan Tugas"
          description="Tandai tugas ini sebagai selesai? Tugas yang sudah selesai akan dipindahkan ke arsip."
          confirmLabel="Selesai"
          cancelLabel="Batal"
        />

        <ConfirmationModal
          open={loadingOpen}
          onClose={() => setLoadingOpen(false)}
          onConfirm={handleLoadingConfirm}
          variant="danger"
          title="Proses Data"
          description="Memproses data akan memakan waktu beberapa detik. Apakah Anda ingin melanjutkan?"
          confirmLabel="Proses"
          cancelLabel="Batal"
          loading={isLoading}
          loadingLabel="Memproses..."
        />

        <ConfirmationModal
          open={customOpen}
          onClose={() => setCustomOpen(false)}
          onConfirm={handleCustomConfirm}
          variant="danger"
          title="Custom Icon & Large Size"
          description={
            <>
              Modal ini menggunakan custom icon (Trash2) dan ukuran large.
              <br />
              <br />
              Anda juga bisa menggunakan JSX untuk description yang lebih kompleks,
              seperti menambahkan{' '}
              <span className="font-semibold text-neutral-900">
                text formatting
              </span>
              , list, atau elemen lainnya.
            </>
          }
          confirmLabel="Konfirmasi"
          cancelLabel="Batal"
          icon={<Trash2 />}
          size="lg"
          showCloseButton={false}
        />
      </div>
    </div>
  )
}
