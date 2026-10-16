/** Where I am in my working week, Monday to Friday 9–18 in Rome: online, or when I'll reply. */
export type WorkStatus = 'online' | 'morning' | 'tomorrow' | 'monday'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * The work status at `date`, in the Europe/Rome time zone whatever the visitor's: so the
 * Contact page doesn't promise an immediate reply at midnight. Holidays aren't counted.
 */
export function workStatusAt(date: Date): WorkStatus {
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/Rome', weekday: 'short', hour: 'numeric', hourCycle: 'h23'}).formatToParts(date)
  const day = WEEKDAYS.indexOf(parts.find(p => p.type === 'weekday')?.value ?? '')
  const hour = Number(parts.find(p => p.type === 'hour')?.value)
  if (day >= 5 || (day === 4 && hour >= 18)) return 'monday'
  if (hour < 9) return 'morning'
  return hour < 18 ? 'online' : 'tomorrow'
}
