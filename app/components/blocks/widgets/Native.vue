<!--
  Animated widgets in place of photos: an editor, a lesson, neofetch. Three in a row
  (a wide one and two narrow), like the gallery without a title.
-->
<script setup lang="ts">
import type {Component} from 'vue'
import type {BlockWidgets, Widget} from '~/types/content'
import {WidgetAgent, WidgetEditor, WidgetLesson, WidgetNeofetch, WidgetWeb} from '#components'

const props = defineProps<{
  block: BlockWidgets
  /** The label with its number. */
  label?: string
}>()

const WIDGETS: Record<Widget, Component> = {
  editor: WidgetEditor, lesson: WidgetLesson, neofetch: WidgetNeofetch, web: WidgetWeb, agent: WidgetAgent,
}

/** In a fixed order, whatever the order they were ticked in Directus. */
const widgets = computed(() => (Object.keys(WIDGETS) as Widget[]).filter(w => props.block.widgets?.includes(w)))
</script>

<template>
  <section>
    <div class="page pb-40 max-[860px]:pb-24">
      <div v-if="block.title" class="mb-14">
        <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
        <UiSectionTitle>{{ block.title }}</UiSectionTitle>
      </div>
      <div
        v-reveal.stagger
        class="grid gap-6"
        :class="widgets.length === 3
          ? 'grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] max-[860px]:grid-cols-2 max-[860px]:[&>*:first-child]:col-span-2 max-[560px]:grid-cols-1 max-[560px]:[&>*:first-child]:col-span-1'
          : 'grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))]'"
      >
        <component :is="WIDGETS[widget]" v-for="widget in widgets" :key="widget"/>
      </div>
    </div>
  </section>
</template>
