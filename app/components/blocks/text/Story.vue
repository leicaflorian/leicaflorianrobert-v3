<!--
  The text as a story: the paragraphs on the right, the one being read lit up; on the left,
  sticky, a widget for each paragraph, changing as you read, and the steps. On narrow
  screens each widget follows its paragraph instead.
-->
<script setup lang="ts">
import type {Component} from 'vue'
import type {BlockText, Widget} from '~/types/content'
import {WidgetAgent, WidgetEditor, WidgetLesson, WidgetNeofetch, WidgetWeb} from '#components'

const props = defineProps<{
  block: BlockText
  /** The label with its number. */
  label?: string
}>()

const WIDGETS: Record<Widget, Component> = {
  neofetch: WidgetNeofetch, web: WidgetWeb, editor: WidgetEditor, lesson: WidgetLesson, agent: WidgetAgent,
}

/** One chapter per paragraph, with its widget and short name. */
const chapters = computed(() => {
  const steps = lines(props.block.steps)
  return paragraphs(props.block.text).map((text, i) => {
    const widget = props.block.widgets?.[i]
    return {text, widget: widget ? WIDGETS[widget] : null, step: steps[i] ?? ''}
  })
})

const list = useTemplateRef('list')
const {index: reading, goTo} = useParagraphInView(list)
</script>

<template>
  <section class="border-t border-line">
    <div class="page grid grid-cols-2 items-start gap-18 py-40 max-[860px]:grid-cols-1 max-[860px]:gap-8 max-[860px]:py-24">
      <div class="sticky top-24 flex flex-col gap-10 max-[860px]:static">
        <div>
          <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
          <UiSectionTitle>{{ block.title }}</UiSectionTitle>
        </div>
        <div class="relative h-[340px] max-[860px]:hidden">
          <div
            v-for="(chapter, i) in chapters"
            :key="i"
            class="absolute inset-0 transition-[opacity,translate] duration-[450ms]"
            :class="i === reading ? 'opacity-100' : ['pointer-events-none opacity-0', i < reading ? '-translate-y-3' : 'translate-y-3']"
            :inert="i !== reading"
          >
            <component :is="chapter.widget" v-if="chapter.widget"/>
          </div>
        </div>
        <div class="flex items-center gap-1.5 max-[860px]:hidden">
          <button
            v-for="(chapter, i) in chapters"
            :key="i"
            type="button"
            :aria-label="chapter.step"
            :aria-current="i === reading ? 'step' : undefined"
            class="h-1 cursor-pointer rounded border-0 p-0 transition-all duration-300"
            :class="i === reading ? 'w-7 bg-accent' : 'w-2.5 bg-line-control hover:bg-gutter'"
            @click="goTo(i)"
          />
          <span class="ml-2.5 text-xs text-subtle">
            {{ String(reading + 1).padStart(2, '0') }} / {{ String(chapters.length).padStart(2, '0') }} · {{ chapters[reading]?.step }}
          </span>
        </div>
      </div>

      <div ref="list" class="flex flex-col text-base leading-[1.85]">
        <div
          v-for="(chapter, i) in chapters"
          :key="i"
          class="border-l-2 py-12 pl-7 transition-colors duration-[350ms] max-[860px]:border-l-0 max-[860px]:py-6 max-[860px]:pl-0 max-[860px]:text-ink-soft"
          :class="[i === reading ? 'border-accent text-ink' : 'border-line text-ghost', i === chapters.length - 1 && 'pb-[30vh] max-[860px]:pb-0']"
        >
          <p class="m-0" v-html="highlight(chapter.text)"/>
          <component :is="chapter.widget" v-if="chapter.widget" class="mt-6 min-[861px]:hidden"/>
        </div>
      </div>
    </div>
  </section>
</template>
