<script setup lang="ts">
import type {BlockHeroHome} from '~/types/content'

defineProps<{block: BlockHeroHome}>()
</script>

<template>
  <div class="grid grid-cols-[220px_1fr] items-start gap-6 max-[860px]:grid-cols-1">
    <LegacyPhoto :caption="$t('home.legacy.figure')"/>
    <div>
      <h2 class="m-0 mb-2.5 text-2xl font-bold">{{ $t('home.legacy.title') }}</h2>
      <p class="m-0 mb-3">{{ block.legacy_text }}</p>
    </div>
  </div>
</template>
