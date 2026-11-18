import { useEffect, useState } from 'react'

const read = (key: string) => { try { return localStorage.getItem(key) } catch { return null } }
const write = (key: string, value: string) => { try { localStorage.setItem(key, value) } catch { /* Private browsing can disable storage. */ } }

export function usePreferences() {
  const [dark, setDark] = useState(() => read('portfolio-theme') !== 'light')
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches || read('portfolio-motion') === 'reduced')
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0B0D0C' : '#EDF2ED')
    write('portfolio-theme', dark ? 'dark' : 'light')
  }, [dark])
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
  }, [reduced])
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches || read('portfolio-motion') === 'reduced')
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return { dark, reduced, changeTheme: () => setDark(v => !v), changeMotion: () => setReduced(v => { write('portfolio-motion', !v ? 'reduced' : 'full'); return !v }) }
}
