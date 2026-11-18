import { useEffect, useLayoutEffect, useRef } from 'react'
import type { Ref } from 'react'
import { ArrowLeft } from 'lucide-react'
import { skillDomains, SKILL_LEVELS_PROVISIONAL, skillLevels } from '../data/skills'
import { SkillRadar } from '../components/skills/SkillRadar'
import { SkillDetailPanel } from '../components/skills/SkillDetailPanel'
import { SkillLevelLegend } from '../components/skills/SkillLevelLegend'
import { useSkillSelection } from '../components/skills/useSkillSelection'
import { polygonPoints, radarValues } from '../components/skills/radarGeometry'
import { createSkillsEntrance } from '../animation/skillsAnimations'

const polygon = polygonPoints(radarValues(skillDomains.map(domain => domain.level)))

export function SkillsScene({ sceneRef, active, visible, reduced, journey, openProject }: {
  sceneRef: Ref<HTMLElement>; active: boolean; visible: boolean; reduced: boolean; journey: () => void; openProject: (id: string) => void;
}) {
  const content = useRef<HTMLDivElement>(null)
  const selection = useSkillSelection(skillDomains)
  const restore = selection.restore
  useEffect(() => () => restore(), [active, restore])
  useLayoutEffect(() => {
    if (!visible) return
    const ctx = createSkillsEntrance(content.current!, polygon, reduced)
    return () => ctx.revert()
  }, [visible, reduced])
  const { selected, displayed } = selection
  return <section className="scene-panel skills-panel" ref={sceneRef} data-scene-scroll="" aria-labelledby="skills-title" aria-hidden={!active} inert={!active}>
    <div className="skills-shell" ref={content}>
      <div className="skills-topline"><span className="eyebrow"><span className="tiny-dot" />04 — COMPÉTENCES</span><span>COMPRENDRE / CONCEVOIR / CONSTRUIRE</span></div>
      <div className="scene-body" data-scene-scroll=""><div className="skills-heading"><h2 id="skills-title" tabIndex={-1}>Sous le <em>capot.</em></h2><p>Les technologies, méthodes et outils derrière mes réalisations.</p></div>
      <div className="skills-layout"><div className="skills-chart-column"><figure className="skills-chart"><SkillRadar domains={skillDomains} activeId={displayed.id} selectedId={selected.id} preview={selection.preview} select={selection.select} restore={selection.restore} /><figcaption><span className="radar-key-line" />Autoévaluation indicative{SKILL_LEVELS_PROVISIONAL && <small>Niveaux provisoires · à valider</small>}</figcaption></figure><div className="skills-chart-footer"><span><span className="skills-desktop-hint">Survolez pour explorer.<br />Sélectionnez pour conserver.</span><span className="skills-touch-hint">Touchez un domaine.<br />Les détails suivent le radar.</span></span><SkillLevelLegend active={active} /></div></div>
        <SkillDetailPanel domain={displayed} reduced={reduced} openProject={id => { selection.select(displayed.id); openProject(id) }} />
      </div>
      </div><div className="skills-bottom"><button type="button" onClick={journey}><ArrowLeft size={14} />Retour au parcours</button><span>Listes initiales à personnaliser, sans durée de pratique présumée.</span></div>
      <p className="skills-sr-only" role="status" aria-live="polite">Domaine sélectionné : {selected.name}. {skillLevels[selected.level].label}, niveau {selected.level} sur 5. Autoévaluation provisoire.</p>
    </div>
  </section>
}
