import { useEffect, useReducer, useRef } from 'react'
import { validateContact } from '../services/contactService'
import type { ContactErrors, ContactPayload, ContactSubmitter } from '../services/contactService'

type Phase = 'editing' | 'sending' | 'error' | 'sent'
type FormState = { values: ContactPayload; errors: ContactErrors; phase: Phase; error?: string }
type Action = { type: 'change'; field: keyof ContactPayload; value: string } | { type: 'blur'; field: keyof ContactPayload } | { type: 'invalid'; errors: ContactErrors } | { type: 'sending' | 'sent' | 'reset' } | { type: 'failed'; error: string }
const initial: FormState = { values: { name: '', email: '', message: '' }, errors: {}, phase: 'editing' }
function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'change': {
      const values = { ...state.values, [action.field]: action.value }
      return { ...state, values, phase: state.phase === 'error' ? 'editing' : state.phase, error: undefined, errors: { ...state.errors, [action.field]: state.errors[action.field] ? validateContact(values)[action.field] : undefined } }
    }
    case 'blur': return { ...state, errors: { ...state.errors, [action.field]: validateContact(state.values)[action.field] } }
    case 'invalid': return { ...state, errors: action.errors, phase: 'error', error: 'Veuillez corriger les champs indiqués.' }
    case 'sending': return { ...state, phase: 'sending', error: undefined, errors: {} }
    case 'sent': return { ...state, phase: 'sent', error: undefined }
    case 'failed': return { ...state, phase: 'error', error: action.error }
    case 'reset': return initial
  }
}

export function useContactForm(submitter: ContactSubmitter, onConfirmed: () => void) {
  const [state, dispatch] = useReducer(reducer, initial)
  const request = useRef<AbortController | null>(null)
  const mounted = useRef(false)
  const website = useRef('')
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; request.current?.abort(); request.current = null } }, [])
  const send = async () => {
    if (request.current || state.phase === 'sent') return
    const errors = validateContact(state.values)
    if (Object.keys(errors).length) { dispatch({ type: 'invalid', errors }); return }
    const controller = new AbortController()
    request.current = controller
    dispatch({ type: 'sending' })
    try {
      const result = await submitter(state.values, { signal: controller.signal, website: website.current })
      if (!mounted.current || request.current !== controller) return
      if (result.success) { dispatch({ type: 'sent' }); onConfirmed() }
      else dispatch({ type: 'failed', error: result.error })
    } catch {
      if (mounted.current && request.current === controller) dispatch({ type: 'failed', error: 'L’envoi n’a pas pu être confirmé. Votre texte est conservé ; vous pouvez réessayer.' })
    } finally { if (request.current === controller) request.current = null }
  }
  return { state, setWebsite: (value: string) => { website.current = value }, send, change: (field: keyof ContactPayload, value: string) => dispatch({ type: 'change', field, value }), blur: (field: keyof ContactPayload) => dispatch({ type: 'blur', field }), reset: () => { website.current = ''; dispatch({ type: 'reset' }) } }
}
export type ContactFormModel = ReturnType<typeof useContactForm>
