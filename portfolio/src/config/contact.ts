export type ContactConfig = { ownerName: string; email?: string; github?: string; linkedin?: string; x?: string; instagram?: string; facebook?: string; endpoint?: string }
/** Public coordinates supplied by the owner during Sprint 05. */
const publicDetails = {
  email: 'tfmukendi@gmail.com', github: 'https://github.com/Tranck04',
  linkedin: 'https://www.linkedin.com/in/tracy-franck-mukendi-8bb90242a',
  x: 'https://x.com/tranck04', instagram: 'https://www.instagram.com/tranck_?rpxt=OWpvMW85aXp6d3ln',
  facebook: 'https://www.facebook.com/share/1ax6MijgYa/',
}
const emailPattern = /^[^\s@<>]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i
export const validContactEmail = (value: string) => value.length <= 254 && emailPattern.test(value)

function social(value: string | undefined, host: string): string | undefined {
  if (!value) return
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' && [host, `www.${host}`].includes(url.hostname) && url.pathname !== '/' && !url.username && !url.password) return url.href
  } catch { /* Missing or invalid public coordinates stay unavailable. */ }
}
export function contactEndpoint(value?: string): string | undefined {
  const input = value?.trim()
  if (!input || /[\s\\]/.test(input)) return
  if (input.startsWith('/') && !input.startsWith('//')) return input
  try { const url = new URL(input); if (url.protocol === 'https:' && !url.username && !url.password) return url.href } catch { /* Invalid endpoints cannot receive a form. */ }
}
export function createContactConfig(env: Record<string, string | undefined>): ContactConfig {
  const email = (env.VITE_CONTACT_EMAIL ?? publicDetails.email).trim()
  return {
    ownerName: 'Tracy Franck Mukendi',
    email: email && validContactEmail(email) ? email : undefined,
    github: social((env.VITE_CONTACT_GITHUB ?? publicDetails.github).trim(), 'github.com'),
    linkedin: social((env.VITE_CONTACT_LINKEDIN ?? publicDetails.linkedin).trim(), 'linkedin.com'),
    x: social((env.VITE_CONTACT_X ?? publicDetails.x).trim(), 'x.com'),
    instagram: social((env.VITE_CONTACT_INSTAGRAM ?? publicDetails.instagram).trim(), 'instagram.com'),
    facebook: social((env.VITE_CONTACT_FACEBOOK ?? publicDetails.facebook).trim(), 'facebook.com'),
    endpoint: contactEndpoint(env.VITE_CONTACT_ENDPOINT),
  }
}
/** Public configuration only. Never put an email provider secret in a VITE_ variable. */
export const contactConfig = createContactConfig(import.meta.env)
export function contactMailto(config: ContactConfig): string | undefined {
  return config.email && validContactEmail(config.email) ? `mailto:${encodeURIComponent(config.email).replace('%40', '@')}?subject=${encodeURIComponent('Un échange depuis le portfolio')}` : undefined
}
