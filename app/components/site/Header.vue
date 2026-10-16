<!--
  The native-mode header: logo with the page path, language, menu and GPU button.
  Below 760px, menu and GPU move into a panel opened by the "menu" button,
  laid over the page rather than pushing it down.
-->
<script setup lang="ts">
const {t} = useI18n()
const route = useRoute()
const {toggle} = useEngine()
const menu = useMenu()
const path = useCurrentPath()
const pageLink = usePageLink()

/** The menu label, like a relative path: `./chi-sono`, `./home`. */
const labelOf = (slug: string) => `./${slug || 'home'}`
/** The page path as a terminal prompt: `~/leica/progetti/v3`. */
const pathLabel = computed(() => ['~/leica', path.value].filter(Boolean).join('/'))

const menuOpen = ref(false)
watch(() => route.fullPath, () => (menuOpen.value = false))

function onResize() {
  if (menuOpen.value && window.innerWidth > 760) menuOpen.value = false
}

onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
    <nav class="page flex flex-wrap items-center justify-between gap-4 py-3">
      <div class="flex items-center gap-3">
        <NuxtLink :to="pageLink('home')" class="flex items-center gap-3 text-ink hover:text-ink">
          <SiteLogo/>
          <span class="text-[13px] text-subtle max-[1000px]:hidden">{{ pathLabel }}</span>
        </NuxtLink>
        <SiteLangSwitcher/>
      </div>

      <button
        type="button"
        :aria-expanded="menuOpen"
        class="hidden min-h-11 cursor-pointer items-center gap-2.5 rounded-[10px] border border-line-control bg-surface px-3.5 text-[13px] text-ink max-[760px]:flex"
        @click="menuOpen = !menuOpen"
      >
        <span>{{ menuOpen ? t('nav.close') : t('nav.menu') }}</span>
        <span class="flex w-4 flex-col gap-1">
          <span class="h-0.5 bg-accent"/>
          <span class="h-0.5 w-2.5 bg-accent"/>
        </span>
      </button>

      <div class="flex flex-wrap items-center gap-2 max-[760px]:hidden">
        <ul class="m-0 flex list-none items-center gap-1 whitespace-nowrap p-0 text-[13px] max-[560px]:flex-wrap">
          <li v-for="item in menu" :key="item.key">
            <NuxtLink
              :to="item.href"
              class="spring block rounded-lg px-3 py-2"
              :class="item.active ? 'bg-surface-raised text-accent hover:text-accent' : 'text-ink-soft hover:bg-surface hover:text-ink'"
            >
              {{ labelOf(item.slug) }}
            </NuxtLink>
          </li>
        </ul>
        <button
          type="button"
          :title="t('engine.gpuTitle')"
          class="flex cursor-pointer items-center gap-2 spring rounded-full border border-line-control bg-surface px-3 py-[7px] text-xs text-ink-soft hover:border-accent hover:text-ink"
          @click="toggle"
        >
          <UiPulseDot/>
          {{ t('engine.gpu') }}
        </button>
      </div>
    </nav>

    <!-- an overlay under the bar, so opening it doesn't push the page down -->
    <Transition
      enter-active-class="transition-[opacity,translate] duration-200 ease-out"
      leave-active-class="transition-[opacity,translate] duration-150 ease-in"
      enter-from-class="opacity-0 motion-safe:-translate-y-2"
      leave-to-class="opacity-0 motion-safe:-translate-y-2"
    >
      <div
        v-if="menuOpen"
        class="absolute inset-x-0 top-full border-y border-line bg-bg shadow-[0_24px_48px_rgb(0_0_0/0.5)] min-[761px]:hidden"
      >
        <div class="page flex flex-col gap-5 pb-7 pt-4">
          <ul class="m-0 flex list-none flex-col p-0">
            <li v-for="item in menu" :key="item.key">
              <NuxtLink
                :to="item.href"
                class="flex min-h-14 items-center justify-between border-b border-line text-xl font-bold"
                :class="item.active ? 'text-accent hover:text-accent' : 'text-ink hover:text-ink'"
              >
                {{ labelOf(item.slug) }}
                <span v-if="item.active" class="text-[13px]">●</span>
              </NuxtLink>
            </li>
          </ul>
          <button
            type="button"
            class="flex min-h-12 cursor-pointer items-center justify-between rounded-[10px] border border-line-control bg-surface px-4 text-[13px] text-ink-soft"
            @click="toggle"
          >
            <span>{{ t('engine.mobileSwitch') }}</span>
            <UiPulseDot/>
          </button>
        </div>
      </div>
    </Transition>
  </header>
</template>
