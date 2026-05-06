import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ConfirmationModal — Modal konfirmasi yang reusable dengan berbagai variant
 * 
 * @param {boolean} open - Status modal terbuka/tertutup
 * @param {function} onClose - Callback saat modal ditutup
 * @param {function} onConfirm - Callback saat tombol konfirmasi diklik
 * @param {string} variant - Variant modal: 'danger', 'warning', 'info', 'success'
 * @param {string} title - Judul modal
 * @param {string|ReactNode} description - Deskripsi/konten modal
 * @param {string} confirmLabel - Label tombol konfirmasi (default: "Konfirmasi")
 * @param {string} cancelLabel - Label tombol batal (default: "Batal")
 * @param {boolean} loading - Status loading saat proses konfirmasi
 * @param {string} loadingLabel - Label saat loading (default: "Memproses...")
 * @param {ReactNode} icon - Custom icon (opsional, akan override icon default)
 * @param {boolean} showCloseButton - Tampilkan tombol close di pojok kanan atas (default: true)
 * @param {string} size - Ukuran modal: 'sm', 'md', 'lg' (default: 'md')
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
