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

  /**
   * Plays the boot overlay and switches to `next` under it. Resolves once the mode has
   * switched (at once if a boot is already in progress). `scroll: false` keeps the scroll
   * position, for the boot that opens the site in native mode.
   */
  function boot(next: EngineMode, {scroll = true} = {}) {
    if (bootTarget.value) return Promise.resolve()
    bootTarget.value = next

    setTimeout(() => {
      bootTarget.value = null
    }, BOOT_TOTAL_MS)
    return new Promise<void>(resolve => setTimeout(() => {
      set(next)
      if (scroll) window.scrollTo(0, 0)
      resolve()
    }, BOOT_SWITCH_MS))
  }

  function toggle() {
    boot(isLegacy.value ? 'native' : 'legacy')
  }

  return {mode, isNative, isLegacy, bootTarget, set, boot, toggle}
}
