<!-- Over the legacy contact form while reCAPTCHA has no consent: the same notice as native, as a '90s box. -->
<script setup lang="ts">
import type {Site} from '~/types/content'

const site = await useSingleton<Site>('site')
const {ready, manage, accept} = useRecaptchaConsent()
</script>

<template>
  <div role="status" class="flex flex-col items-start gap-2 border-2 border-legacy-shadow border-r-legacy-light border-b-legacy-light bg-legacy-frame p-3">
    <p class="m-0"><b>{{ $t('form.consent.text') }}</b></p>
    <div v-if="ready" class="flex flex-wrap gap-2">
      <button type="button" class="cursor-pointer border-2 border-legacy-light border-r-legacy-shadow border-b-legacy-shadow bg-legacy-face px-3 py-1 font-legacy-mono text-sm text-black active:border-legacy-shadow active:border-r-legacy-light active:border-b-legacy-light font-bold" @click="accept">{{ $t('form.consent.accept') }}</button>
      <button type="button" class="cursor-pointer border-2 border-legacy-light border-r-legacy-shadow border-b-legacy-shadow bg-legacy-face px-3 py-1 font-legacy-mono text-sm text-black active:border-legacy-shadow active:border-r-legacy-light active:border-b-legacy-light" @click="manage">{{ $t('form.consent.manage') }}</button>
    </div>
    <p class="m-0 text-sm">
      <i18n-t keypath="form.consent.email" scope="global">
        <template #email><LegacyLink :href="`mailto:${site.email}`">{{ site.email }}</LegacyLink></template>
      </i18n-t>
    </p>
    <!-- legacy only: the '90s had cookies, not consent banners -->
    <p class="m-0 text-sm text-legacy-note"><i>{{ $t('form.consent.legacyNote') }}</i></p>
  </div>
</template>
