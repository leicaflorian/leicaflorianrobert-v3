import type {Experience} from '~/types/content'

/** The name shown for an experience's company: its translation when it has one. */
export function companyOf(experience: Experience): string {
  return experience.company_label || experience.company
}

/** The years of an experience, "2018 – 2020" or "2026 – now" (`now` is translated); a single year when it ended that year. */
export function periodOf(experience: Experience, now: string): string {
  if (experience.year === null) return '—'
  const end = experience.current ? now : experience.end_year
  return end && end !== experience.year ? `${experience.year} – ${end}` : String(experience.year)
}
