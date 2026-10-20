<!-- Over the contact form while reCAPTCHA has no consent: why the form is off, how to turn it on, and the email instead. -->
<script setup lang="ts">
import type {Site} from '~/types/content'

const site = await useSingleton<Site>('site')
const {ready, manage} = useRecaptchaConsent()
</script>

<template>
  <div role="status" class="flex flex-col items-start gap-4 rounded-[14px] border border-line-card bg-surface p-6">
    <p class="m-0 font-sans text-[15px] leading-[1.6] text-ink-soft">{{ $t('form.consent.text') }}</p>
    <!-- CookieYes opens its preferences only once it has loaded: blocked, only the email is left -->
    <UiButton v-if="ready" @click="manage">{{ $t('form.consent.manage') }}</UiButton>
    <p class="m-0 font-sans text-[13px] text-subtle">
      <i18n-t keypath="form.consent.email" scope="global">
        <template #email><a :href="`mailto:${site.email}`" class="text-accent hover:text-accent-light">{{ site.email }}</a></template>
      </i18n-t>
    </p>
  </div>
</template>
