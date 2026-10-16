import type {BlockProjects, Project, ProjectBranch} from '~/types/content'

/** Whether a project belongs to a block's `kind` filter: agency work counts as client work. */
export function isOfKind(project: Project, kind: BlockProjects['kind']): boolean {
  if (kind === 'client') return project.kind !== 'personal'
  if (kind === 'personal') return project.kind === 'personal'
  return true
}

/** A project's branch in the Projects graph: set in Directus, or from who it was for. */
export function branchOf(project: Project): ProjectBranch {
  return project.branch ?? (project.kind === 'personal' ? 'lab' : 'client')
}

/**
 * The projects in the graph: the versions of the site and the work told in full or shown on
 * the home page. All of them would make it too long to read.
 */
export function graphProjects(projects: Project[]): Project[] {
  return projects.filter(p => p.branch === 'main' || p.case_study || p.featured || p.on_home)
}

/** A short commit-like hash of a slug (FNV-1a): stable, so a project always has the same one. */
export function hashOf(slug: string): string {
  let hash = 2166136261
  for (const char of slug) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return (hash >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}
