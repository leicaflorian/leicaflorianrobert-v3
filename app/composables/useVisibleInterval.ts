import type {MaybeRefOrGetter} from 'vue'

/**
 * Calls `callback` every `ms` milliseconds while `target` is on screen, and never after
 * unmount: the animated widgets don't spend CPU when nobody is looking. With
 * `prefers-reduced-motion` it never runs, and the widget stays on its first frame.
 */
export function useVisibleInterval(target: MaybeRefOrGetter<HTMLElement | null | undefined>, callback: () => void, ms: number) {
  let timer: ReturnType<typeof setInterval> | undefined
  let observer: IntersectionObserver | undefined

  const stop = () => {
    clearInterval(timer)
    timer = undefined
  }

  onMounted(() => {
    const el = toValue(target)
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !timer) timer = setInterval(callback, ms)
      else if (!entry?.isIntersecting) stop()
    })
    observer.observe(el)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    stop()
  })
}
