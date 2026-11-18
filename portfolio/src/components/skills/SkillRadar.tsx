import type { CSSProperties, FocusEvent, KeyboardEvent } from 'react'
import type { SkillDomain } from '../../data/skills'
import { skillLevels } from '../../data/skills'
import { polygonPoints, RADAR, radarPoint, radarRing, radarValues } from './radarGeometry'

function labelLines(domain: SkillDomain) {
  if (domain.id === 'architecture') return ['Architecture', 'logicielle']
  if (domain.id === 'devops') return ['Outils &', 'DevOps']
  return [domain.name]
}

export function SkillRadar({ domains, activeId, selectedId, preview, select, restore }: {
  domains: readonly SkillDomain[]; activeId: string; selectedId: string;
  preview: (id: string) => void; select: (id: string) => void; restore: () => void;
}) {
  const values = radarValues(domains.map(domain => domain.level))
  const blur = (event: FocusEvent<HTMLDivElement>) => { if (!event.currentTarget.contains(event.relatedTarget)) restore() }
  const keydown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const offset = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0
    if (!offset && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault(); event.stopPropagation()
    const buttons = event.currentTarget.closest('.skills-radar')!.querySelectorAll<HTMLButtonElement>('[data-skill-control]')
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? domains.length - 1 : (index + offset + domains.length) % domains.length
    buttons[next]?.focus()
  }
  return <div className="skills-radar" onPointerLeave={restore} onBlur={blur} role="group" aria-label="Radar des cinq domaines de compétences">
    <svg className="skills-radar-svg" viewBox={`0 0 ${RADAR.width} ${RADAR.height}`} aria-hidden="true" focusable="false">
      <g className="radar-grids">{[1, 2, 3, 4, 5].map(level => <polygon className="radar-grid" key={level} points={radarRing(level, domains.length)} pathLength="1" />)}</g>
      <g className="radar-axes">{domains.map((domain, index) => {
        const point = radarPoint(index, domains.length, RADAR.radius)
        return <line key={domain.id} className="radar-spoke" x1={RADAR.cx} y1={RADAR.cy} x2={point.x} y2={point.y} pathLength="1" />
      })}</g>
      <polygon className="radar-values" data-radar-values="" points={polygonPoints(values)} />
      {domains.map((domain, index) => {
        const point = values[index]
        return <g key={domain.id} className={`radar-domain ${activeId === domain.id ? 'is-active' : ''}`} data-radar-domain={domain.id} onPointerEnter={event => { if (event.pointerType !== 'touch') preview(domain.id) }} onClick={() => select(domain.id)}>
          <line className="radar-active-spoke" x1={RADAR.cx} y1={RADAR.cy} x2={point.x} y2={point.y} />
          <g className="radar-point-group"><circle className="radar-point-halo" cx={point.x} cy={point.y} r="11" /><circle className="radar-value-point" cx={point.x} cy={point.y} r="4" /></g>
          <circle className="radar-hit-target" cx={point.x} cy={point.y} r="36" />
        </g>
      })}
      <circle className="radar-centre" cx={RADAR.cx} cy={RADAR.cy} r="2" />
    </svg>
    {domains.map((domain, index) => {
      const label = radarPoint(index, domains.length, RADAR.labelRadius)
      const position: CSSProperties = { left: `clamp(50px, ${label.x / RADAR.width * 100}%, calc(100% - 50px))`, top: `clamp(24px, ${label.y / RADAR.height * 100}%, calc(100% - 24px))` }
      return <button type="button" key={domain.id} className={`radar-axis-label ${activeId === domain.id ? 'is-active' : ''}`} style={position} data-skill-control={domain.id} aria-controls="skill-detail-panel" aria-pressed={selectedId === domain.id} aria-label={`${domain.name} — ${skillLevels[domain.level].label}, niveau ${domain.level} sur 5`} onPointerEnter={event => { if (event.pointerType !== 'touch') preview(domain.id) }} onFocus={() => preview(domain.id)} onClick={() => select(domain.id)} onKeyDown={event => keydown(event, index)}>{labelLines(domain).map(line => <span key={line}>{line}</span>)}</button>
    })}
  </div>
}
