import { Facebook, Github, Instagram, Linkedin } from 'lucide-react'
import type { RefObject, SVGProps } from 'react'
import portrait from '../assets/portrait.jpg'
import { contactConfig } from '../config/contact'

function XIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
}

const socials = [
  { id: 'linkedin', label: 'LinkedIn', render: () => <Linkedin aria-hidden="true" /> },
  { id: 'github', label: 'GitHub', render: () => <Github aria-hidden="true" /> },
  { id: 'x', label: 'X', render: () => <XIcon aria-hidden="true" /> },
  { id: 'instagram', label: 'Instagram', render: () => <Instagram aria-hidden="true" /> },
  { id: 'facebook', label: 'Facebook', render: () => <Facebook aria-hidden="true" /> },
] as const

export function Portrait({ frameRef, announce }: { frameRef: RefObject<HTMLDivElement | null>; announce: (text: string) => void }) {
  return <div className="portrait-wrap">
    <div className="portrait-frame" ref={frameRef}>
      <div className="portrait-art">
        <img className="portrait-photo" src={portrait} alt="Portrait de Tracy Franck Mukendi, software engineer" loading="eager" decoding="async" />
      </div>
      <div className="portrait-bottom">
        <ul className="portrait-socials" aria-label="Réseaux sociaux">
          {socials.map(({ id, label, render }) => <li key={id}>
            { contactConfig[id] ? <a className="portrait-social" href={contactConfig[id]} target="_blank" rel="noopener noreferrer" aria-label={`${label} — nouvel onglet`} title={label}>{render()}</a> : <button type="button" className="portrait-social" aria-label={`${label} — lien à venir`} title={label} onClick={() => announce(`Le lien ${label} sera ajouté prochainement.`)}>{render()}</button>}
          </li>)}
        </ul>
      </div>
    </div>
  </div>
}
