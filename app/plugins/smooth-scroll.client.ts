import Lenis from 'lenis'

/**
 * Smooth scrolling (Lenis) in native mode only: legacy keeps the browser's own scroll,
 * as a '90s page would. Lenis moves the real window scroll, so `position: sticky`,
 * IntersectionObserver and `window.scrollTo` keep working. Off with `prefers-reduced-motion`.
 */
export default defineNuxtPlugin(() => {
  const {isNative} = useEngine()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const enabled = ref(false)
  let lenis: Lenis | undefined

  function update() {
    enabled.value = isNative.value && !reducedMotion.matches
  }

  watch(enabled, (on) => {
    if (on && !lenis) {
      // stopInertiaOnNavigate: a click on an internal link stops the glide, so the
      // router's scroll to the top of the new page isn't overridden
      lenis = new Lenis({autoRaf: true, anchors: true, stopInertiaOnNavigate: true})
    } else if (!on && lenis) {
      lenis.destroy()
      lenis = undefined
    }
  })

  watch(isNative, update, {immediate: true})
  reducedMotion.addEventListener('change', update)
})
