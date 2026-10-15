/** The paragraphs of a text, separated by one or more blank lines. */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
}

/** The non-empty lines of a text (for lists written one item per line). */
export function lines(text: string | null | undefined): string[] {
  return (text ?? '').split('\n').map(l => l.trim()).filter(Boolean)
}

const escapeHtml = (text: string) => text
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

/**
 * Safe HTML from a Directus text: everything is treated as text,
 * except `**word**`, which becomes a highlighted word.
 */
export function highlight(text: string, className = 'text-ink'): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, `<span class="${className}">$1</span>`)
}

/** The same text without the `**` marks, for legacy mode. */
export function plain(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1')
}

/**
 * The domain shown under a project: without `www.` and, for GitHub Pages,
 * with the path, since there the domain alone says nothing.
 */
export function hostOf(url: string): string {
  try {
    const {hostname, pathname} = new URL(url)
    const host = hostname.replace(/^www\./, '')
    return hostname.endsWith('github.io') ? host + pathname.replace(/\/$/, '') : host
  } catch {
    return url
  }
}

/** A URL without protocol, `www.` and trailing slash: `github.com/leicaflorian`. */
export function shortUrl(url: string): string {
  try {
    const {hostname, pathname} = new URL(url)
    return hostname.replace(/^www\./, '') + pathname.replace(/\/$/, '')
  } catch {
    return url
  }
}

/** The last segment of a URL path: the username of a social profile. */
export function lastSegment(url: string): string {
  return shortUrl(url).split('/').pop() ?? url
}
