import type {Project} from '~/types/content'

/**
 * Where a project leads: its page on the site if it has a case study,
 * otherwise the external website, in a new tab.
 */
export function useProjectLink() {
  const localePath = useLocalePath()

  return (project: Project) => project.case_study
    ? {href: localePath('projects-v3'), target: undefined, rel: undefined, internal: true}
    : {href: project.url, target: '_blank', rel: 'noopener', internal: false}
}
