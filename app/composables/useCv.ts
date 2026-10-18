import type {Education, Experience, Site, SpokenLanguage, Technology} from '~/types/content'
import type {CvData} from '~/types/cv'

/**
 * The CV's content, from the same Directus data as the site: updating an experience updates
 * the CV at the next build. Only what the site already shows publicly goes in.
 */
export async function useCvData() {
  // before the await: after it, the Nuxt instance is gone
  const {siteUrl} = useRuntimeConfig().public
  const [site, experiences, technologies, education, languages] = await Promise.all([
    useSingleton<Site>('site'),
    useCollection<Experience>('experiences'),
    useCollection<Technology>('technologies'),
    useCollection<Education>('education'),
    useCollection<SpokenLanguage>('spoken_languages'),
  ])

  return computed<CvData>(() => ({
    name: site.value.name,
    role: site.value.role,
    profile: site.value.tagline,
    email: site.value.email,
    website: siteUrl,
    city: `${site.value.city} (${site.value.province})`,
    linkedin: site.value.linkedin,
    github: site.value.github,
    // Directus keeps them oldest first, as the About timeline reads them
    experiences: [...experiences.value].reverse(),
    // the explored ones would read as full skills on a CV
    stack: (['daily', 'production'] as const).flatMap(group =>
      technologies.value.filter(t => t.group === group).map(t => t.name)),
    languages: languages.value,
    education: [...education.value].reverse(),
  }))
}
