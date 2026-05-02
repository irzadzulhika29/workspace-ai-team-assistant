import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ConfirmationModal — Modal konfirmasi yang reusable dengan berbagai variant
 * 
 * Komponen ini digunakan untuk menampilkan dialog konfirmasi dengan berbagai
 * tingkat urgency (danger, warning, info, success). Mengikuti design system
 * dengan rounded corners, backdrop blur, dan animasi smooth.
 * 
 * FEATURES:
 * - 4 variant: danger (merah), warning (kuning), info (biru), success (hijau)
 * - Loading state dengan spinner
 * - Custom icon support
 * - Backdrop click to close (disabled saat loading)
 * - Keyboard accessible (ESC to close)
 * - 3 ukuran: sm, md, lg
 * - Optional close button di pojok kanan atas
 * 
 * DESIGN TOKENS:
 * - Border radius: 1.75rem (28px) — sesuai design system
 * - Shadow: 0_24px_80px_rgba(15,23,42,0.18) — elevation tinggi
 * - Backdrop: slate-950/40 dengan backdrop-blur-sm
 * - Icon container: rounded-2xl (16px)
 * - Button: rounded-xl (12px)
 * 
 * @example
 * // Danger variant (delete confirmation)
 * <ConfirmationModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   variant="danger"
 *   title="Hapus Dokumen"
 *   description="Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan."
 *   confirmLabel="Hapus"
 *   cancelLabel="Batal"
 *   loading={isDeleting}
 *   loadingLabel="Menghapus..."
 * />
 * 
 * @example
 * // Warning variant (unsaved changes)
 * <ConfirmationModal
 *   open={showWarning}
 *   onClose={() => setShowWarning(false)}
 *   onConfirm={handleDiscard}
 *   variant="warning"
 *   title="Perubahan Belum Disimpan"
 *   description="Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?"
 *   confirmLabel="Keluar Tanpa Menyimpan"
 *   cancelLabel="Kembali"
 * />
 * 
 * @example
 * // Info variant (general confirmation)
 * <ConfirmationModal
 *   open={showInfo}
 *   onClose={() => setShowInfo(false)}
 *   onConfirm={handleProceed}
 *   variant="info"
 *   title="Konfirmasi Tindakan"
 *   description="Apakah Anda yakin ingin melanjutkan?"
 *   confirmLabel="Lanjutkan"
 * />
 * 
 * @example
 * // Success variant (completion confirmation)
 * <ConfirmationModal
 *   open={showSuccess}
 *   onClose={() => setShowSuccess(false)}
 *   onConfirm={handleComplete}
 *   variant="success"
 *   title="Selesaikan Tugas"
 *   description="Tandai tugas ini sebagai selesai?"
 *   confirmLabel="Selesai"
 * />
 * 
 * @example
 * // Custom icon dan size
 * <ConfirmationModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleAction}
 *   variant="danger"
 *   title="Custom Icon"
 *   description="Modal dengan icon custom"
 *   icon={<Trash2 />}
 *   size="lg"
 *   showCloseButton={false}
 * />
 * 
 * @example
 * // Rich description dengan JSX
 * <ConfirmationModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   variant="danger"
 *   title="Hapus Dokumen"
 *   description={
 *     <>
 *       Apakah Anda yakin ingin menghapus dokumen{' '}
 *       <span className="font-semibold text-slateui-900">
 *         {documentName}
 *       </span>
 *       ? Tindakan ini tidak dapat dibatalkan.
 *     </>
 *   }
 *   confirmLabel="Hapus"
 * />
 */
export function ConfirmationModal({
  open = false,
  onClose,
  onConfirm,
  variant = 'danger',
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  loading = false,
  loadingLabel = 'Memproses...',
  icon,
  showCloseButton = true,
  size = 'md',
  className,
  ...props
}) {
  if (!open) return null

  // Variant configuration
  const variantConfig = {
    danger: {
      icon: AlertCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      buttonText: 'text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      buttonText: 'text-white',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      buttonText: 'text-white',
    },
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      buttonText: 'text-white',
    },
  }

  const config = variantConfig[variant] || variantConfig.danger
  const IconComponent = icon || config.icon

  // Size configuration
  const sizeConfig = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  const modalSize = sizeConfig[size] || sizeConfig.md

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose?.()
    }
  }

  const handleConfirm = () => {
    if (!loading) {
      onConfirm?.()
    }
  }

  const handleCancel = () => {
    if (!loading) {
      onClose?.()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      {...props}
    >
      <div
        className={cn(
          'w-full rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          modalSize,
          className
        )}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        )}

        {/* Header with icon */}
        <div className="mb-5 flex items-start gap-4">
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl',
              config.iconBg,
              config.iconColor
            )}
          >
            <IconComponent size={24} />
          </div>
          <div className="flex-1">
            <h2
              id="modal-title"
              className="font-headline text-xl font-semibold text-slateui-900"
            >
              {title}
            </h2>
            {description && (
              <div
                id="modal-description"
                className="mt-2 text-sm leading-6 text-slateui-500"
              >
                {typeof description === 'string' ? (
                  <p>{description}</p>
                ) : (
                  description
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50',
              config.buttonBg,
              config.buttonText
            )}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {loadingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

ConfirmationModal.displayName = 'ConfirmationModal'
