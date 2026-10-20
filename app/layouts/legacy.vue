<!--
  Legacy mode: a '90s hypertext with name, profession, a menu of blue links,
  the page, and at the bottom the button that "switches on" native mode.
-->
<script setup lang="ts">
import type {Site} from '~/types/content'

const [site] = await Promise.all([useSingleton<Site>('site'), usePages()])
const {toggle, bootTarget} = useEngine()
const menu = useMenu()
const pageLink = usePageLink()
const consent = useCookieConsent()
/** Set by LegacyNudge while the page glitches on a first visit. */
const glitch = ref(false)
const nudge = useTemplateRef('nudge')
/** Coming from native, the monitor switches on once the boot overlay starts fading out. */
const crtDelay = bootTarget.value ? {'--crt-delay': '.45s'} : undefined
</script>

<template>
  <div data-engine="legacy" class="legacy-crt scheme-light font-legacy text-[17px] leading-normal text-black" :style="crtDelay">
    <!-- the screen's picture: the CRT power-on squeezes it, LegacyCrt stays still on top -->
    <div class="legacy-crt-on min-h-screen bg-white">
      <div class="mx-auto max-w-[880px] px-6 pb-12 pt-8" :class="{'legacy-glitch': glitch}">
        <h1 class="m-0 mb-1.5 text-[34px] font-bold">{{ site.name }}</h1>
        <p class="m-0 mb-3.5">{{ $t('engine.profession', {profession: site.profession}) }}</p>
        <!-- legacy is what a first visit shows: say it's on purpose, so nobody takes it for a broken site -->
        <p class="m-0 mb-3.5 text-sm text-legacy-note"><i>{{ $t('engine.experiment') }}</i></p>
        <nav class="flex flex-wrap gap-4">
          <LegacyLink v-for="item in menu" :key="item.key" :to="item.key" :current="item.active">
            {{ item.title }}
          </LegacyLink>
        </nav>
        <hr class="mb-6 mt-[18px] border-0 border-t-2 border-black">

        <slot/>

        <hr class="my-8 border-0 border-t border-black">
        <div class="flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            class="cursor-pointer border-2 border-legacy-light border-r-legacy-shadow border-b-legacy-shadow bg-legacy-face px-[22px] py-3 font-legacy-mono text-base font-bold text-black active:border-legacy-shadow active:border-r-legacy-light active:border-b-legacy-light"
            @click="toggle"
          >
            {{ $t('engine.activate') }}
          </button>
          <button
            v-if="nudge?.mounted"
            type="button"
            class="cursor-pointer border-2 border-legacy-light border-r-legacy-shadow border-b-legacy-shadow bg-legacy-face px-3 py-1 font-legacy-mono text-xs text-black active:border-legacy-shadow active:border-r-legacy-light active:border-b-legacy-light"
            @click="nudge.toggle()"
          >
            {{ $t(nudge.running ? 'engine.nudge.glitchOff' : 'engine.nudge.glitchOn') }}
          </button>
          <p class="m-0 text-sm text-legacy-note">{{ $t('engine.optimized') }}</p>
          <p class="m-0 text-sm">
            <LegacyLink :href="pageLink('privacy')">{{ $t('footer.privacy') }}</LegacyLink>
            <template v-if="consent.ready.value">
              |
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0 font-legacy text-sm text-legacy-link underline" @click="consent.manage">{{ $t('footer.cookiePreferences') }}</button>
            </template>
          </p>
        </div>
      </div>
    </div>
    <LegacyNudge ref="nudge" v-model="glitch"/>
    <LegacyCrt/>
  </div>
</template>
