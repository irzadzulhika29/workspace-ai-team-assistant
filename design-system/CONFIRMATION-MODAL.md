# ConfirmationModal Component

Komponen modal konfirmasi yang reusable dengan berbagai variant untuk berbagai use case.

## Features

- ✅ 4 variant: `danger`, `warning`, `info`, `success`
- ✅ Loading state dengan spinner
- ✅ Custom icon support
- ✅ Backdrop click to close (disabled saat loading)
- ✅ Keyboard accessible (ESC to close)
- ✅ 3 ukuran: `sm`, `md`, `lg`
- ✅ Optional close button di pojok kanan atas
- ✅ Rich description dengan JSX support
- ✅ Animasi smooth (fade-in + zoom-in)

## Design Tokens

- **Border radius**: 1.75rem (28px) — sesuai design system
- **Shadow**: `0_24px_80px_rgba(15,23,42,0.18)` — elevation tinggi
- **Backdrop**: `slate-950/40` dengan `backdrop-blur-sm`
- **Icon container**: `rounded-2xl` (16px)
- **Button**: `rounded-xl` (12px)

## Usage

### Basic Usage

```jsx
import { ConfirmationModal } from '@/components/ui'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Delete Item
      </button>

      <ConfirmationModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        variant="danger"
        title="Hapus Item"
        description="Apakah Anda yakin ingin menghapus item ini?"
        confirmLabel="Hapus"
        cancelLabel="Batal"
      />
    </>
  )
}
```

### Danger Variant (Delete Confirmation)

```jsx
<ConfirmationModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  variant="danger"
  title="Hapus Dokumen"
  description="Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan."
  confirmLabel="Hapus"
  cancelLabel="Batal"
  loading={isDeleting}
  loadingLabel="Menghapus..."
/>
```

### Warning Variant (Unsaved Changes)

```jsx
<ConfirmationModal
  open={showWarning}
  onClose={() => setShowWarning(false)}
  onConfirm={handleDiscard}
  variant="warning"
  title="Perubahan Belum Disimpan"
  description="Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?"
  confirmLabel="Keluar Tanpa Menyimpan"
  cancelLabel="Kembali"
/>
```

### Info Variant (General Confirmation)

```jsx
<ConfirmationModal
  open={showInfo}
  onClose={() => setShowInfo(false)}
  onConfirm={handleProceed}
  variant="info"
  title="Konfirmasi Tindakan"
  description="Apakah Anda yakin ingin melanjutkan?"
  confirmLabel="Lanjutkan"
/>
```

### Success Variant (Completion Confirmation)

```jsx
<ConfirmationModal
  open={showSuccess}
  onClose={() => setShowSuccess(false)}
  onConfirm={handleComplete}
  variant="success"
  title="Selesaikan Tugas"
  description="Tandai tugas ini sebagai selesai?"
  confirmLabel="Selesai"
/>
```

### With Loading State

```jsx
const [isLoading, setIsLoading] = useState(false)

const handleConfirm = async () => {
  setIsLoading(true)
  try {
    await deleteDocument()
    setIsOpen(false)
  } catch (error) {
    console.error(error)
  } finally {
    setIsLoading(false)
  }
}

<ConfirmationModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  variant="danger"
  title="Hapus Dokumen"
  description="Apakah Anda yakin?"
  loading={isLoading}
  loadingLabel="Menghapus..."
/>
```

### With Custom Icon

```jsx
import { Trash2 } from 'lucide-react'

<ConfirmationModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  variant="danger"
  title="Hapus Dokumen"
  description="Apakah Anda yakin?"
  icon={<Trash2 />}
/>
```

### With Rich Description (JSX)

```jsx
<ConfirmationModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  variant="danger"
  title="Hapus Dokumen"
  description={
    <>
      Apakah Anda yakin ingin menghapus dokumen{' '}
      <span className="font-semibold text-slateui-900">
        {documentName}
      </span>
      ? Tindakan ini tidak dapat dibatalkan.
    </>
  }
/>
```

### Different Sizes

```jsx
// Small
<ConfirmationModal size="sm" {...props} />

// Medium (default)
<ConfirmationModal size="md" {...props} />

// Large
<ConfirmationModal size="lg" {...props} />
```

### Without Close Button

```jsx
<ConfirmationModal
  showCloseButton={false}
  {...props}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Status modal terbuka/tertutup |
| `onClose` | `function` | - | Callback saat modal ditutup |
| `onConfirm` | `function` | - | Callback saat tombol konfirmasi diklik |
| `variant` | `'danger' \| 'warning' \| 'info' \| 'success'` | `'danger'` | Variant modal |
| `title` | `string` | - | Judul modal |
| `description` | `string \| ReactNode` | - | Deskripsi/konten modal |
| `confirmLabel` | `string` | `'Konfirmasi'` | Label tombol konfirmasi |
| `cancelLabel` | `string` | `'Batal'` | Label tombol batal |
| `loading` | `boolean` | `false` | Status loading saat proses konfirmasi |
| `loadingLabel` | `string` | `'Memproses...'` | Label saat loading |
| `icon` | `ReactNode` | - | Custom icon (opsional) |
| `showCloseButton` | `boolean` | `true` | Tampilkan tombol close di pojok kanan atas |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Ukuran modal |
| `className` | `string` | - | Custom className untuk modal container |

## Variants

| Variant | Icon | Color | Use Case |
|---------|------|-------|----------|
| `danger` | AlertCircle | Red | Delete, destructive actions |
| `warning` | AlertTriangle | Amber | Unsaved changes, caution |
| `info` | Info | Blue | General confirmation |
| `success` | CheckCircle2 | Green | Completion, positive actions |

## Sizes

| Size | Max Width |
|------|-----------|
| `sm` | 384px |
| `md` | 448px (default) |
| `lg` | 512px |

## Accessibility

- ✅ Semantic HTML dengan `role="dialog"` dan `aria-modal="true"`
- ✅ `aria-labelledby` dan `aria-describedby` untuk screen readers
- ✅ Focus trap (modal tidak bisa di-tab keluar)
- ✅ ESC key untuk close (disabled saat loading)
- ✅ Backdrop click untuk close (disabled saat loading)
- ✅ Disabled state yang jelas (opacity 50%)

## Examples

Lihat file `design-system/examples/ConfirmationModalExamples.jsx` untuk contoh lengkap semua variant dan konfigurasi.

## Migration Guide

### Before (Custom Modal)

```jsx
{deleteModalOpen ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <Trash2 size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Hapus Dokumen</h2>
          <p className="mt-2 text-sm">Apakah Anda yakin?</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={handleCancel}>Batal</button>
        <button onClick={handleConfirm}>Hapus</button>
      </div>
    </div>
  </div>
) : null}
```

### After (ConfirmationModal)

```jsx
<ConfirmationModal
  open={deleteModalOpen}
  onClose={handleCancel}
  onConfirm={handleConfirm}
  variant="danger"
  title="Hapus Dokumen"
  description="Apakah Anda yakin?"
  confirmLabel="Hapus"
  cancelLabel="Batal"
  icon={<Trash2 />}
/>
```

## Best Practices

1. **Gunakan variant yang sesuai**
   - `danger` untuk aksi destructive (delete, remove)
   - `warning` untuk peringatan (unsaved changes)
   - `info` untuk konfirmasi umum
   - `success` untuk aksi positif (complete, approve)

2. **Berikan deskripsi yang jelas**
   - Jelaskan konsekuensi dari aksi
   - Sebutkan item yang akan terpengaruh
   - Berikan informasi apakah aksi bisa di-undo

3. **Gunakan loading state untuk operasi async**
   - Set `loading={true}` saat proses berjalan
   - Berikan `loadingLabel` yang deskriptif
   - Disable backdrop click dan ESC key saat loading

4. **Label tombol yang jelas**
   - Gunakan action verb (Hapus, Keluar, Lanjutkan)
   - Hindari label generik (OK, Yes)
   - Sesuaikan dengan konteks aksi

## Related Components

- `Modal` — Modal umum untuk konten custom
- `Alert` — Notifikasi inline untuk feedback
- `Button` — Tombol dengan berbagai variant

## File Location

- Component: `src/components/ui/confirmation-modal.jsx`
- Design System: `design-system/confirmation-modal.jsx`
- Examples: `design-system/examples/ConfirmationModalExamples.jsx`
- Documentation: `design-system/DESIGN-SYSTEM.md`
