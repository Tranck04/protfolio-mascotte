import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import { contactMailto } from '../../config/contact'
import type { ContactConfig } from '../../config/contact'

export function ContactLinks({ config }: { config: ContactConfig }) {
  const links = [
    { name: 'GitHub', url: config.github, icon: Github, external: true },
    { name: 'LinkedIn', url: config.linkedin, icon: Linkedin, external: true },
    { name: 'Email', url: contactMailto(config), icon: Mail, external: false },
  ]
  return <ul className="contact-links" aria-label="Moyens de contact">{links.map(({ name, url, icon: Icon, external }) => <li key={name}>
    {url ? <a href={url} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} aria-label={`${name}${external ? ' — nouvel onglet' : ''}`}><Icon size={16} strokeWidth={1.5} aria-hidden="true" /><span>{name}</span><ArrowUpRight size={14} aria-hidden="true" /></a> : <span className="contact-link-unavailable"><Icon size={16} strokeWidth={1.5} aria-hidden="true" /><span>{name}</span><small>À renseigner</small></span>}
  </li>)}</ul>
}
