import { useEffect, useRef, useState } from 'react'

type CopyState = 'idle' | 'copying' | 'copied' | 'error'

/** Only a resolved Clipboard request may produce a success message. */
export function useCopyEmail(email?: string) {
  const [result, setResult] = useState<{ email?: string; state: CopyState }>({ state: 'idle' })
  const pending = useRef(false), mounted = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const copy = async () => {
    if (!email || pending.current) return
    pending.current = true
    setResult({ email, state: 'copying' })
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(email)
      if (mounted.current) setResult({ email, state: 'copied' })
    } catch {
      if (mounted.current) setResult({ email, state: 'error' })
    } finally { pending.current = false }
  }
  return { state: result.email === email ? result.state : 'idle' as CopyState, copy }
}
