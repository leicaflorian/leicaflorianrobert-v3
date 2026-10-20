<!--
  The CRT monitor legacy mode is watched on, as in 1999: scan lines, phosphor mask,
  a bulging tube with dark corners. Decoration only: it takes no clicks and screen readers
  skip it. The text glow (`legacy-crt`) and the power-on (`legacy-crt-on`) are on the layout.
-->
<template>
  <div aria-hidden="true" class="pointer-events-none fixed inset-0 z-50 overflow-hidden">
    <div class="legacy-crt-lines absolute inset-0"/>
    <div class="legacy-crt-tube absolute inset-0"/>
  </div>
</template>
