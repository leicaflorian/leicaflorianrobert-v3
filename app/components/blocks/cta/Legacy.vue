<script setup lang="ts">
import type {BlockCta} from '~/types/content'

defineProps<{block: BlockCta}>()
</script>

<template>
  <p class="m-0 mt-6">
    <b>{{ block.title }} {{ block.title_accent }}</b>
    <template v-if="block.text"> {{ block.text }}</template>
    <LegacyLink to="contact">{{ $t('common.contactMe') }}</LegacyLink>
  </p>
</template>
