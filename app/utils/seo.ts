/** The site's name: the suffix of every title and `og:site_name`. */
export const SITE_NAME = 'Leica Florian Robert'

/** The size of social card images: what Facebook, LinkedIn and X show in full. */
export const OG_IMAGE_SIZE = {width: 1200, height: 630}

/** The browser and social title of a page: its own title, then the site's name. */
export function fullTitle(title?: string | null): string {
  return title ? `${title} — ${SITE_NAME}` : SITE_NAME
}
