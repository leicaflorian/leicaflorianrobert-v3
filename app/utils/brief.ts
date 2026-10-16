/**
 * The project brief of the contact form: fixed options, saved in Directus by key and
 * labelled in i18n (`form.brief.options.*`). The contact endpoint accepts only these keys:
 * keep `directus/extensions/contact-endpoint/dist/index.js` in sync.
 */
export const BRIEF_OPTIONS = {
  types: ['site', 'web-app', 'mobile-app', 'ecommerce', 'consulting', 'training'],
  budget: ['lt-3k', '3-10k', '10-25k', '25k-plus', 'tbd'],
  timeline: ['urgent', '1-3m', '3-6m', 'flexible'],
} as const

export type BriefType = typeof BRIEF_OPTIONS.types[number]
export type BriefBudget = typeof BRIEF_OPTIONS.budget[number]
export type BriefTimeline = typeof BRIEF_OPTIONS.timeline[number]
