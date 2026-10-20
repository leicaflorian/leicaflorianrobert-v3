import {ENGINE_STORAGE_KEY, type EngineMode} from '~/composables/useEngine'

const MODES: EngineMode[] = ['legacy', 'native']

/**
 * After hydration, applies the chosen mode: the one in the URL (`?engine=native`,
 * handy for sharing a link or for screenshots) or the one saved in the browser.
 * Native opens with the boot overlay, over the dark background, as when switching.
 * Then removes the `engine-native-pending` class, set by the script in the page head
 * to hide the legacy version from visitors who chose native.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:suspense:resolve', () => {
    const engine = useEngine()
    const fromUrl = useRoute().query.engine as EngineMode | undefined
    let next: EngineMode = 'legacy'

    if (fromUrl && MODES.includes(fromUrl)) {
      next = fromUrl
    } else {
      try {
        if (localStorage.getItem(ENGINE_STORAGE_KEY) === 'native') next = 'native'
      } catch {
        // storage unavailable: stay on legacy
      }
    }

    const reveal = () => nextTick(() => document.documentElement.classList.remove('engine-native-pending'))
    if (next === 'native') {
      engine.boot('native', {scroll: false}).then(reveal)
    } else {
      if (fromUrl) engine.set(fromUrl)
      reveal()
    }
  })
})
