<!--
  The "project.json" beside the native form: the draft written out as JSON while it's typed,
  with a counter of the filled-in fields that turns into "✓ valid".
-->
<script setup lang="ts">
const {t} = useI18n()
const draft = useContactDraft()

interface Row {
  key?: string
  value: string
  /** `value` is punctuation, not data: it stays grey. */
  punct?: boolean
  comma?: boolean
  depth: number
}

const quote = (value: string) => JSON.stringify(value)
const text = (value: string, max = 0) => {
  const clean = value.replace(/\s+/g, ' ').trim()
  if (!clean) return 'null'
  return quote(max && clean.length > max ? `${clean.slice(0, max)}…` : clean)
}

const rows = computed<Row[]>(() => {
  const {name, surname, email, message, project_types, budget, timeline} = draft.value
  const types = project_types.map(type => quote(t(`form.brief.options.types.${type}`)))
  return [
    {value: '{', punct: true, depth: 0},
    {key: t('form.name'), value: text(name), comma: true, depth: 1},
    {key: t('form.surname'), value: text(surname), comma: true, depth: 1},
    {key: t('form.email'), value: text(email), comma: true, depth: 1},
    {key: t('form.message'), value: text(message, 120), comma: true, depth: 1},
    {key: t('form.brief.json.project'), value: '{', punct: true, depth: 1},
    {key: t('form.brief.json.types'), value: types.length ? `[${types.join(', ')}]` : 'null', comma: true, depth: 2},
    {key: t('form.brief.json.budget'), value: budget ? quote(t(`form.brief.options.budget.${budget}`)) : 'null', comma: true, depth: 2},
    {key: t('form.brief.json.timeline'), value: timeline ? quote(t(`form.brief.options.timeline.${timeline}`)) : 'null', depth: 2},
    {value: '}', punct: true, depth: 1},
    {value: '}', punct: true, depth: 0},
  ]
})

const filled = computed(() => {
  const {name, surname, email, message, project_types, budget, timeline} = draft.value
  return [name.trim(), surname.trim(), email.trim(), message.trim(), project_types.length, budget, timeline].filter(Boolean).length
})
</script>

<template>
  <div class="sticky top-24 min-w-0 overflow-hidden rounded-2xl border border-line-card bg-bg-deep max-[860px]:static">
    <div class="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 text-xs text-subtle">
      <span class="flex items-center gap-1.5">
        <span v-for="i in 3" :key="i" class="size-[9px] rounded-full bg-gutter"/>
        <span class="ml-2">{{ $t('form.brief.json.file') }}</span>
      </span>
      <span :class="filled === 7 ? 'text-code-ok' : ''">{{ filled === 7 ? $t('form.brief.json.ready') : `${filled}/7` }}</span>
    </div>
    <div class="box-border flex min-h-80 flex-col py-6 pr-4 text-[13px] leading-[1.8]" aria-hidden="true">
      <div v-for="(row, i) in rows" :key="i" class="grid animate-[line-in_.25s_ease-out_both] grid-cols-[44px_minmax(0,1fr)]">
        <span class="pr-4 text-right text-gutter">{{ i + 1 }}</span>
        <span class="whitespace-pre-wrap break-words" :style="{paddingLeft: `${row.depth * 20}px`}">
          <span v-if="row.key" class="text-code-keyword">"{{ row.key }}": </span>
          <span :class="row.punct ? 'text-subtle' : row.value === 'null' ? 'text-ghost' : 'text-ink'">{{ row.value }}</span>
          <span v-if="row.comma" class="text-ghost">,</span>
        </span>
      </div>
    </div>
    <div class="border-t border-line px-4 py-3.5 text-[11px] leading-[1.6] text-faint">{{ $t('form.brief.json.note') }}</div>
  </div>
</template>
