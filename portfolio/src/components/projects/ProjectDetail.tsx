import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Project, ProjectMedia } from '../../data/projects'
import { ProjectHeroGallery } from './ProjectHeroGallery'

const labels: Record<string, string> = { github: 'Dépôt GitHub', demo: 'Démonstration', website: 'Site web' }
const present = (value?: string) => !!value?.trim()
const items = (values?: string[]) => values?.filter(present) ?? []

/** Preserve the supplied prose and its paragraph boundaries, without rewriting it. */
function Prose({ text }: { text: string }) {
  return <div className="study-prose">{text.split(/\n\s*\n/).filter(present).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
}
function Section({ id, number, label, title, className = '', children }: { id: string; number: string; label: string; title: string; className?: string; children: ReactNode }) {
  return <section className={`study-section ${className}`} aria-labelledby={id}><div className="study-section-heading"><span className="study-kicker">{number} — {label}</span><h3 id={id}>{title}</h3></div>{children}</section>
}
function Media({ media }: { media: ProjectMedia }) {
  return <figure className="study-media"><img src={media.src} alt={media.alt} loading="lazy" decoding="async" />{present(media.caption) && <figcaption>{media.caption}</figcaption>}</figure>
}
function NumberedList({ values, className = '' }: { values: string[]; className?: string }) {
  return <ol className={`study-numbered ${className}`}>{values.map((value, index) => <li key={index}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p>{value}</p></li>)}</ol>
}

export function ProjectDetail({ project, reduced = false }: { project: Project; reduced?: boolean }) {
  const publicLinks = Object.entries(project.links ?? {}).filter(([type, href]) =>
    !!href && /^https:\/\//.test(href) && (type !== 'github' || project.githubPublic === true),
  )
  const hasPrivateGithub = !!project.links?.github && project.githubPublic !== true
  const hasFacts = [project.category, project.status, project.team, project.featuredContent?.role].some(present)
  const features = items(project.features), technologies = [...new Set(items(project.technologies))]
  const challenges = items(project.challenges), nextSteps = items(project.nextSteps), results = items(project.results)
  const prefix = `study-${project.id}`
  const diagram = project.architectureDiagram?.src.trim() ? project.architectureDiagram : undefined
  // Only supplied media: never reuse the gallery's typographic placeholder here.
  const cover = project.cover?.trim() || project.thumbnail?.trim()
  const suppliedMedia: ProjectMedia[] = [
    ...(cover ? [{ src: cover, alt: `Aperçu de ${project.title}` }] : []),
    ...items(project.captures).map((src, index) => ({ src, alt: `Capture ${index + 1} de ${project.title}` })),
  ]
  const seen = new Set<string>(diagram ? [diagram.src] : [])
  const media = suppliedMedia.filter(entry => {
    if (!present(entry.src) || seen.has(entry.src)) return false
    seen.add(entry.src); return true
  })

  return <article className="project-study" aria-labelledby="project-detail-title">
    <header className="study-intro">
      <ProjectHeroGallery title={project.title} signature={project.signature} gallery={project.gallery} reduced={reduced} />
      {present(project.summary) && project.summary !== project.signature && <p className="study-summary">{project.summary}</p>}
      {hasFacts && <dl className="study-facts">
        {present(project.category) && <div><dt>Catégorie</dt><dd>{project.category}</dd></div>}
        {present(project.status) && <div><dt>Statut</dt><dd>{project.status}</dd></div>}
        {present(project.team) && <div><dt>Équipe</dt><dd>{project.team}</dd></div>}
        {present(project.featuredContent?.role) && <div className="study-role"><dt>Mon rôle</dt><dd>{project.featuredContent?.role}</dd></div>}
      </dl>}
      {(publicLinks.length > 0 || hasPrivateGithub) && <div className="study-links">
        {publicLinks.map(([type, href]) => <a key={type} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${labels[type] ?? type} — nouvel onglet`}>{labels[type] ?? type}<ArrowUpRight size={16} aria-hidden="true" /></a>)}
        {hasPrivateGithub && <p>Dépôt GitHub non accessible publiquement pour le moment.</p>}
      </div>}
      {present(project.description) && <div className="study-overview"><Prose text={project.description!} /></div>}
    </header>

    {(present(project.problem) || present(project.solution)) && <Section id={`${prefix}-approach`} number="02" label="PROBLÈME & SOLUTION" title="Du besoin à la réponse.">
      <div className="study-columns">
        {present(project.problem) && <div><h4>{project.problemTitle ?? "Le problème"}</h4><Prose text={project.problem!} /></div>}
        {present(project.solution) && <div><h4>{project.solutionTitle ?? "La solution proposée"}</h4><Prose text={project.solution!} /></div>}
      </div>
    </Section>}

    {features.length > 0 && <Section id={`${prefix}-built`} number="03" label={project.featuresSectionLabel ?? "RÉALISATIONS & FONCTIONNALITÉS"} title={project.featuresSectionTitle ?? "Ce qui a été construit."}><NumberedList values={features} /></Section>}

    {(present(project.architecture) || technologies.length > 0 || diagram) && <Section id={`${prefix}-architecture`} number="04" label="ARCHITECTURE TECHNIQUE" title="Les choix qui structurent le projet." className="study-architecture">
      <div className="study-architecture-body">{present(project.architecture) && <Prose text={project.architecture!} />}
        {technologies.length > 0 && <div className="study-stack"><h4>Technologies principales</h4><ul>{technologies.map(tech => <li key={tech}>{tech}</li>)}</ul></div>}
      </div>
      {diagram && <Media media={diagram} />}
    </Section>}

    {present(project.contribution) && <Section id={`${prefix}-contribution`} number="05" label="MA CONTRIBUTION" title="Ce que j’apporte au projet." className="study-contribution"><Prose text={project.contribution!} /></Section>}

    {challenges.length > 0 && <Section id={`${prefix}-decisions`} number="06" label="DÉFIS & DÉCISIONS" title="Concevoir, décider, ajuster."><NumberedList values={challenges} className="study-decisions" /></Section>}

    {(present(project.achievements) || results.length > 0 || nextSteps.length > 0) && <Section id={`${prefix}-progress`} number="07" label={project.finalSectionLabel ?? "ÉTAT ACTUEL & PERSPECTIVES"} title={project.finalSectionTitle ?? "Aujourd’hui, et la suite."}>
      <div className="study-columns study-progress">
        {(present(project.achievements) || results.length > 0) && <div data-study-current=""><h4>{project.finalCurrentTitle ?? "Ce qui existe aujourd’hui"}</h4>{present(project.achievements) && <Prose text={project.achievements!} />}{results.length > 0 && <ul className="study-steps">{results.map((result, index) => <li key={index}>{result}</li>)}</ul>}</div>}
        {nextSteps.length > 0 && <div data-study-next=""><h4>Les prochaines étapes</h4><ul className="study-steps">{nextSteps.map((step, index) => <li key={index}>{step}</li>)}</ul></div>}
      </div>
    </Section>}

    {media.length > 0 && <Section id={`${prefix}-media`} number="08" label="MÉDIAS DU PROJET" title="Voir le projet." className="study-gallery"><div>{media.map(entry => <Media key={entry.src} media={entry} />)}</div></Section>}
  </article>
}
