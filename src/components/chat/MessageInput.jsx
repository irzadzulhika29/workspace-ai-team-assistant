import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

/**
 * MessageInput — text input + send button for chat
 * @param {Function} props.onSend - called with trimmed message string
 * @param {boolean}  props.disabled
 * @param {string}   props.placeholder
 */
export default function MessageInput({ onSend, disabled = false, placeholder = 'Ketik pesan...' }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="
      flex items-end gap-3 px-4 py-3
      bg-white border-t border-gray-100
    ">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className="
          flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50
          px-4 py-2.5 text-sm text-slate-800
          placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150 font-sans
          custom-scrollbar
        "
        style={{ minHeight: '44px' }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="
          w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0
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
  )
}
