/** The year I started programming: every "years of experience" on the site counts from here. */
export const CAREER_START = 2009

/** Years of experience, as of the build: the static pages pick up a new year at the next build. */
export function yearsOfExperience(): number {
  return new Date().getFullYear() - CAREER_START
}

/** Replaces `{years}` in a Directus text, so the editor never has to update the number by hand. */
export function withYears(text: string): string {
  return text.replaceAll('{years}', String(yearsOfExperience()))
}
