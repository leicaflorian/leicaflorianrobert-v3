import type {MaybeRefOrGetter} from 'vue'
import type {CaseStudy} from '~/types/content'

/**
 * Where a case study's award leads: `#premio`, the anchor of the section labelled like the
 * award fact ("premio", "award", "premiu"), if the case study has one in the current mode.
 */
export function useAwardLink(project: MaybeRefOrGetter<CaseStudy>) {
  const {t} = useI18n()
  const {mode} = useEngine()
  return computed(() => {
    const anchor = anchorOf(t('caseStudy.facts.award'))
    const anchors = sectionAnchors(toValue(project).sections, mode.value)
    return [...anchors.values()].includes(anchor) ? `#${anchor}` : null
  })
}
