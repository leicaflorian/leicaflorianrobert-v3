import type {MaybeRefOrGetter} from 'vue'

/** Time per character, and the cap on the whole title, so long titles don't drag. */
const CHAR_MS = 35
const MAX_MS = 700

/** The CSS highlight (`::highlight(type-pending)` in main.css) that hides what isn't typed yet. */
let pending: Highlight | undefined

/**
 * Types the text of `target` once, the first time it comes into view, as in a terminal:
 * the part not typed yet is a CSS highlight painted transparent, so the DOM Vue owns is
 * never touched, the layout doesn't move and screen readers get the whole text.
 * `caret` is where the moving cursor goes (relative to `target`), `null` once done; it
 * sits on the baseline of `cursor`, the cursor at the end of the title.
 * Waits for the engine boot to end. With `prefers-reduced-motion`, or without the
 * Highlight API, the text is simply there.
 */
export function useTypewriter(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  cursor: MaybeRefOrGetter<HTMLElement | null | undefined>,
) {
  const caret = ref<{x: number, y: number} | null>(null)
  const {bootTarget} = useEngine()
  let range: Range | undefined
  let observer: IntersectionObserver | undefined
  let mutations: MutationObserver | undefined
  let resize: ResizeObserver | undefined
  let frame = 0
  let stopWatch: (() => void) | undefined

  /** Each character as [text node, offset], leading and trailing blanks left out. */
  function characters(el: HTMLElement) {
    const chars: [Text, number][] = []
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      for (let i = 0; i < node.length; i++) chars.push([node, i])
    }
    const blank = ([node, i]: [Text, number]) => /\s/.test(node.data[i]!)
    while (chars.length && blank(chars[0]!)) chars.shift()
    while (chars.length && blank(chars.at(-1)!)) chars.pop()
    return chars
  }

  function finish() {
    cancelAnimationFrame(frame)
    observer?.disconnect()
    mutations?.disconnect()
    resize?.disconnect()
    stopWatch?.()
    if (range) pending?.delete(range)
    range = undefined
    caret.value = null
  }

  /** Puts the caret after the `typed` characters: on their line, at the end cursor's baseline. */
  function place(el: HTMLElement, chars: [Text, number][], typed: number) {
    const end = toValue(cursor)
    const [node, offset] = chars[Math.max(typed - 1, 0)]!
    const char = document.createRange()
    char.setStart(node, offset)
    char.setEnd(node, offset + 1)
    const rect = char.getBoundingClientRect()
    const host = el.getBoundingClientRect()
    // the end cursor's top, measured from the bottom of the last character: the same on every line
    const last = chars.at(-1)!
    char.setStart(last[0], last[1])
    char.setEnd(last[0], last[1] + 1)
    const drop = end ? char.getBoundingClientRect().bottom - end.getBoundingClientRect().top : 0
    caret.value = {x: (typed ? rect.right : rect.left) - host.left, y: rect.bottom - drop - host.top}
  }

  function type(el: HTMLElement, chars: [Text, number][]) {
    const step = Math.min(CHAR_MS, MAX_MS / chars.length)
    const start = performance.now()
    const tick = (now: number) => {
      const typed = Math.min(Math.floor((now - start) / step), chars.length)
      if (typed === chars.length) return finish()
      const [node, offset] = chars[typed]!
      range!.setStart(node, offset)
      place(el, chars, typed)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }

  onMounted(() => {
    const el = toValue(target)
    if (!el || !('highlights' in CSS) || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const chars = characters(el)
    if (!chars.length) return

    if (!pending) CSS.highlights.set('type-pending', pending = new Highlight())
    range = document.createRange()
    range.setStart(...chars[0]!)
    range.setEnd(chars.at(-1)![0], chars.at(-1)![1] + 1)
    pending.add(range)
    place(el, chars, 0)
    // while waiting, the caret follows the title as the web font loads or the window resizes
    const wait = () => {
      if (range && !frame) place(el, chars, 0)
    }
    resize = new ResizeObserver(wait)
    resize.observe(el)
    document.fonts.ready.then(wait)

    // new text (a locale change) would leave the range on old nodes: just show it
    // (the caret coming and going is a mutation too, but adds no text)
    const isText = (node: Node) => node.nodeType === Node.TEXT_NODE
    mutations = new MutationObserver((records) => {
      if (records.some(r => r.type === 'characterData' || [...r.addedNodes, ...r.removedNodes].some(isText))) finish()
    })
    mutations.observe(el, {characterData: true, childList: true, subtree: true})

    const visible = ref(false)
    observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) visible.value = true
    }, {rootMargin: '0px 0px -10% 0px'})
    observer.observe(el)

    stopWatch = watch([visible, bootTarget], () => {
      if (!visible.value || bootTarget.value) return
      observer?.disconnect()
      stopWatch?.()
      resize?.disconnect()
      type(el, chars)
    })
  })

  onBeforeUnmount(finish)

  return caret
}
