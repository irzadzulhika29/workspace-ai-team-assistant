import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react'
import { fileApi } from '../../services/fileService'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}
const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

/**
 * UploadZone — drag-and-drop file upload area
 * @param {Function} props.onUploaded - called with file metadata after upload
 * @param {string}   props.targetFolder - "input" | "output"
 */
export default function UploadZone({ onUploaded, targetFolder = 'input' }) {
  const [uploads, setUploads] = useState([]) // [{ id, file, name, status, error }]

  const onDrop = useCallback(async (acceptedFiles) => {
    const newEntries = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      status: 'pending',
      error: null,
    }))
    setUploads((u) => [...u, ...newEntries])
  }, [])

  const updateName = (id, name) => {
    setUploads((u) => u.map((e) => (e.id === id ? { ...e, name } : e)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const pendingUploads = uploads.filter((u) => u.status === 'pending')
    if (pendingUploads.length === 0) return

    for (const entry of pendingUploads) {
      const docName = entry.name.trim()
      if (!docName) {
        setUploads((u) => u.map((item) => (
          item.id === entry.id ? { ...item, status: 'error', error: 'Nama dokumen wajib diisi' } : item
        )))
        continue
      }

      setUploads((u) => u.map((item) => (
        item.id === entry.id ? { ...item, status: 'uploading', error: null } : item
      )))

      try {
        const result = await fileApi.uploadDocument(entry.file, targetFolder, docName)
        setUploads((u) => u.map((item) => (
          item.id === entry.id ? { ...item, status: 'done', name: docName } : item
        )))
        onUploaded?.(result)
      } catch (err) {
        const msg = err?.response?.data?.message ?? err?.message ?? 'Upload gagal'
        setUploads((u) => u.map((item) => (
          item.id === entry.id ? { ...item, status: 'error', error: msg } : item
        )))
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive, fileRejections, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: true,
    noClick: true,
  })

  const hasPending = uploads.some((u) => u.status === 'pending')

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {/* Drop area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg
          flex flex-col items-center justify-center gap-3
          py-10 px-6 cursor-pointer
          transition-colors duration-150
          ${isDragActive
            ? 'border-brand-500 bg-brand-50'
            : 'border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/40'
          }
        `}
      >
        <input {...getInputProps()} />
        <UploadCloud
          size={32}
          className={`transition-colors ${isDragActive ? 'text-brand-500' : 'text-slate-400'}`}
        />
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">
            {isDragActive ? 'Lepaskan file di sini' : 'Seret & lepas file ke sini'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            PDF atau DOCX · Maks. 20 MB per file
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-1.5 rounded-md text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          onClick={open}
        >
          Pilih File
        </button>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-1.5">
          {uploads.map((u) => (
            <div key={u.id} className="bg-white border border-gray-200 rounded-md px-3 py-2.5 space-y-2">
              <div className="flex items-center gap-2.5 text-sm">
                <FileText size={14} className="text-slate-400 flex-shrink-0" />
                <span className="flex-1 truncate text-slate-700">{u.file.name}</span>
                {u.status === 'uploading' && <Loader2 size={14} className="text-brand-500 animate-spin flex-shrink-0" />}
                {u.status === 'done'     && <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />}
              </div>

              <input
                type="text"
                value={u.name}
                onChange={(e) => updateName(u.id, e.target.value)}
                placeholder="Masukkan nama dokumen"
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 disabled:bg-gray-100"
                disabled={u.status === 'uploading' || u.status === 'done'}
              />

              {u.status === 'error' && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle size={13} /> {u.error}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejections */}
      {fileRejections.length > 0 && (
        <div className="space-y-1.5">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <XCircle size={13} />
              <span className="font-medium">{file.name}</span>
              <span className="text-red-400">— {errors[0]?.message}</span>
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        className="px-4 py-2 rounded-md text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={!hasPending}
      >
        Submit Upload
      </button>
    </form>
  )
}
