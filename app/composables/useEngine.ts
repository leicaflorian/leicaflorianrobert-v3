export type EngineMode = 'legacy' | 'native'

export const ENGINE_STORAGE_KEY = 'lfr-engine'

/** How long after the boot starts the page switches mode. */
const BOOT_SWITCH_MS = 450
/** How long the boot overlay lasts. */
const BOOT_TOTAL_MS = 1100

/**
 * The site mode: `legacy` ('90s HTML) or `native` (the design).
 *
 * The server and the first client render always start from `legacy`, so the generated
 * HTML is the same for everyone; the `engine.client` plugin then reads the saved choice.
 */
export function useEngine() {
  const mode = useState<EngineMode>('engine-mode', () => 'legacy')
  /** The mode the boot is heading to, `null` if no boot is in progress. */
  const bootTarget = useState<EngineMode | null>('engine-boot', () => null)

  const isNative = computed(() => mode.value === 'native')
  const isLegacy = computed(() => mode.value === 'legacy')

  function set(next: EngineMode) {
    mode.value = next
    try {
      localStorage.setItem(ENGINE_STORAGE_KEY, next)
    } catch {
      // without storage the choice only lasts for this visit
    }
  }

  function toggle() {
    if (bootTarget.value) return

    const next: EngineMode = isLegacy.value ? 'native' : 'legacy'
    bootTarget.value = next

    setTimeout(() => {
      set(next)
      window.scrollTo(0, 0)
    }, BOOT_SWITCH_MS)
    setTimeout(() => {
      bootTarget.value = null
    }, BOOT_TOTAL_MS)
  }

  return {mode, isNative, isLegacy, bootTarget, set, toggle}
}
