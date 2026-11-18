import { ArrowUpRight, Github, Linkedin } from 'lucide-react'
import type { ContactConfig } from '../../config/contact'

export function ContactLinks({ config }: { config: ContactConfig }) {
  const links = [{ name: 'GitHub', url: config.github, icon: Github }, { name: 'LinkedIn', url: config.linkedin, icon: Linkedin }]
  return <ul className="contact-links" aria-label="Réseaux sociaux" data-contact-enter="">{links.filter(link => link.url).map(({ name, url, icon: Icon }) => <li key={name}>
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} — nouvel onglet`}><Icon size={16} strokeWidth={1.5} aria-hidden="true" /><span>{name}</span><ArrowUpRight size={13} aria-hidden="true" /></a>
  </li>)}</ul>
}
