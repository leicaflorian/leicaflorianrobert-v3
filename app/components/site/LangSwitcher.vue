<!-- The "--lang=it" language switcher: leads to the same page in the chosen language. -->
<script setup lang="ts">
const {locale, locales, t} = useI18n()
const switchLocalePath = useSwitchLocalePath()

const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')

function onDocumentClick(event: MouseEvent) {
  if (open.value && !root.value?.contains(event.target as Node)) open.value = false
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      :aria-label="t('lang.label')"
      aria-haspopup="listbox"
      :aria-expanded="open"
      class="-ml-1.5 flex cursor-pointer items-center gap-1.5 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-[13px] text-subtle hover:border-line-control hover:bg-surface hover:text-ink-soft"
      @click="open = !open"
    >
      <span>--lang=<span class="text-accent">{{ locale }}</span></span>
      <span class="text-[9px]">▾</span>
    </button>

    <Transition
      enter-active-class="transition-[opacity,translate] duration-200 ease-out"
      leave-active-class="transition-[opacity,translate] duration-150 ease-in"
      enter-from-class="opacity-0 motion-safe:-translate-y-1.5"
      leave-to-class="opacity-0 motion-safe:-translate-y-1.5"
    >
      <ul
        v-if="open"
        role="listbox"
        class="absolute -left-1.5 top-[calc(100%+8px)] z-60 m-0 min-w-[200px] list-none rounded-[10px] border border-line-control bg-surface p-1.5 text-[13px] shadow-[0_16px_40px_rgb(0_0_0/0.5)]"
      >
        <li v-for="l in locales" :key="l.code">
          <NuxtLink
            :to="switchLocalePath(l.code)"
            role="option"
            :aria-selected="l.code === locale"
            class="grid w-full grid-cols-[14px_28px_1fr] items-center gap-1.5 rounded-md px-2.5 py-[9px] hover:bg-surface-hover hover:text-ink"
            :class="l.code === locale ? 'text-ink' : 'text-ink-soft'"
            @click="open = false"
          >
            <span class="text-accent">{{ l.code === locale ? '>' : '' }}</span>
            <span>{{ l.code }}</span>
            <span class="text-subtle">{{ l.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </Transition>
  </div>
</template>
