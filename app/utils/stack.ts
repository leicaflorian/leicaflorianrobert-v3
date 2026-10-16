import type {Technology, TechnologyGroup} from '~/types/content'

/** The stack's rows, in this order. */
export const TECHNOLOGY_GROUPS: TechnologyGroup[] = ['daily', 'production', 'explored']

/** The technologies by group, without the empty groups: grouped by use instead of rated. */
export function groupTechnologies(technologies: Technology[]): {group: TechnologyGroup, items: Technology[]}[] {
  return TECHNOLOGY_GROUPS
    .map(group => ({group, items: technologies.filter(t => t.group === group)}))
    .filter(({items}) => items.length)
}
