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
/** Who the project was for: a client of mine, a client of an agency I worked for (never named), or myself. */
export type ProjectKind = 'direct' | 'agency' | 'personal'
/** The branch of a project in the Projects graph: main holds the versions of this site, client is shown as prod, lab as dev. */
export type ProjectBranch = 'main' | 'client' | 'lab'

export interface Project {
  id: number
  slug: string
  url: string
  /** The project has its own page on the site, under the page with `children: 'projects'`. */
  case_study: boolean
  kind: ProjectKind
  /** Empty: client or lab, from the kind. */
  branch: ProjectBranch | null
  featured: boolean
  on_home: boolean
  mockup: Mockup
  image: FileId
  year: number | null
  cover: FileId
  // translated
  name: string
  note: string | null
  subtitle: string | null
  intro: string | null
  role: string | null
  type: string | null
  stack: string | null
}

/** A project with its case study sections. */
export interface CaseStudy extends Project {
  sections: Section[]
}

export interface Experience {
  id: number
  year: number | null
  company: string
  link: string | null
  // translated
  role: string
  /** What I did there, in one or two sentences. */
  description: string | null
}

export type ServiceIcon = 'web' | 'mobile' | 'design' | 'devops' | 'ai' | 'formazione' | 'consulenza'

export interface Service {
  id: number
  icon: ServiceIcon
  image: FileId
  // translated
  title: string
  text: string
}

/** How much I use a technology: every day, in production (also in the past), or only explored. */
export type TechnologyGroup = 'daily' | 'production' | 'explored'

export interface Technology {
  id: number
  name: string
  group: TechnologyGroup
}

// --- pages and blocks ----------------------------------------------------------------

/** What a page shows under its own path: today the case studies of the projects. */
export type PageChildren = 'none' | 'projects'

export interface Page {
  id: number
  /** The page's name in the code (`home`, `about`…), stable across languages. */
  key: string
  in_menu: boolean
  children: PageChildren
  sections: Section[]
  // translated
  /** The path without the leading slash; empty for the home page. */
  slug: string
  title: string
  seo_title: string | null
  description: string | null
}

/** In which mode a block is shown. */
export type Engines = 'both' | 'native' | 'legacy'

interface BlockBase {
  id: number
  engines: Engines
}

export interface BlockHeroHome extends BlockBase {
  // translated
  title: string
  title_accent: string
  text: string
  legacy_text: string
}

export interface BlockPageHeader extends BlockBase {
  variant: 'plain' | 'about' | 'projects' | 'contact'
  // translated
  /** `{n}` becomes the number of projects. */
  label: string | null
  title: string
  intro: string | null
}

export interface BlockText extends BlockBase {
  // translated
  label: string | null
  title: string
  text: string
}

export interface BlockGallery extends BlockBase {
  images: FileId[]
  // translated
  label: string | null
  title: string | null
  text: string | null
  /** One per line, in the order of the images. */
  captions: string | null
}

export type Widget = 'editor' | 'lesson' | 'neofetch'

export interface BlockWidgets extends BlockBase {
  widgets: Widget[] | null
  // translated
  label: string | null
  title: string | null
}

export interface BlockList extends BlockBase {
  // translated
  label: string | null
  title: string
  /** One item per line. */
  items: string
}

export interface BlockPalette extends BlockBase {
  /** One hex color per line. */
  colors: string
  logo: FileId
  /** Show this site's animated logo instead of `logo`. */
  site_logo: boolean
  // translated
  label: string | null
  title: string
  text: string | null
  /** One per line, in the order of the colors. */
  color_names: string | null
  logo_text: string | null
}

export interface BlockCta extends BlockBase {
  variant: 'banner' | 'split'
  // translated
  label: string | null
  title: string
  title_accent: string | null
  text: string | null
}

export interface BlockContactForm extends BlockBase {
  // translated
  label: string | null
  title: string
  text: string | null
}

export interface BlockServices extends BlockBase {
  // translated
  label: string | null
  title: string
  text: string | null
}

export interface BlockProjects extends BlockBase {
  show: 'home' | 'featured' | 'archive'
  /** Which projects: `client` covers both `direct` and `agency`. */
  kind: 'all' | 'client' | 'personal'
  all_link: boolean
  // translated
  label: string | null
  title: string | null
}

export interface BlockExperiences extends BlockBase {
  // translated
  label: string | null
  title: string
  text: string | null
}

export interface BlockStack extends BlockBase {
  // translated
  label: string | null
  title: string
}

export interface BlockContactInfo extends BlockBase {
  // translated
  label: string | null
  title: string | null
}

/** Each block collection and the shape of its items. */
export interface Blocks {
  block_hero_home: BlockHeroHome
  block_page_header: BlockPageHeader
  block_text: BlockText
  block_gallery: BlockGallery
  block_widgets: BlockWidgets
  block_list: BlockList
  block_palette: BlockPalette
  block_cta: BlockCta
  block_contact_form: BlockContactForm
  block_services: BlockServices
  block_projects: BlockProjects
  block_experiences: BlockExperiences
  block_stack: BlockStack
  block_contact_info: BlockContactInfo
}

export type BlockCollection = keyof Blocks

/** A section of a page or case study: a block of any type, in order. */
export type Section = {[C in BlockCollection]: {id: number, collection: C, item: Blocks[C]}}[BlockCollection]
