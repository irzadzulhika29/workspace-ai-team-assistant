import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, X } from 'lucide-react'

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
    <div className="
      flex flex-col gap-2 px-4 py-3
      bg-white/75 backdrop-blur-md border-t ghost-divider
    ">
      {/* File Preview Area */}
      {selectedFile && (
        <div className="flex items-center gap-2 p-2 w-fit bg-surface-sunken rounded-lg animate-fade-in">
          <Paperclip size={14} className="text-slate-500" />
          <span className="text-xs font-medium text-slate-700 max-w-[200px] truncate">
            {selectedFile.name}
          </span>
          <button
            onClick={removeFile}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-500 hover:text-red-500 transition-colors"
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
                w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer
                 text-slateui-500 hover:bg-surface-sunken hover:text-brand-600
                transition-colors duration-150
                ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-slate-500' : ''}
              `}
            >
              <Paperclip size={20} />
            </label>
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="
            flex-1 resize-none rounded-xl border border-transparent bg-surface-raised
            px-4 py-2.5 text-sm text-slateui-900 shadow-[inset_0_0_0_1px_rgba(191,200,207,0.35)]
            placeholder:text-slate-400
            focus:outline-none focus:ring-0 focus:shadow-[inset_0_-2px_0_0_#006184]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-150 font-sans
            custom-scrollbar
          "
          style={{ minHeight: '44px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || (!value.trim() && !selectedFile)}
          className="
            w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0
            bg-brand-600 text-white
            hover:bg-brand-700
            disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
            transition-all duration-150
          "
          aria-label="Kirim pesan"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
