import type {MaybeRefOrGetter} from 'vue'

/**
 * The `data-year` of the row of `list` sitting right under `bar` (the sticky timeline):
 * the year being read, so the timeline can light it up. `null` before the list reaches
 * the bar. Updated on scroll, at most once per frame; Lenis moves the real window scroll.
 */
export function useYearInView(
  list: MaybeRefOrGetter<HTMLElement | null | undefined>,
  bar: MaybeRefOrGetter<HTMLElement | null | undefined>,
) {
  const year = ref<number | null>(null)
  let frame = 0

  const update = () => {
    frame = 0
    const rows = toValue(list)?.children
    const line = toValue(bar)?.getBoundingClientRect().bottom
    if (!rows || line === undefined) return
    let current: number | null = null
    // the last row whose top has passed the bar (with a little slack) is the one being read
    for (const row of rows) {
      if (row.getBoundingClientRect().top > line + 24) break
      current = Number((row as HTMLElement).dataset.year) || current
    }
    year.value = current
  }
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }

  onMounted(() => {
    addEventListener('scroll', onScroll, {passive: true})
    update()
  })
  onBeforeUnmount(() => {
    removeEventListener('scroll', onScroll)
    cancelAnimationFrame(frame)
  })

  return year
}
