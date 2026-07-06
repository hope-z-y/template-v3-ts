<script setup lang="ts">
import { RouterView } from "vue-router";
import { NConfigProvider, NMessageProvider, NDialogProvider, darkTheme, zhCN, dateZhCN, type GlobalTheme } from "naive-ui";
import { computed } from "vue";
import { useGlobalConfig } from "@/hooks";

const { theme } = useGlobalConfig();
const currentTheme = computed<GlobalTheme | null>(() => {
  return theme.value === "dark" ? darkTheme : null;
});

if (theme.value === "dark") {
  document.documentElement.classList.add("dark");
}
</script>

<template>
  <n-config-provider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="currentTheme"
    class="size-full text-[#333333] dark:text-[#e5e5e5]"
  >
    <div class="size-full">
      <n-message-provider>
        <n-dialog-provider>
          <RouterView />
        </n-dialog-provider>
      </n-message-provider>
    </div>
  </n-config-provider>
</template>
