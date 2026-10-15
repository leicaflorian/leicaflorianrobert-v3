/**
 * Content read from Directus, already in the current language.
 * Translated fields live in Directus in the `<name>_translations` collections.
 */

/** Id of a file in the Directus library, or `null` if there's no image yet. */
export type FileId = string | null

export interface Site {
  name: string
  email: string
  pec: string
  street: string
  postal_code: string
  city: string
  province: string
  vat: string
  rea: string
  sdi: string
  github: string
  linkedin: string
  available: boolean
  // translated
  role: string
  profession: string
  tagline: string
}

export type Mockup = 'laptop' | 'phone' | 'none'

export interface Project {
  id: number
  slug: string
  url: string
  /** The project has its own page on the site (currently only V3). */
  case_study: boolean
  featured: boolean
  on_home: boolean
  mockup: Mockup
  image: FileId
  // translated
  name: string
  note: string | null
  subtitle: string | null
}

export interface Experience {
  id: number
  year: number | null
  company: string
  link: string | null
  // translated
  role: string
}

export type ServiceIcon = 'web' | 'mobile' | 'design' | 'devops' | 'formazione' | 'consulenza'

export interface Service {
  id: number
  icon: ServiceIcon
  image: FileId
  // translated
  title: string
  text: string
}

export interface Technology {
  id: number
  name: string
}

export interface PageHome {
  contact_image: FileId
  // translated
  hero_title: string
  hero_title_accent: string
  hero_text: string
  services_text: string
  contact_text: string
  legacy_text: string
}

export interface PageAbout {
  portrait: FileId
  gallery_1: FileId
  gallery_2: FileId
  gallery_3: FileId
  // translated
  intro: string
  /** Paragraphs separated by a blank line. */
  story: string
  experiences_text: string
  cta_text: string
}

export interface PageProjects {
  // translated
  intro: string
  cta_text: string
}

export interface PageContact {
  contact_image: FileId
  // translated
  intro: string
}

export interface PageCaseStudy {
  year: number
  cover: FileId
  shot_legacy: FileId
  shot_native: FileId
  shot_about: FileId
  shot_mobile: FileId
  // translated
  title: string
  intro: string
  role: string
  type: string
  pages: string
  start_text: string
  concept_text: string
  visual_text: string
  logo_text: string
  /** One item per line. */
  details: string
}
