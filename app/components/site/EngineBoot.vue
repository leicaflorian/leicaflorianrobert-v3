<!--
  The overlay that "restarts the engine" when switching from legacy to native and back:
  scan lines, a glitch and four log lines appearing one after another.
-->
<script setup lang="ts">
const {bootTarget} = useEngine()
const {tm, rt} = useI18n()

const lines = computed(() => {
  if (!bootTarget.value) return []
  const key = bootTarget.value === 'native' ? 'engine.toNative' : 'engine.toLegacy'
  return (tm(key) as unknown as Parameters<typeof rt>[0][]).map(line => rt(line))
})
</script>

<template>
  <div
    v-if="bootTarget"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-100 flex animate-[boot-overlay_1.1s_ease_forwards] items-center justify-center bg-bg bg-[repeating-linear-gradient(0deg,rgb(255_255_255/0.04)_0_1px,transparent_1px_3px)]"
  >
    <div class="animate-[boot-glitch_.35s_steps(2)_2] font-mono text-sm leading-loose text-ink-soft">
      <div
        v-for="(line, i) in lines"
        :key="line"
        class="animate-[boot-line_.2s_ease_forwards] opacity-0"
        :style="{animationDelay: `${i * 0.12}s`}"
      >
        <span class="text-accent">›</span> {{ line }}
      </div>
    </div>
  </div>
</template>
