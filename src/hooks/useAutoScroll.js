import { useEffect, useRef } from 'react'

export function useAutoScroll(dependencies = []) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return bottomRef
}
