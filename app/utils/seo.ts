/** The site's name: the suffix of every title and `og:site_name`. */
export const SITE_NAME = 'Leica Florian Robert'

/** The size of social card images: what Facebook, LinkedIn and X show in full. */
export const OG_IMAGE_SIZE = {width: 1200, height: 630}

/** The browser and social title of a page: its own title, then the site's name. */
export function fullTitle(title?: string | null): string {
  return title ? `${title} — ${SITE_NAME}` : SITE_NAME
}

/**
 * What `scripts/og-cards.mjs` draws a page's social card from, after `nuxt generate`: the page
 * writes it as JSON in `<meta name="og-card">` and points `og:image` at the PNG to come.
 */
export interface OgCard {
  /** The orange line above the title: `// chi sono`. */
  label: string
  title: string
  text: string | null
  /** The page path as the header's prompt: `~/leica/chi-sono`. */
  prompt: string
  locale: string
  /** A case study's screenshot, shown in a browser window or, for `phone`, a phone. */
  shot?: {src: string, phone: boolean}
}
