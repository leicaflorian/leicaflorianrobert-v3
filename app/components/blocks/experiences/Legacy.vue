<script setup lang="ts">
import type {BlockExperiences, Experience} from '~/types/content'

defineProps<{block: BlockExperiences}>()

const experiences = await useCollection<Experience>('experiences')
</script>

<template>
  <BlocksLegacyHeading>{{ block.title }}</BlocksLegacyHeading>
  <table class="w-full border-collapse text-base">
    <tbody>
      <tr v-for="exp in experiences" :key="exp.id">
        <td class="w-[60px] border border-black p-1.5">{{ exp.year ?? '—' }}</td>
        <td class="border border-black p-1.5">
          <LegacyLink v-if="exp.link" :href="exp.link">{{ exp.company }}</LegacyLink>
          <template v-else>{{ exp.company }}</template>
        </td>
        <td class="border border-black p-1.5">
          {{ exp.role }}
          <template v-if="exp.description"><br><small>{{ exp.description }}</small></template>
        </td>
      </tr>
    </tbody>
  </table>
</template>
