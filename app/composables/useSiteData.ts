import type {Project, Technology} from '~/types/content'

/**
 * The published projects, case studies first: they are the work told in full.
 * Within each group the order set in Directus stays. One cache key for every block that shows them.
 */
export async function usePublishedProjects() {
  const projects = await useCollection<Project>('projects', {status: {_eq: 'published'}})
  return computed(() => [...projects.value].sort((a, b) => Number(b.case_study) - Number(a.case_study)))
}

/** The numbers of the About header: years of experience and technologies in the stack. */
export async function useAboutStats() {
  const technologies = await useCollection<Technology>('technologies')

  // the years come from CAREER_START, like the `{years}` in the texts
  return computed(() => ({
    years: yearsOfExperience(),
    technologies: technologies.value.length,
  }))
}
