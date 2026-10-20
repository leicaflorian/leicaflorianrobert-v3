<!--
  The CRT monitor legacy mode is watched on, as in 1999: scan lines, phosphor mask,
  a bulging tube with dark corners, the room reflected on the glass, and the power-on: the dark glass, the beam
  and the static (main.css).
  Decoration only: it takes no clicks and screen readers skip it. The text glow
  (`legacy-crt`) and the page opening out of the line (`legacy-crt-on`) are on the layout.
-->
<template>
  <div aria-hidden="true" class="pointer-events-none fixed inset-0 z-50 overflow-hidden">
    <div class="legacy-crt-boot absolute inset-0">
      <div class="legacy-crt-power absolute inset-0 bg-legacy-crt-glass">
        <div class="legacy-crt-viewer absolute inset-0"/>
      </div>
      <div class="legacy-crt-beam absolute inset-0"/>
      <div class="legacy-crt-flare absolute left-1/2 top-1/2 -ml-[24vmin] -mt-[5vmin] h-[10vmin] w-[48vmin]"/>
      <div class="legacy-crt-noise absolute"/>
    </div>
    <div class="legacy-crt-lines absolute inset-0"/>
    <div class="legacy-crt-glare absolute inset-0"/>
    <div class="legacy-crt-tube absolute inset-0"/>
  </div>
</template>
