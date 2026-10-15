import {ENGINE_STORAGE_KEY, type EngineMode} from '~/composables/useEngine'

const MODES: EngineMode[] = ['legacy', 'native']

/**
 * After hydration, applies the chosen mode: the one in the URL (`?engine=native`,
 * handy for sharing a link or for screenshots) or the one saved in the browser.
 * Then removes the `engine-native-pending` class, set by the script in the page head
 * to hide the legacy version from visitors who chose native.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:suspense:resolve', () => {
    const engine = useEngine()
    const fromUrl = useRoute().query.engine as EngineMode | undefined

    if (fromUrl && MODES.includes(fromUrl)) {
      engine.set(fromUrl)
    } else {
      let saved: EngineMode | null = null
      try {
        saved = localStorage.getItem(ENGINE_STORAGE_KEY) as EngineMode | null
      } catch {
        // storage unavailable: stay on legacy
      }
      if (saved === 'native') engine.mode.value = 'native'
    }

    nextTick(() => document.documentElement.classList.remove('engine-native-pending'))
  })
})
