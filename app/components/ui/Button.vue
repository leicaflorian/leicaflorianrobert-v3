<!-- Button or link: solid orange (primary) or outline only (secondary). -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** A page key (`contact`, `projects`…): the link points to the current language's version. */
  to?: string
  href?: string
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary'
  glow?: boolean
  disabled?: boolean
}>(), {variant: 'primary', type: 'button'})

const NuxtLink = resolveComponent('NuxtLink')
const pageLink = usePageLink()
const tag = computed(() => props.to ? NuxtLink : props.href ? 'a' : 'button')
</script>

<template>
  <component
    :is="tag"
    :to="to ? pageLink(to) : undefined"
    :href="href"
    :type="to || href ? undefined : type"
    :disabled="disabled"
    class="inline-flex items-center gap-2.5 rounded-[10px] px-6 py-[15px] text-sm transition-[transform,translate,scale,background-color,border-color] duration-[450ms] ease-spring disabled:cursor-wait disabled:opacity-60"
    :class="[
      variant === 'primary'
        ? 'cursor-pointer border-0 bg-accent font-bold text-bg hover:scale-[1.03] hover:bg-accent-hover hover:text-bg'
        : 'border border-line-strong font-medium text-ink hover:border-accent hover:text-ink',
      glow && 'shadow-[0_0_36px_rgb(255_91_20/0.3)] hover:-translate-y-0.5',
    ]"
  >
    <slot/>
  </component>
</template>
