import type {ServiceIcon} from '~/types/content'
import type {BriefType} from '~/utils/brief'

/**
 * The words that point to each service, in Italian, English and Romanian. The services
 * guide matches them in what the visitor writes: plain keywords, no AI, and it says so.
 */
export const SERVICE_KEYWORDS: Record<ServiceIcon, RegExp> = {
  web: /sit[oi]\b|\bsite|web|e-?commerce|shop|negozi|magazin|store|saas|landing|pagament|payment|pl[aă]ț?i|vetrina|portal|gestional/,
  mobile: /\bapp\b|mobile|mobil[aă]|ios|android|telefon|phone|smartphone|prenotazion|booking|rezerv|aplica[tț]i/,
  design: /design|\bui\b|\bux\b|grafic|interfacc|interfa[cț]|figma|restyling|redesign|usabil/,
  devops: /server|hosting|deploy|domini|domain|domeniu|ssl|lent[oa]|slow|cloud|docker|manutenz|maintenance|mentenan|e-?commerce|backup|infrastru/,
  ai: /\bai\b|\bia\b|chatbot|automa|gpt|claude|agent|intelligen|e-?mail|crm|document|llm/,
  formazione: /\bcors|impar|mentor|formazion|formare|insegn|team|junior|student|course|learn|teach|training|\bcurs|înv[aă]ț|invat/,
  consulenza: /consulen|consult|parere|p[aă]rere|opinion|review|architett|architect|arhitect|stack|audit|riscriv|rewrite|rescri|\bcod(e|ul|ice)?\b/,
}

/** The project type each service selects in the contact form. */
export const SERVICE_BRIEF: Record<ServiceIcon, BriefType> = {
  web: 'site',
  mobile: 'mobile-app',
  design: 'ui-ux',
  devops: 'devops',
  ai: 'ai',
  formazione: 'training',
  consulenza: 'consulting',
}

/** The services whose keywords appear in the text, in the order given. */
export function matchServices(text: string, icons: ServiceIcon[]): ServiceIcon[] {
  const lower = text.toLowerCase()
  return icons.filter(icon => SERVICE_KEYWORDS[icon].test(lower))
}
