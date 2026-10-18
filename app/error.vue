<script setup lang="ts">
import type {NuxtError} from '#app'

const props = defineProps<{error: NuxtError}>()
const notFound = computed(() => props.error.statusCode === 404)
</script>

<template>
  <div class="flex min-h-screen items-center bg-bg font-mono text-ink">
    <div class="page">
      <UiSectionLabel>// {{ error.statusCode }}</UiSectionLabel>
      <UiPageTitle>{{ notFound ? $t('error.title') : error.statusMessage }}</UiPageTitle>
      <p class="mt-8 max-w-[520px] text-[15px] leading-[1.8] text-muted">{{ notFound ? $t('error.text') : error.message }}</p>
      <UiButton class="mt-11" @click="clearError({redirect: $localePath('/')})"><UiArrowText :text="$t('error.back')"/></UiButton>
    </div>
  </div>
</template>
