<script setup lang="ts">
import { RouterView } from "vue-router";
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  darkTheme,
  zhCN,
  dateZhCN,
  type GlobalTheme,
  type GlobalThemeOverrides,
} from "naive-ui";
import { computed } from "vue";
import { themeColorTokens, useGlobalConfig } from "@/hooks";

const { resolvedTheme, themeColor, borderRadius, density } = useGlobalConfig();
const currentTheme = computed<GlobalTheme | null>(() => {
  return resolvedTheme.value === "dark" ? darkTheme : null;
});

const themeOverrides = computed<GlobalThemeOverrides>(() => {
  const colors = themeColorTokens[themeColor.value];
  const compact = density.value === "compact";
  return {
    common: {
      primaryColor: colors.base,
      primaryColorHover: colors.hover,
      primaryColorPressed: colors.pressed,
      primaryColorSuppl: colors.suppl,
      borderRadius: `${borderRadius.value}px`,
      borderRadiusSmall: `${Math.max(2, borderRadius.value - 2)}px`,
      heightMedium: compact ? "30px" : "34px",
      heightLarge: compact ? "36px" : "40px",
    },
  };
});
</script>

<template>
  <n-config-provider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="currentTheme"
    :theme-overrides="themeOverrides"
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
