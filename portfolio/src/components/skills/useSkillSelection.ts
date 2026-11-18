import { useCallback, useState } from 'react'
import type { SkillDomain } from '../../data/skills'

export function useSkillSelection(domains: readonly SkillDomain[]) {
  const [selectedId, setSelectedId] = useState(domains.find(domain => domain.id === 'frontend')?.id ?? domains[0]?.id)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const selected = domains.find(domain => domain.id === selectedId) ?? domains[0]
  const displayed = domains.find(domain => domain.id === previewId) ?? selected
  const preview = (id: string) => { if (domains.some(domain => domain.id === id)) setPreviewId(id) }
  const select = (id: string) => { if (domains.some(domain => domain.id === id)) { setSelectedId(id); setPreviewId(null) } }
  const restore = useCallback(() => setPreviewId(null), [])
  return { selected, displayed, preview, select, restore }
}
