import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react'
import { fileApi } from '../../services/fileService'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

const MAX_SIZE = 20 * 1024 * 1024

export default function UploadZone({ onUploaded, targetFolder = 'input' }) {
  const [uploads, setUploads] = useState([])

  const onDrop = useCallback((acceptedFiles) => {
    const newEntries = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      status: 'pending',
      error: null,
    }))

    setUploads((current) => [...current, ...newEntries])
  }, [])

  const updateName = (id, name) => {
    setUploads((current) => current.map((entry) => (
      entry.id === id ? { ...entry, name } : entry
    )))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const pendingUploads = uploads.filter((upload) => upload.status === 'pending')
    if (pendingUploads.length === 0) return

    for (const entry of pendingUploads) {
      const docName = entry.name.trim()

      if (!docName) {
        setUploads((current) => current.map((item) => (
          item.id === entry.id
            ? { ...item, status: 'error', error: 'Nama dokumen wajib diisi' }
            : item
        )))
        continue
      }

      setUploads((current) => current.map((item) => (
        item.id === entry.id ? { ...item, status: 'uploading', error: null } : item
      )))

      try {
        const result = await fileApi.uploadDocument(entry.file, targetFolder, docName)
        setUploads((current) => current.map((item) => (
          item.id === entry.id ? { ...item, status: 'done', name: docName } : item
        )))
        onUploaded?.(result)
      } catch (err) {
        const message = err?.response?.data?.message ?? err?.message ?? 'Upload gagal'
        setUploads((current) => current.map((item) => (
          item.id === entry.id ? { ...item, status: 'error', error: message } : item
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

  const hasPending = uploads.some((upload) => upload.status === 'pending')

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div
        {...getRootProps()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition-colors duration-150 ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 bg-white hover:border-primary-300 hover:bg-primary-50/40'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud
          size={32}
          className={`transition-colors ${isDragActive ? 'text-primary-500' : 'text-neutral-400'}`}
        />
        <div className="text-center">
          <p className="text-sm font-semibold text-neutral-700">
            {isDragActive ? 'Lepaskan file di sini' : 'Seret & lepas file ke sini'}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            PDF atau DOCX · Maks. 20 MB per file
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-primary-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
          onClick={open}
        >
          Pilih File
        </button>
      </div>

      {uploads.length > 0 ? (
        <div className="space-y-2">
          {uploads.map((upload) => (
            <div key={upload.id} className="space-y-2 rounded-xl border border-neutral-200 bg-white px-3 py-3">
              <div className="flex items-center gap-2.5 text-sm">
                <FileText size={14} className="flex-shrink-0 text-neutral-400" />
                <span className="flex-1 truncate text-neutral-700">{upload.file.name}</span>
                {upload.status === 'uploading' ? <Loader2 size={14} className="flex-shrink-0 animate-spin text-primary-500" /> : null}
                {upload.status === 'done' ? <CheckCircle size={14} className="flex-shrink-0 text-emerald-500" /> : null}
              </div>

              <input
                type="text"
                value={upload.name}
                onChange={(e) => updateName(upload.id, e.target.value)}
                placeholder="Masukkan nama dokumen"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-100"
                disabled={upload.status === 'uploading' || upload.status === 'done'}
              />

              {upload.status === 'error' ? (
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <XCircle size={13} /> {upload.error}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {fileRejections.length > 0 ? (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              <XCircle size={13} />
              <span className="font-medium">{file.name}</span>
              <span className="text-red-400">- {errors[0]?.message}</span>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="submit"
        className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasPending}
      >
        Submit Upload
      </button>
    </form>
  )
}
