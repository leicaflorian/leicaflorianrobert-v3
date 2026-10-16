import type {MaybeRefOrGetter} from 'vue'

/**
 * The index of the paragraph of `list` being read: the last whose top has passed 45% of
 * the viewport, as in the design. Updated on scroll, at most once per frame.
 */
export function useParagraphInView(list: MaybeRefOrGetter<HTMLElement | null | undefined>) {
  const index = ref(0)
  let frame = 0

  const update = () => {
    frame = 0
    const paragraphs = toValue(list)?.children
    if (!paragraphs) return
    const line = innerHeight * 0.45
    let current = 0
    Array.from(paragraphs).forEach((p, i) => {
      if (p.getBoundingClientRect().top < line) current = i
    })
    index.value = current
  }
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }

  /** Scrolls paragraph `i` to just under the top third of the viewport (smoothly, with Lenis). */
  const goTo = (i: number) => {
    const p = toValue(list)?.children[i]
    if (p) scrollTo({top: scrollY + p.getBoundingClientRect().top - innerHeight * 0.3, behavior: 'smooth'})
  }

  onMounted(() => {
    addEventListener('scroll', onScroll, {passive: true})
    addEventListener('resize', onScroll)
    update()
  })
  onBeforeUnmount(() => {
    removeEventListener('scroll', onScroll)
    removeEventListener('resize', onScroll)
    cancelAnimationFrame(frame)
  })

  return {index, goTo}
}
