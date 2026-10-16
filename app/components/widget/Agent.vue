<!--
  A session with an AI coding agent: a request, the agent's steps one by one, then the
  review. How this site was built; the footer links to its case study.
-->
<script setup lang="ts">
const root = useTemplateRef<HTMLElement>('root')
const projectLink = useProjectLink()

/** The agent's lines: marker, its colour, text colour. The texts are in i18n. */
const LINES = [
  {mark: '⎿', markClass: 'text-gutter', textClass: 'text-subtle'},
  {mark: '⎿', markClass: 'text-gutter', textClass: 'text-subtle'},
  {mark: '⎿', markClass: 'text-gutter', textClass: 'text-code-ok'},
  {mark: '●', markClass: 'text-accent', textClass: 'text-ink'},
  {mark: '✓', markClass: 'text-code-ok', textClass: 'text-code-ok'},
]
/** How many lines are out: one more each tick, then a pause before starting again. */
const step = ref(0)

useVisibleInterval(root, () => {
  step.value = (step.value + 1) % (LINES.length + 2)
}, 1400)

const caseStudy = computed(() => projectLink({slug: 'v3', url: '', case_study: true}).href)
</script>

<template>
  <div ref="root" class="flex h-[340px] min-w-0 flex-col overflow-hidden rounded-2xl border border-line-card bg-bg-deep text-xs leading-[1.7]">
    <div class="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 text-subtle" aria-hidden="true">
      <span class="flex items-center gap-1.5">
        <span v-for="i in 3" :key="i" class="size-[9px] rounded-full bg-gutter"/>
        <span class="ml-2">claude code</span>
      </span>
      <span class="text-accent">● {{ $t('widgets.agent.session') }}</span>
    </div>
    <div class="flex flex-1 flex-col gap-1.5 px-5 py-[18px]" aria-hidden="true">
      <span class="text-ink"><span class="text-subtle">›</span> {{ $t('widgets.agent.prompt') }}</span>
      <span
        v-for="(line, i) in LINES"
        :key="i"
        class="flex gap-2.5 transition-[opacity,translate] duration-300"
        :class="i < step ? 'opacity-100' : 'translate-y-1 opacity-0'"
      >
        <span class="shrink-0" :class="line.markClass">{{ line.mark }}</span>
        <span :class="line.textClass">{{ $t(`widgets.agent.steps.${i}`) }}</span>
      </span>
    </div>
    <div class="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-[11px] text-subtle">
      <span>{{ $t('widgets.agent.footer') }}</span>
      <NuxtLink :to="caseStudy" class="shrink-0 text-accent">./case-study →</NuxtLink>
    </div>
  </div>
</template>
