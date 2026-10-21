<!--
  What takes the native form's place once it's sent: a terminal that runs the sending step by
  step, then thanks the visitor, or prints the error with the way back to the filled-in form.
-->
<script setup lang="ts">
import type {ContactStatus} from '~/composables/useContactForm'

const props = defineProps<{
  status: ContactStatus
  /** The thank-you line, with the visitor's name. */
  thanks: string
}>()
defineEmits<{again: []}>()

const STEPS = ['pack', 'robot', 'deliver'] as const
const LAST = STEPS.length - 1
/** Between one step and the next: they show even when the server answers at once. */
const STEP_MS = 550

const el = ref<HTMLElement>()
/** The step running now. The last one waits for the server's answer. */
const current = ref(0)
const done = computed(() => current.value === LAST && props.status !== 'sending')
const sent = computed(() => done.value && props.status === 'sent')

function state(i: number): 'ok' | 'fail' | 'pending' {
  if (i < current.value) return 'ok'
  if (i === LAST && done.value) return sent.value ? 'ok' : 'fail'
  return 'pending'
}

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) current.value = LAST
  else timer = setInterval(() => current.value < LAST ? current.value++ : clearInterval(timer), STEP_MS)
  // the button was at the bottom of a long form: bring the terminal into view
  const top = el.value!.getBoundingClientRect().top
  if (top < 80 || top > innerHeight * 0.6) scrollTo({top: scrollY + top - 96, behavior: reduced ? 'auto' : 'smooth'})
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div ref="el" class="min-w-0 overflow-hidden rounded-2xl border border-line-card bg-bg-deep font-mono text-[13px] leading-[1.8]">
    <div class="flex items-center gap-1.5 border-b border-line bg-surface px-4 py-3 text-xs text-subtle">
      <span v-for="i in 3" :key="i" class="size-[9px] rounded-full bg-gutter"/>
      <span class="ml-2">{{ $t('form.terminal.title') }}</span>
    </div>
    <div class="flex flex-col p-6 max-[860px]:p-5" aria-live="polite">
      <span class="text-ink-soft"><span class="text-code-ok">$</span> {{ $t('form.terminal.command') }}</span>
      <template v-for="(step, i) in STEPS" :key="step">
        <span v-if="i <= current" class="flex items-baseline gap-2 text-subtle">
          <span>&gt; {{ $t(`form.terminal.steps.${step}`) }}</span>
          <span class="min-w-4 flex-1 border-b border-dotted border-gutter" aria-hidden="true"/>
          <span v-if="state(i) === 'ok'" class="text-code-ok">{{ $t('form.terminal.ok') }}</span>
          <span v-else-if="state(i) === 'fail'" class="text-accent">{{ $t('form.terminal.fail') }}</span>
          <span v-else class="text-dim motion-safe:animate-pulse">...</span>
        </span>
      </template>

      <template v-if="sent">
        <span class="mt-4 text-[15px] font-bold text-code-ok">✓ {{ $t('form.terminal.sent') }}</span>
        <span class="text-ink">{{ thanks }} {{ $t('form.terminal.reply') }}</span>
        <span class="text-muted">{{ $t('form.terminal.coffee') }}</span>
      </template>
      <span v-else-if="done" role="alert" class="mt-4 text-accent">✗ {{ $t('form.error') }}</span>

      <span v-if="done" class="mt-4 text-ink-soft"><span class="text-code-ok">$</span><UiBlinkCursor/></span>
      <UiButton v-if="done" :variant="sent ? 'secondary' : 'primary'" class="mt-6 self-start max-[860px]:w-full max-[860px]:justify-center" @click="$emit('again')">
        {{ $t(sent ? 'form.terminal.again' : 'form.terminal.retry') }}<UiArrowIcon class="size-3.5"/>
      </UiButton>
    </div>
  </div>
</template>
