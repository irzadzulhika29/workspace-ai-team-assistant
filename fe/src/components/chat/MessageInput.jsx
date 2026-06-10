import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Paperclip, X, Files, Search, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { fileApi } from '@/services/fileService'

export default function MessageInput({ onSend, disabled = false, placeholder = 'Ketik pesan...', allowFile = false, initialValue = '' }) {
  const [value, setValue] = useState(initialValue)
  const [selectedFile, setSelectedFile] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const [docPickerOpen, setDocPickerOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [docsError, setDocsError] = useState(null)
  const [docSearch, setDocSearch] = useState('')
  const [selectedDoc, setSelectedDoc] = useState(null) // { id, name }
  const docPickerRef = useRef(null)
  const docSearchRef = useRef(null)

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue)
    }
  }, [initialValue])

  useEffect(() => {
    if (!docPickerOpen) return
    const handleClickOutside = (e) => {
      if (docPickerRef.current && !docPickerRef.current.contains(e.target)) {
        setDocPickerOpen(false)
        setDocSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [docPickerOpen])

  const handleOpenDocPicker = useCallback(async () => {
    if (docPickerOpen) {
      setDocPickerOpen(false)
      setDocSearch('')
      return
    }
    setDocPickerOpen(true)
    setDocsLoading(true)
    setDocsError(null)
    try {
      const data = await fileApi.fetchDokumen()
      setDocuments(Array.isArray(data) ? data : [])
    } catch (err) {
      setDocsError('Gagal memuat dokumen.')

    } finally {
      setDocsLoading(false)
      setTimeout(() => docSearchRef.current?.focus(), 50)
    }
  }, [docPickerOpen])

  const handleSelectDoc = useCallback((doc) => {
    const docName = doc.nama_file || doc.nama || doc.name || doc.file_name || 'dokumen'
    const mention = `@[${docName}]`
    setValue((prev) => {
      const trimmed = prev.trimEnd()
      return trimmed ? `${trimmed} ${mention} ` : `${mention} `
    })
    setSelectedDoc({ id: doc.id, name: docName })
    setDocPickerOpen(false)
    setDocSearch('')
    textareaRef.current?.focus()
  }, [])

  const filteredDocs = documents.filter((doc) => {
    if (!docSearch.trim()) return true
    const q = docSearch.toLowerCase()
    const name = (doc.nama_file || doc.nama || doc.name || doc.file_name || '').toLowerCase()
    return name.includes(q)
  })

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed && !selectedFile || disabled) return
    onSend(trimmed, selectedFile, selectedDoc || null)
    setValue('')
    setSelectedFile(null)
    setSelectedDoc(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="border-t border-neutral-200 bg-white px-4 py-4 md:px-6">
      {selectedFile && (
        <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 animate-fade-in">
          <Paperclip size={14} className="text-neutral-500" />
          <span className="max-w-[220px] truncate text-xs font-medium text-neutral-700">
            {selectedFile.name}
          </span>
          <button
            type="button"
            onClick={removeFile}
            className="rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-error"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="relative flex-shrink-0" ref={docPickerRef}>
          <button
            type="button"
            onClick={handleOpenDocPicker}
            disabled={disabled}
            title="Pilih dokumen dari workspace"
            className={`
              flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-150
              ${docPickerOpen
                ? 'border-primary-400 bg-primary-50 text-primary-600'
                : 'border-neutral-200 bg-white text-neutral-500'}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-primary-200 hover:bg-primary-50 hover:text-primary-500'}
            `}
          >
            <Files size={18} />
          </button>

          {docPickerOpen && (
            <div className="absolute bottom-14 left-0 z-50 w-72 rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-fade-in overflow-hidden">
              <div className="border-b border-neutral-100 px-3 py-2.5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">Dokumen Workspace</p>
                <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5">
                  <Search size={13} className="flex-shrink-0 text-neutral-400" />
                  <input
                    ref={docSearchRef}
                    type="text"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="Cari dokumen..."
                    className="w-full bg-transparent text-xs text-neutral-700 placeholder:text-neutral-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="custom-scrollbar max-h-60 overflow-y-auto py-1">
                {docsLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-xs text-neutral-400">
                    <Loader2 size={14} className="animate-spin" />
                    Memuat dokumen...
                  </div>
                ) : docsError ? (
                  <div className="px-4 py-6 text-center text-xs text-error">{docsError}</div>
                ) : filteredDocs.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-neutral-400">
                    {docSearch ? 'Dokumen tidak ditemukan.' : 'Belum ada dokumen.'}
                  </div>
                ) : (
                  filteredDocs.map((doc) => {
                    const name = doc.nama_file || doc.nama || doc.name || doc.file_name || 'Dokumen'
                    const type = doc.kategori || doc.tipe || ''
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleSelectDoc(doc)}
                        className="flex w-full items-center gap-2.5 overflow-hidden px-3 py-2 text-left transition-colors hover:bg-primary-50"
                      >
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                          <FileText size={13} />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="truncate text-xs font-medium text-neutral-800" title={name}>{name}</p>
                          {type && (
                            <p className="truncate text-[10px] capitalize text-neutral-400">{type}</p>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {allowFile && (
          <div className="flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={disabled}
            />
            <label
              htmlFor="file-upload"
              className={`
                flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500
                transition-colors duration-150
                ${disabled ? 'cursor-not-allowed opacity-50 hover:bg-white hover:text-neutral-500' : 'hover:border-primary-200 hover:bg-primary-50 hover:text-primary-500'}
              `}
            >
              <Paperclip size={18} />
            </label>
          </div>
        )}

        <div className="flex-1 rounded-[1.25rem] border border-neutral-200 bg-white px-4 py-2 shadow-sm transition-all duration-150 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="custom-scrollbar min-h-[44px] w-full resize-none bg-transparent py-0.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            style={{ maxHeight: '160px' }}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || (!value.trim() && !selectedFile)}
          size="icon"
          className="h-11 w-11 flex-shrink-0 rounded-xl"
          aria-label="Kirim pesan"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  )
}
