<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, darkTheme, type GlobalTheme } from 'naive-ui'
import { computed } from 'vue';
import { useGlobalConfig } from '@/hooks';

const { theme } = useGlobalConfig()
const currentTheme = computed<GlobalTheme | null>(() => {
  return theme.value === 'dark' ? darkTheme : null
})

if (theme.value === 'dark') {
  document.documentElement.classList.add('dark')
}

</script>

<template>
  <n-config-provider :theme="currentTheme" class=" size-full text-[#333333] dark:text-[#e5e5e5]">
    <n-message-provider>
      <RouterView />
    </n-message-provider>
  </n-config-provider>
</template>
