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
        <td class="w-[110px] border border-black p-1.5">{{ periodOf(exp, $t('about.now')) }}</td>
        <td class="border border-black p-1.5">
          <LegacyLink v-if="exp.link" :href="exp.link">{{ companyOf(exp) }}</LegacyLink>
          <template v-else>{{ companyOf(exp) }}</template>
        </td>
        <td class="border border-black p-1.5">
          {{ exp.role }}
          <template v-if="exp.description"><br><small>{{ exp.description }}</small></template>
        </td>
      </tr>
    </tbody>
  </table>
</template>
