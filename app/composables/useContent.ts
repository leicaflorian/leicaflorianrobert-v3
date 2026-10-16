import {createDirectus, readItems, readSingleton, rest} from '@directus/sdk'
import type {BlockCollection, CaseStudy, FileId, Page, Section} from '~/types/content'

/** The language all content is written in, used when a translation is missing. */
const FALLBACK_LOCALE = 'it'

interface TranslationRow {
  id?: number
  languages_code: string

  [field: string]: unknown
}

export type RawItem = Record<string, unknown> & {translations?: TranslationRow[]}

/** The block collections, as in `directus/scripts/setup.mjs`. */
export const BLOCK_COLLECTIONS: BlockCollection[] = [
  'block_hero_home', 'block_page_header', 'block_text', 'block_gallery', 'block_widgets', 'block_list', 'block_palette',
  'block_cta', 'block_contact_form', 'block_services', 'block_projects', 'block_experiences', 'block_stack',
  'block_contact_info',
]

/** The cache key of the pages, shared by `usePages()` and `usePageLink()`. */
export const PAGES_KEY = 'directus:pages'

export function useDirectus() {
  const {public: {directusUrl}} = useRuntimeConfig()
  return createDirectus(directusUrl).with(rest())
}

/**
 * Lifts the translated fields to the top level: first those of the requested language, then,
 * for each empty field, the Italian ones. `{years}` in them becomes the years of experience.
 */
export function translateItem<T>(item: RawItem, locale: string): T {
  const {translations = [], ...fields} = item
  const pick = (code: string) => translations.find(t => t.languages_code === code)
  const strip = (row?: TranslationRow) => {
    if (!row) return {}
    const {id: _id, languages_code: _code, ...rest} = row
    // the column pointing to the translated item (e.g. `projects_id`)
    return Object.fromEntries(Object.entries(rest).filter(([key]) => !key.endsWith('_id')))
  }

  const fallback = strip(pick(FALLBACK_LOCALE))
  const current = strip(pick(locale))
  const merged: Record<string, unknown> = {...fallback}
  for (const [key, value] of Object.entries(current)) {
    if (value !== null && value !== '') merged[key] = value
  }
  for (const [key, value] of Object.entries(merged)) {
    if (typeof value === 'string') merged[key] = withYears(value)
  }

  return {...fields, ...merged} as T
}

function failIfMissing(error: Ref<unknown>, what: string) {
  if (error.value) {
    throw createError({
      statusCode: 503,
      statusMessage: `Content unavailable (${what})`,
      cause: error.value,
      fatal: true,
    })
  }
}

/**
 * The items of a collection, ordered by `sort`, in the current language.
 * Data is fetched once with all translations: switching language doesn't request it again.
 */
export async function useCollection<T>(collection: string, filter?: Record<string, unknown>) {
  const directus = useDirectus()
  const {locale} = useI18n()

  const {data, error} = await useAsyncData(`directus:${collection}`, () =>
    directus.request(readItems(collection as never, {
      fields: ['*', {translations: ['*']}] as never,
      sort: ['sort'] as never,
      // `filter: undefined` becomes an invalid query: pass it only when set
      ...(filter ? {filter: filter as never} : {}),
      limit: -1,
    })) as Promise<RawItem[]>,
  )
  failIfMissing(error, collection)

  return computed(() => (data.value ?? []).map(item => translateItem<T>(item, locale.value)))
}

/** A Directus singleton (the site settings, a page's texts), in the current language. */
export async function useSingleton<T>(collection: string) {
  const directus = useDirectus()
  const {locale} = useI18n()

  const {data, error} = await useAsyncData(`directus:${collection}`, () =>
    directus.request(readSingleton(collection as never, {
      fields: ['*', {translations: ['*']}] as never,
    })) as Promise<RawItem>,
  )
  failIfMissing(error, collection)

  return computed(() => translateItem<T>(data.value ?? {}, locale.value))
}

/** The fields of the `sections` many-to-any: each block type with its translations. */
const SECTION_FIELDS = [
  'sections.id',
  'sections.collection',
  'sections.sort',
  ...BLOCK_COLLECTIONS.flatMap(c => [`sections.item:${c}.*`, `sections.item:${c}.translations.*`]),
  'sections.item:block_gallery.images.directus_files_id',
  'sections.item:block_gallery.images.sort',
]

interface RawSection {
  id: number
  collection: BlockCollection
  sort: number | null
  /** `null` if the block was deleted. */
  item: RawItem | null
}

const bySort = (a: {sort?: unknown}, b: {sort?: unknown}) => Number(a.sort ?? 0) - Number(b.sort ?? 0)

/** The sections in order, translated; a gallery's images become a list of file ids. */
function translateSections(raw: unknown, locale: string): Section[] {
  return ((raw ?? []) as RawSection[])
    .filter(section => section.item && typeof section.item === 'object')
    .sort(bySort)
    .map(({id, collection, item}) => {
      const block = translateItem<Record<string, unknown>>(item!, locale)
      if (collection === 'block_gallery') {
        const images = (item!.images ?? []) as {directus_files_id: FileId, sort: number | null}[]
        block.images = [...images].sort(bySort).map(image => image.directus_files_id)
      }
      return {id, collection, item: block} as unknown as Section
    })
}

/**
 * All the pages, with their sections, in the current language. They're few and small: loading
 * them all at once lets the menu, the links and the router share one request.
 */
export async function usePages() {
  const directus = useDirectus()
  const {locale} = useI18n()

  const {data, error} = await useAsyncData(PAGES_KEY, () =>
    directus.request(readItems('pages' as never, {
      fields: ['*', {translations: ['*']}, ...SECTION_FIELDS] as never,
      sort: ['sort'] as never,
      limit: -1,
    })) as Promise<RawItem[]>,
  )
  failIfMissing(error, 'pages')

  return computed(() => (data.value ?? []).map(raw => ({
    ...translateItem<Page>(raw, locale.value),
    sections: translateSections(raw.sections, locale.value),
  })))
}

/** A published project with a case study, with its sections; `null` if there's none. */
export async function useCaseStudy(slug: string) {
  const directus = useDirectus()
  const {locale} = useI18n()

  const {data, error} = await useAsyncData(`directus:case-study:${slug}`, () =>
    directus.request(readItems('projects' as never, {
      fields: ['*', {translations: ['*']}, ...SECTION_FIELDS] as never,
      filter: {slug: {_eq: slug}, status: {_eq: 'published'}, case_study: {_eq: true}} as never,
      limit: 1,
    })) as Promise<RawItem[]>,
  )
  failIfMissing(error, `case study ${slug}`)

  return computed(() => {
    const raw = data.value?.[0]
    if (!raw) return null
    return {
      ...translateItem<CaseStudy>(raw, locale.value),
      sections: translateSections(raw.sections, locale.value),
    }
  })
}
