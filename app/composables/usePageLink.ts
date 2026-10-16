import type {Page} from '~/types/content'

/**
 * The pages loaded by `usePages()`, in the current language, without waiting:
 * the layouts load them before anything that links to a page is rendered.
 */
function useLoadedPages() {
  const {locale} = useI18n()
  const {data} = useNuxtData<RawItem[]>(PAGES_KEY)
  return computed(() => (data.value ?? []).map(raw => translateItem<Page>(raw, locale.value)))
}

/** A path made of slugs, with the language prefix: `['progetti', 'v3']` → `/en/projects/v3`. */
function useJoin() {
  const localePath = useLocalePath()
  return (...parts: (string | null | undefined)[]) => localePath(`/${parts.filter(Boolean).join('/')}`)
}

/**
 * The path of a page from its `key` (`home`, `contact`…), in the current language.
 * Page slugs live in Directus, so links go through here instead of route names.
 */
export function usePageLink() {
  const pages = useLoadedPages()
  const join = useJoin()
  return (key: string) => join(pages.value.find(p => p.key === key)?.slug)
}

/**
 * Where a project leads: its case study under the page that lists them,
 * otherwise the external website, in a new tab.
 */
export function useProjectLink() {
  const pages = useLoadedPages()
  const join = useJoin()

  return (project: {slug: string, url: string, case_study: boolean}) => {
    const parent = pages.value.find(p => p.children === 'projects')
    return project.case_study && parent
      ? {href: join(parent.slug, project.slug), target: undefined, rel: undefined, internal: true}
      : {href: project.url, target: '_blank', rel: 'noopener', internal: false}
  }
}

/** The current path without the language prefix and slashes: `progetti/v3`, `''` for the home. */
export function useCurrentPath() {
  const route = useRoute()
  return computed(() => [route.params.slug ?? []].flat().filter(Boolean).join('/'))
}

/** The menu: the pages marked `in_menu`, with the one the current path belongs to. */
export function useMenu() {
  const pages = useLoadedPages()
  const path = useCurrentPath()
  const join = useJoin()

  return computed(() => pages.value
    .filter(page => page.in_menu)
    .map(page => ({
      key: page.key,
      slug: page.slug,
      title: page.title,
      href: join(page.slug),
      active: page.slug ? path.value === page.slug || path.value.startsWith(`${page.slug}/`) : !path.value,
    })))
}
