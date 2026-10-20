<!--
  A "'90s" link: blue and underlined; purple if it points to the current page.
  Links to other sites open in a new tab, as in native.
-->
<script setup lang="ts">
const props = defineProps<{
  /** A page key (`home`, `about`…): the link points to the current language's version. */
  to?: string
  href?: string
  current?: boolean
}>()

const pageLink = usePageLink()
const external = computed(() => /^https?:\/\//.test(props.href ?? ''))
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="pageLink(to)"
    class="underline hover:underline"
    :class="current ? 'text-legacy-visited hover:text-legacy-visited' : 'text-legacy-link hover:text-legacy-link'"
  >
    <slot/>
  </NuxtLink>
  <a
    v-else
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
    class="text-legacy-link underline hover:text-legacy-link hover:underline"
  >
    <slot/>
  </a>
</template>
