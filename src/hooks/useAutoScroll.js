import { useEffect, useRef } from 'react'

export function useAutoScroll(dependencies) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, dependencies)

  return bottomRef
}
