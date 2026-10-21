import type {EngineMode} from '~/composables/useEngine'
import type {Section} from '~/types/content'

/** A section's anchor, from its label: `premio` → `#premio`, `// Il mio stack` → `#il-mio-stack`. */
export function anchorOf(label: string): string {
  return label
    .replace(/^\/\/\s*/, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * The anchors of the sections shown in `mode`, by section id: each labelled section can be
 * linked to (`/progetti/tfp#premio`). When two share a label, the first one gets it.
 */
export function sectionAnchors(sections: Section[], mode: EngineMode): Map<number, string> {
  const anchors = new Map<number, string>()
  const taken = new Set<string>()
  for (const section of sections) {
    if (section.item.engines !== 'both' && section.item.engines !== mode) continue
    const label = 'label' in section.item ? section.item.label : null
    const anchor = label ? anchorOf(label) : ''
    if (!anchor || taken.has(anchor)) continue
    taken.add(anchor)
    anchors.set(section.id, anchor)
  }
  return anchors
}
