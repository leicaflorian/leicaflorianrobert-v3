<!--
  A lesson on async/await, step by step: the call stack, the microtask queue and a chat
  that loads without blocking. The captions are in i18n (`widgets.lesson.steps`).
-->
<script setup lang="ts">
const {t} = useI18n()
const root = useTemplateRef<HTMLElement>('root')

interface Step {
  stack: string[]
  queue?: string[]
  /** Index of the caption; the last step repeats the one before, as a pause. */
  caption: number
  /** Loader shown, question shown, answer shown, event loop at work. */
  loading?: boolean
  question?: boolean
  answer?: boolean
  loop?: boolean
}

const STEPS: Step[] = [
  {stack: ['main()'], caption: 0},
  {stack: ['main()', 'fetchMessages()'], caption: 1},
  {stack: ['main()', 'fetchMessages()', 'fetch(url)'], caption: 2},
  {stack: ['main()'], caption: 3, loading: true},
  {stack: ['main()', 'renderChat()'], caption: 4, loading: true},
  {stack: [], caption: 5, loading: true},
  {stack: [], queue: ['fetchMessages ↩'], caption: 6, loading: true},
  {stack: ['fetchMessages ↩'], caption: 7, loading: true, loop: true},
  {stack: ['fetchMessages ↩', 'renderChat(msgs)'], caption: 8, question: true},
  {stack: [], caption: 9, question: true, answer: true},
  {stack: [], caption: 9, question: true, answer: true},
]

const step = ref(0)
const current = computed(() => STEPS[step.value]!)
const caption = computed(() => t(`widgets.lesson.steps.${current.value.caption}`))

useVisibleInterval(root, () => {
  step.value = (step.value + 1) % STEPS.length
}, 1400)

const bubble = (shown?: boolean) => shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
</script>

<template>
  <div ref="root" class="flex h-[340px] min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-line-card bg-surface p-5" aria-hidden="true">
    <div class="flex justify-between text-[11px] text-subtle">
      <span>{{ $t('widgets.lesson.lesson') }} 04 / 12</span>
      <span class="text-accent">{{ $t('widgets.lesson.live') }}</span>
    </div>
    <span class="text-lg font-extrabold tracking-[-0.02em]">async / await</span>
    <div class="grid grid-cols-2 gap-2.5 text-[11px]">
      <div class="flex h-[90px] flex-col gap-[3px] overflow-hidden rounded-lg border border-line-control px-2.5 py-2">
        <span class="text-subtle">call stack</span>
        <div class="flex flex-col-reverse gap-[3px]">
          <span
            v-for="(frame, i) in current.stack"
            :key="frame"
            class="animate-[line-in_.25s_ease-out_both] rounded px-1.5 py-px"
            :class="i === current.stack.length - 1 ? 'bg-accent/14 text-accent' : 'text-ink'"
          >{{ frame }}</span>
        </div>
      </div>
      <div class="flex h-[90px] flex-col gap-[3px] overflow-hidden rounded-lg border border-dashed border-line-control px-2.5 py-2">
        <span class="text-subtle">microtask queue</span>
        <span
          v-for="task in current.queue"
          :key="task"
          class="animate-[line-in_.25s_ease-out_both] rounded border border-dashed border-accent px-1.5 py-px text-code-keyword"
        >{{ task }}</span>
      </div>
    </div>
    <div class="flex items-center gap-2 text-[11px] transition-colors duration-200" :class="current.loop ? 'text-accent' : 'text-subtle'">
      <span class="h-px flex-1" :class="current.loop ? 'bg-accent' : 'bg-line-control'"/>
      <span class="whitespace-nowrap">{{ caption }}</span>
      <span class="h-px flex-1" :class="current.loop ? 'bg-accent' : 'bg-line-control'"/>
    </div>
    <div class="relative mt-auto flex flex-col gap-1.5">
      <div
        class="absolute left-0 top-0 flex items-center gap-2 rounded-[10px_10px_10px_2px] border border-dashed border-line-control px-2.5 py-[7px] text-[11px] text-subtle transition-opacity duration-300"
        :class="current.loading ? 'opacity-100' : 'opacity-0'"
      >
        <span class="animate-cursor text-accent">●</span>{{ $t('widgets.lesson.loading') }}
      </div>
      <div class="max-w-[85%] self-start rounded-[10px_10px_10px_2px] bg-surface-hover px-2.5 py-[7px] text-[11px] text-ink-soft transition duration-300" :class="bubble(current.question)">
        {{ $t('widgets.lesson.question') }}
      </div>
      <div class="max-w-[85%] self-end rounded-[10px_10px_2px_10px] bg-accent px-2.5 py-[7px] text-[11px] font-bold text-bg transition duration-300" :class="bubble(current.answer)">
        {{ $t('widgets.lesson.answer') }}
      </div>
    </div>
  </div>
</template>
