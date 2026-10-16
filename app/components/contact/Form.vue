<!-- The "Parliamone" (let's talk) form, the same on Home and Contact: the project brief, then the fields. -->
<script setup lang="ts">
import type {ContactMessage} from '~/composables/useContactForm'
import type {BriefType} from '~/utils/brief'

const {draft, status, submit} = useContactForm()

const field = 'rounded-[10px] border border-line-control bg-bg p-3.5 font-mono text-sm text-ink outline-none placeholder:text-dim focus:border-accent focus:shadow-[0_0_0_3px_rgb(255_91_20/0.2)]'
const label = 'flex flex-col gap-2 text-xs text-subtle'

function toggleType(type: BriefType) {
  const types = draft.value.project_types
  draft.value.project_types = types.includes(type) ? types.filter(t => t !== type) : [...types, type]
}

/** Budget and timeline: one choice, clicking it again clears it. */
function pick<K extends 'budget' | 'timeline'>(key: K, value: NonNullable<ContactMessage[K]>) {
  draft.value[key] = draft.value[key] === value ? null : value
}

const groups = computed(() => [
  {key: 'types' as const, options: BRIEF_OPTIONS.types.map(o => ({o, on: draft.value.project_types.includes(o), toggle: () => toggleType(o)}))},
  {key: 'budget' as const, options: BRIEF_OPTIONS.budget.map(o => ({o, on: draft.value.budget === o, toggle: () => pick('budget', o)}))},
  {key: 'timeline' as const, options: BRIEF_OPTIONS.timeline.map(o => ({o, on: draft.value.timeline === o, toggle: () => pick('timeline', o)}))},
])
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="submit">
    <div class="mb-2 flex flex-col gap-6 border-b border-line-card pb-7">
      <div v-for="group in groups" :key="group.key" class="flex flex-col gap-2.5">
        <span class="text-xs text-subtle">{{ $t(`form.brief.${group.key}`) }}</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="{o, on, toggle} in group.options"
            :key="o"
            type="button"
            :aria-pressed="on"
            class="min-h-10 cursor-pointer rounded-full border px-3.5 font-mono text-[13px] transition-colors duration-300 hover:border-accent"
            :class="on ? 'border-accent bg-accent text-bg' : 'border-line-control bg-transparent text-ink-soft'"
            @click="toggle"
          >
            {{ $t(`form.brief.options.${group.key}.${o}`) }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
      <label :class="label">{{ $t('form.name') }}
        <input v-model="draft.name" type="text" name="name" required autocomplete="given-name" :placeholder="$t('form.namePlaceholder')" :class="field">
      </label>
      <label :class="label">{{ $t('form.surname') }}
        <input v-model="draft.surname" type="text" name="surname" autocomplete="family-name" :placeholder="$t('form.surnamePlaceholder')" :class="field">
      </label>
    </div>
    <label :class="label">{{ $t('form.email') }}
      <input v-model="draft.email" type="email" name="email" required autocomplete="email" :placeholder="$t('form.emailPlaceholder')" :class="field">
    </label>
    <label :class="label">{{ $t('form.message') }}
      <textarea v-model="draft.message" name="message" rows="5" required :placeholder="$t('form.messagePlaceholder')" :class="[field, 'resize-y']"/>
    </label>

    <div class="mt-2 flex flex-wrap items-center gap-4">
      <UiButton type="submit" :disabled="status === 'sending'">
        {{ status === 'sending' ? $t('form.sending') : $t('form.submit') }}
      </UiButton>
      <span class="min-w-[220px] flex-1 text-[11px] leading-[1.6] text-faint">{{ $t('form.recaptcha') }}</span>
    </div>

    <p v-if="status === 'sent'" role="status" class="m-0 text-sm text-code-string">{{ $t('form.sent') }}</p>
    <p v-else-if="status === 'error'" role="alert" class="m-0 text-sm text-accent">{{ $t('form.error') }}</p>
  </form>
</template>
