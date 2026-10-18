import type {Education, Experience, SpokenLanguage} from '~/types/content'

/** Everything the CV sheet shows, so its layout doesn't know where the data comes from. */
export interface CvData {
  name: string
  role: string
  /** The site's `cv_profile`, else the About intro, else the tagline; paragraphs separated by a blank line. */
  profile: string
  email: string
  website: string
  city: string
  linkedin: string
  github: string
  /** Newest first. */
  experiences: Experience[]
  /** Technology names: the daily ones, then those used in production. */
  stack: string[]
  languages: SpokenLanguage[]
  /** Newest first. */
  education: Education[]
}
