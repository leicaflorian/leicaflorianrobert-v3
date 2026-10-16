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
    const bottom = toValue(bar)?.getBoundingClientRect().bottom
    if (!rows?.length || bottom === undefined) return
    // A row reached from the timeline stops at its scroll margin, a little under the bar:
    // read from there (plus slack for sub-pixel scroll), so the clicked year is the one lit.
    const line = Math.max(bottom, parseFloat(getComputedStyle(rows[0]!).scrollMarginTop) || 0) + 8
    let current: number | null = null
    // the last row whose top has reached the line is the one being read
    for (const row of rows) {
      if (row.getBoundingClientRect().top > line) break
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
