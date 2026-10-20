<!--
  The CRT monitor legacy mode is watched on, as in 1999: scan lines, phosphor mask,
  a bulging tube with dark corners, the room reflected on the glass, and the power-on when the page appears (main.css).
  Decoration only: it takes no clicks and screen readers skip it. The text glow
  (`legacy-crt`) is on the layout.
-->
<script setup lang="ts">
const {bootTarget} = useEngine()
/** Coming from native, the monitor switches on once the boot overlay starts fading out. */
const delay = bootTarget.value ? {'--crt-delay': '.45s'} : undefined
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none fixed inset-0 z-50 overflow-hidden" :style="delay">
    <div class="legacy-crt-power absolute inset-0 bg-legacy-crt-glass">
      <div class="legacy-crt-beam absolute inset-0"/>
      <div class="legacy-crt-flare absolute left-1/2 top-1/2 -ml-[24vmin] -mt-[5vmin] h-[10vmin] w-[48vmin]"/>
    </div>
    <div class="legacy-crt-lines absolute inset-0"/>
    <div class="legacy-crt-glare absolute inset-0"/>
    <div class="legacy-crt-tube absolute inset-0"/>
  </div>
</template>
