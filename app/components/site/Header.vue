<!--
  The native-mode header: logo with the page path, language, menu and GPU button.
  Below 760px, menu and GPU move into a panel opened by the "menu" button.
-->
<script setup lang="ts">
const {t} = useI18n()
const route = useRoute()
const routeBaseName = useRouteBaseName()
const {toggle} = useEngine()

const items = [
  {name: 'index', label: 'nav.home'},
  {name: 'about', label: 'nav.about'},
  {name: 'projects', label: 'nav.projects'},
  {name: 'contact', label: 'nav.contact'},
] as const

const PATHS: Record<string, string> = {
  'index': 'path.home',
  'about': 'path.about',
  'projects': 'path.projects',
  'projects-v3': 'path.caseStudy',
  'contact': 'path.contact',
}

const baseName = computed(() => String(routeBaseName(route) ?? 'index'))
/** The active menu item: the case study sits under "projects". */
const active = computed(() => baseName.value.split('-')[0])
const pathLabel = computed(() => t(PATHS[baseName.value] ?? 'path.home'))

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
        <NuxtLinkLocale to="index" class="flex items-center gap-3 text-ink hover:text-ink">
          <SiteLogo/>
          <span class="text-[13px] text-subtle max-[1000px]:hidden">{{ pathLabel }}</span>
        </NuxtLinkLocale>
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
          <li v-for="item in items" :key="item.name">
            <NuxtLinkLocale
              :to="item.name"
              class="block rounded-lg px-3 py-2"
              :class="active === item.name ? 'bg-surface-raised text-accent hover:text-accent' : 'text-ink-soft hover:bg-surface hover:text-ink'"
            >
              {{ t(item.label) }}
            </NuxtLinkLocale>
          </li>
        </ul>
        <button
          type="button"
          :title="t('engine.gpuTitle')"
          class="flex cursor-pointer items-center gap-2 rounded-full border border-line-control bg-surface px-3 py-[7px] text-xs text-ink-soft hover:border-accent hover:text-ink"
          @click="toggle"
        >
          <UiPulseDot/>
          {{ t('engine.gpu') }}
        </button>
      </div>
    </nav>

    <div v-if="menuOpen" class="page flex flex-col gap-5 border-t border-line pb-7 pt-4 min-[761px]:hidden">
      <ul class="m-0 flex list-none flex-col p-0">
        <li v-for="item in items" :key="item.name">
          <NuxtLinkLocale
            :to="item.name"
            class="flex min-h-14 items-center justify-between border-b border-line text-xl font-bold"
            :class="active === item.name ? 'text-accent hover:text-accent' : 'text-ink hover:text-ink'"
          >
            {{ t(item.label) }}
            <span v-if="active === item.name" class="text-[13px]">●</span>
          </NuxtLinkLocale>
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
  </header>
</template>
