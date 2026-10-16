<!--
  "What can I do for you?" as a guide in a terminal: the visitor describes the project,
  the guide matches keywords (no AI, and it says so) and suggests services, which carry
  over to the contact form. Beside it, the services one by one: hovered, or in turn.
-->
<script setup lang="ts">
import type {Service, ServiceIcon} from '~/types/content'

const props = defineProps<{services: Service[]}>()

const {t} = useI18n()
const draft = useContactDraft()

type Line = {kind: 'user' | 'step' | 'answer', text: string}
const phase = ref<'idle' | 'searching' | 'done'>('idle')
const log = ref<Line[]>([])
const suggested = ref<ServiceIcon[]>([])
const selected = ref<ServiceIcon[]>([])
const input = ref('')

/** The service shown on the right: hovered, else the suggestion in focus, else the next in turn. */
const hovered = ref<ServiceIcon | null>(null)
const focused = ref<ServiceIcon | null>(null)
const turn = ref(0)
const shown = computed(() => {
  const icon = hovered.value ?? focused.value
  return props.services.find(s => s.icon === icon) ?? props.services[turn.value % props.services.length]
})

const SUGGESTIONS = ['a', 'b', 'c', 'd'] as const
const icons = computed(() => props.services.map(s => s.icon))
const serviceOf = (icon: ServiceIcon) => props.services.find(s => s.icon === icon)!

let timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, step: () => void) => timers.push(setTimeout(step, ms))
function stop() {
  timers.forEach(clearTimeout)
  timers = []
}

/** Reads a request; `only` skips the keywords (a service picked from the list). */
function ask(text: string, only?: ServiceIcon[]) {
  const request = text.trim()
  if (!request || phase.value === 'searching') return
  stop()
  const found = only ?? matchServices(request, icons.value)
  phase.value = 'searching'
  log.value = [{kind: 'user', text: request}]
  suggested.value = []
  selected.value = []
  focused.value = null
  input.value = ''
  later(350, () => log.value.push({kind: 'step', text: t('services.guide.searching')}))
  later(700, () => log.value.push({kind: 'step', text: found.length ? t('services.guide.found', found.length) : t('services.guide.none')}))
  later(1000, () => {
    const result = found.length ? found : (['consulenza', 'web'] as ServiceIcon[]).filter(i => icons.value.includes(i))
    log.value.push({kind: 'answer', text: t(found.length ? 'services.guide.answer' : 'services.guide.fallback')})
    suggested.value = result
    selected.value = [...result]
    focused.value = result[0] ?? null
    phase.value = 'done'
    // the focus moves to "continue in the form ↵", so Enter does what it says
    nextTick(() => go.value?.focus({preventScroll: true}))
  })
}

function toggle(icon: ServiceIcon) {
  focused.value = icon
  selected.value = selected.value.includes(icon) ? selected.value.filter(i => i !== icon) : [...selected.value, icon]
}

function restart() {
  stop()
  phase.value = 'idle'
  log.value = []
  suggested.value = []
  selected.value = []
  focused.value = null
  input.value = ''
}

/** Carries the chosen services over to the contact form below, as project types. */
function toForm(event: MouseEvent) {
  if (!selected.value.length) return event.preventDefault()
  draft.value.project_types = [...new Set([...draft.value.project_types, ...selected.value.map(i => SERVICE_BRIEF[i])])]
}

/** The results as a terminal list: ↑ ↓ move the cursor, Space ticks, Enter goes on to the form. */
function onKey(event: KeyboardEvent) {
  const count = suggested.value.length
  const at = suggested.value.indexOf(focused.value!)
  if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && count) {
    event.preventDefault()
    focused.value = suggested.value[(at + (event.key === 'ArrowDown' ? 1 : count - 1) + count) % count] ?? null
  } else if (event.key === ' ' && focused.value && !(event.target instanceof HTMLButtonElement)) {
    // on a suggestion's own button, Space already clicks it
    event.preventDefault()
    toggle(focused.value)
  }
}

const root = useTemplateRef('root')
const go = useTemplateRef('go')
useVisibleInterval(root, () => {
  if (!hovered.value && !focused.value) turn.value++
}, 3500)
onBeforeUnmount(stop)
</script>

<template>
  <div ref="root" class="overflow-hidden rounded-2xl border border-line-card bg-bg-deep">
    <div class="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 text-xs text-subtle">
      <span class="flex items-center gap-2.5">
        <span class="flex size-[22px] items-center justify-center rounded-md bg-accent text-[9px] font-extrabold text-bg">lfr</span>
        <span class="text-ink">{{ $t('services.guide.name') }}</span>
        <span>· v3</span>
      </span>
      <button
        type="button"
        class="cursor-pointer rounded-md border border-line-control bg-transparent px-2 py-1 font-mono text-[11px] text-subtle hover:border-gutter hover:text-ink"
        @click="restart"
      >
        ↺ {{ $t('services.guide.restart') }}
      </button>
    </div>

    <div class="grid min-h-[520px] grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] max-[900px]:grid-cols-1">
      <div class="flex flex-col border-r border-line max-[900px]:border-r-0 max-[900px]:border-b">
        <div class="flex flex-1 flex-col gap-3.5 px-8 py-7 text-sm leading-[1.65] max-[560px]:px-5" aria-live="polite">
          <p class="m-0 flex gap-3"><span class="text-accent">●</span><span class="text-ink">{{ $t('services.guide.hello') }}</span></p>
          <p
            v-for="(line, i) in log"
            :key="i"
            class="m-0 flex gap-3 motion-safe:animate-[line-in_.25s_ease-out_both]"
            :class="line.kind === 'step' ? 'text-xs text-subtle' : 'text-ink'"
          >
            <span class="shrink-0" :class="{user: 'text-ghost', step: 'text-gutter', answer: 'text-accent'}[line.kind]">
              {{ {user: '›', step: '⎿', answer: '●'}[line.kind] }}
            </span>
            <span>{{ line.text }}</span>
          </p>

          <div v-if="phase === 'done'" class="ml-6 flex flex-col gap-1 motion-safe:animate-[line-in_.3s_ease-out_both]" @keydown="onKey">
            <button
              v-for="icon in suggested"
              :key="icon"
              type="button"
              :aria-pressed="selected.includes(icon)"
              class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border-0 px-3 text-left font-mono text-sm"
              :class="[focused === icon ? 'bg-surface' : 'bg-transparent', selected.includes(icon) || focused === icon ? 'text-ink' : 'text-subtle']"
              @click="toggle(icon)"
              @mouseenter="focused = icon"
            >
              <span class="w-3 text-accent">{{ focused === icon ? '❯' : '' }}</span>
              <span :class="selected.includes(icon) ? 'text-accent' : 'text-ghost'">{{ selected.includes(icon) ? '◉' : '◯' }}</span>
              <span class="flex-1">{{ serviceOf(icon).title }}</span>
              <span class="text-[11px] text-ghost max-[560px]:hidden">{{ $t(`services.guide.why.${icon}`) }}</span>
            </button>
            <div class="mt-3 flex flex-wrap items-center gap-4">
              <a
                ref="go"
                href="#contact-form"
                class="rounded-[10px] px-[18px] py-3 text-[13px] font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-deep"
                :class="selected.length ? 'bg-accent text-bg hover:bg-accent-hover hover:text-bg' : 'pointer-events-none bg-surface-hover text-subtle'"
                :aria-disabled="!selected.length"
                @click="toForm"
              >{{ $t('services.guide.continue') }}</a>
              <span class="text-xs text-subtle">
                {{ selected.length ? $t('services.guide.selected', selected.length) : $t('services.guide.pickOne') }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 border-t border-line px-8 pt-4 pb-6 max-[560px]:px-5">
          <div v-if="phase === 'idle'" class="flex flex-wrap gap-2">
            <button
              v-for="key in SUGGESTIONS"
              :key="key"
              type="button"
              class="cursor-pointer rounded-full border border-line-control bg-transparent px-3 py-2 font-mono text-xs text-ink-soft hover:border-accent hover:text-ink"
              @click="ask($t(`services.guide.suggestions.${key}`))"
            >
              {{ $t(`services.guide.suggestions.${key}`) }}
            </button>
          </div>
          <form
            class="flex items-center gap-3 rounded-xl border border-line-control bg-bg px-3.5 py-3 transition-colors focus-within:border-accent"
            @submit.prevent="ask(input)"
          >
            <span class="font-bold text-accent">›</span>
            <input
              v-model="input"
              type="text"
              :aria-label="$t('services.guide.label')"
              :placeholder="$t('services.guide.placeholder')"
              class="min-w-0 flex-1 border-0 bg-transparent font-mono text-sm text-ink outline-none placeholder:text-dim"
            >
            <button type="submit" class="cursor-pointer rounded-md border-0 bg-surface-hover px-2.5 py-1.5 font-mono text-[11px] text-ink-soft hover:bg-accent hover:text-bg">
              {{ $t('services.guide.send') }}
            </button>
          </form>
        </div>
      </div>

      <div class="flex flex-col">
        <div v-if="shown" class="h-[220px] shrink-0 border-b border-line">
          <ServiceVisual :key="shown.id" :service="shown"/>
        </div>
        <!-- every text in the same cell, only the shown one visible: always as tall as the longest -->
        <div class="grid border-b border-line px-6 py-5">
          <div
            v-for="service in services"
            :key="service.id"
            class="flex flex-col gap-1.5 transition-opacity duration-200 [grid-area:1/1]"
            :class="shown?.id === service.id ? 'opacity-100' : 'invisible opacity-0'"
            :aria-hidden="shown?.id !== service.id"
          >
            <span class="text-base font-bold">{{ service.title }}</span>
            <span class="text-[13px] leading-[1.65] text-pretty text-ink-soft">{{ service.text }}</span>
          </div>
        </div>
        <div class="flex flex-col px-3 pt-3 pb-4" @mouseleave="hovered = null">
          <span class="px-3 pt-1 pb-2 text-[11px] tracking-[0.08em] text-ghost uppercase">{{ $t('services.guide.services') }}</span>
          <button
            v-for="(service, i) in services"
            :key="service.id"
            type="button"
            class="grid min-h-9 cursor-pointer grid-cols-[28px_minmax(0,1fr)_14px] items-center gap-2 rounded-lg border-0 px-3 text-left font-mono text-[13px] transition-colors"
            :class="shown?.id === service.id ? 'bg-surface text-ink' : 'bg-transparent text-subtle'"
            @mouseenter="hovered = service.icon"
            @focus="hovered = service.icon"
            @click="ask($t('services.guide.interested', {title: service.title}), [service.icon])"
          >
            <span class="text-[11px]" :class="shown?.id === service.id ? 'text-accent' : 'text-ghost'">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="truncate">{{ service.title }}</span>
            <span class="text-accent">{{ selected.includes(service.icon) ? '◉' : '' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
