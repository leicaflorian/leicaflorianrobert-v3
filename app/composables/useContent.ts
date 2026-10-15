import {createDirectus, readItems, readSingleton, rest} from '@directus/sdk'

/** The language all content is written in, used when a translation is missing. */
const FALLBACK_LOCALE = 'it'

interface TranslationRow {
  id?: number
  languages_code: string

  [field: string]: unknown
}

type RawItem = Record<string, unknown> & {translations?: TranslationRow[]}

export function useDirectus() {
  const {public: {directusUrl}} = useRuntimeConfig()
  return createDirectus(directusUrl).with(rest())
}

/**
 * Lifts the translated fields to the top level: first those of the requested language, then,
 * for each empty field, the Italian ones.
 */
function translate<T>(item: RawItem, locale: string): T {
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

  return computed(() => (data.value ?? []).map(item => translate<T>(item, locale.value)))
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

  return computed(() => translate<T>(data.value ?? {}, locale.value))
}
