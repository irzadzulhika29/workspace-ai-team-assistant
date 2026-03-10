import { useEffect } from 'react'
import { useChatStore } from '../../store/chatStore'
import { statusApi } from '../../services/api'

const POLL_INTERVAL = 30_000 // 30 seconds as per spec

export default function ConnectionStatus() {
  const { isConnected, setConnected } = useChatStore()

  useEffect(() => {
    const check = async () => {
      const ok = await statusApi.checkStatus()
      setConnected(ok)
    }
    check()
    const id = setInterval(check, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [setConnected])

  if (isConnected === null) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 text-slate-500 text-xs font-medium">
        <span className="w-2 h-2 bg-slate-600 rounded-full" />
        Checking…
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md
      ${isConnected ? 'text-emerald-400' : 'text-red-400'}
    `}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
        isConnected
          ? 'bg-emerald-500 animate-pulse'
          : 'bg-red-500'
      }`} />
      n8n {isConnected ? 'Online' : 'Offline'}
    </div>
  )
}
