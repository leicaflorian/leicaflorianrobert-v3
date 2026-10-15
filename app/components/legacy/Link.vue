<!-- A "'90s" link: blue and underlined; purple if it points to the current page. -->
<script setup lang="ts">
defineProps<{
  /** The route name (`index`, `about`…): the link points to the current language's version. */
  to?: string
  href?: string
  current?: boolean
}>()
</script>

<template>
  <NuxtLinkLocale
    v-if="to"
    :to="to"
    class="underline hover:underline"
    :class="current ? 'text-legacy-visited hover:text-legacy-visited' : 'text-legacy-link hover:text-legacy-link'"
  >
    <slot/>
  </NuxtLinkLocale>
  <a v-else :href="href" class="text-legacy-link underline hover:text-legacy-link hover:underline">
    <slot/>
  </a>
</template>
