import type {Directive} from 'vue'

/** Delay between the elements coming into view together, and the most steps it adds up to. */
const STAGGER_MS = 70
const MAX_STEPS = 6
/** The fade itself (`.reveal-active` in main.css), plus some slack before cleaning up. */
const FADE_MS = 500

/**
 * `v-reveal`: the element fades in and rises 8px the first time it comes into view.
 * `v-reveal.stagger` does it to each child instead: those entering together follow
 * each other. The classes come from here, so without JS the content is just there;
 * they are removed once done, so the element's own hover transitions are back.
 * Waits for the engine boot to end; off with `prefers-reduced-motion`.
 * On the server it renders nothing (and only legacy blocks are rendered there anyway).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const observers = new WeakMap<HTMLElement, IntersectionObserver>()
  // here, not in the hooks: they run outside the Nuxt context
  const {bootTarget} = useEngine()

  const reveal: Directive<HTMLElement> = {
    getSSRProps: () => ({}),

    mounted(el, {modifiers}) {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const targets = modifiers.stagger ? Array.from(el.children) as HTMLElement[] : [el]
      targets.forEach(target => target.classList.add('reveal-pending'))

      let queue: HTMLElement[] = []
      const show = () => {
        queue.forEach((target, i) => {
          const delay = Math.min(i, MAX_STEPS) * STAGGER_MS
          target.style.transitionDelay = `${delay}ms`
          target.classList.add('reveal-active')
          target.classList.remove('reveal-pending')
          setTimeout(() => {
            target.classList.remove('reveal-active')
            target.style.transitionDelay = ''
          }, delay + FADE_MS + 50)
        })
        queue = []
      }

      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.unobserve(entry.target)
          queue.push(entry.target as HTMLElement)
        }
        if (!queue.length) return
        // under the boot overlay nobody would see it
        if (!bootTarget.value) return show()
        const stop = watch(bootTarget, () => {
          stop()
          show()
        })
      }, {rootMargin: '0px 0px -10% 0px'})
      targets.forEach(target => observer.observe(target))
      observers.set(el, observer)
    },

    unmounted(el) {
      observers.get(el)?.disconnect()
    },
  }

  nuxtApp.vueApp.directive('reveal', reveal)
})
