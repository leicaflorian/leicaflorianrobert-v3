<!-- The "Parliamone" (let's talk) form, the same on Home and Contact. -->
<script setup lang="ts">
const {status, submit} = useContactForm()

const field = 'rounded-[10px] border border-line-control bg-bg p-3.5 font-mono text-sm text-ink outline-none placeholder:text-dim focus:border-accent focus:shadow-[0_0_0_3px_rgb(255_91_20/0.2)]'
const label = 'flex flex-col gap-2 text-xs text-subtle'
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="submit">
    <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
      <label :class="label">{{ $t('form.name') }}
        <input type="text" name="name" required autocomplete="given-name" :placeholder="$t('form.namePlaceholder')" :class="field">
      </label>
      <label :class="label">{{ $t('form.surname') }}
        <input type="text" name="surname" autocomplete="family-name" :placeholder="$t('form.surnamePlaceholder')" :class="field">
      </label>
    </div>
    <label :class="label">{{ $t('form.email') }}
      <input type="email" name="email" required autocomplete="email" :placeholder="$t('form.emailPlaceholder')" :class="field">
    </label>
    <label :class="label">{{ $t('form.message') }}
      <textarea name="message" rows="5" required :placeholder="$t('form.messagePlaceholder')" :class="[field, 'resize-y']"/>
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
