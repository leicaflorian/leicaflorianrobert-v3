<!-- The service icons, line-drawn as in the design (app/assets/icons). -->
<script setup lang="ts">
import type {ServiceIcon} from '~/types/content'
import web from '~/assets/icons/icon-web.svg?raw'
import mobile from '~/assets/icons/icon-mobile.svg?raw'
import design from '~/assets/icons/icon-design.svg?raw'
import devops from '~/assets/icons/icon-devops.svg?raw'
import formazione from '~/assets/icons/icon-formazione.svg?raw'
import consulenza from '~/assets/icons/icon-consulenza.svg?raw'

defineProps<{ name: ServiceIcon }>()

const ICONS: Record<ServiceIcon, string> = {web, mobile, design, devops, formazione, consulenza}
</script>

<template>
  <span class="block [&>svg]:size-full" v-html="ICONS[name] ?? ''"/>
</template>
