import type {Experience, Project, Technology} from '~/types/content'

/** The published projects. One cache key for every block that shows them. */
export function usePublishedProjects() {
  return useCollection<Project>('projects', {status: {_eq: 'published'}})
}

/** The numbers of the About header: years of experience and technologies in the stack. */
export async function useAboutStats() {
  const [experiences, technologies] = await Promise.all([
    useCollection<Experience>('experiences'),
    useCollection<Technology>('technologies'),
  ])

  return computed(() => {
    // years are counted from the first experience that has one
    const first = Math.min(...experiences.value.map(e => e.year ?? Infinity))
    return {
      years: Number.isFinite(first) ? new Date().getFullYear() - first : 0,
      technologies: technologies.value.length,
    }
  })
}
