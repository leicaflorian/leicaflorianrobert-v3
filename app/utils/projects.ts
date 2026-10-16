import type {BlockProjects, Project} from '~/types/content'

/** Whether a project belongs to a block's `kind` filter: agency work counts as client work. */
export function isOfKind(project: Project, kind: BlockProjects['kind']): boolean {
  if (kind === 'client') return project.kind !== 'personal'
  if (kind === 'personal') return project.kind === 'personal'
  return true
}
