import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui'

/**
 * MessageInput — text input + send button for chat with optional file upload
 * @param {Function} props.onSend - called with (text, file)
 * @param {boolean}  props.disabled
 * @param {string}   props.placeholder
 * @param {boolean}  props.allowFile - whether to show file upload button
 * @param {string}   props.initialValue - initial text value
 */
export default function MessageInput({ onSend, disabled = false, placeholder = 'Ketik pesan...', allowFile = false, initialValue = '' }) {
  const [value, setValue] = useState(initialValue)
  const [selectedFile, setSelectedFile] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Update value when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setValue(initialValue)
    }
  }, [initialValue])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed && !selectedFile || disabled) return
    onSend(trimmed, selectedFile)
    setValue('')
    setSelectedFile(null)
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
      {/* File Preview Area */}
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

      {/* Input Area */}
      <div className="flex items-end gap-3">
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
