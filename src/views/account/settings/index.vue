<template>
  <NScrollbar class="h-full">
    <div class="mx-auto max-w-5xl p-3 md:p-6">
      <div class="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 class="m-0 text-2xl font-semibold">应用设置</h1>
          <p class="mt-1 text-sm text-black/45 dark:text-white/45">配置仅保存在当前浏览器，并会立即生效</p>
        </div>
        <NPopconfirm @positive-click="resetGlobalConfig">
          <template #trigger><NButton>恢复默认</NButton></template>
          确定恢复全部默认设置吗？
        </NPopconfirm>
      </div>

      <div class="grid gap-5">
        <NCard title="皮肤与主题" :bordered="false" class="rounded-2xl! shadow-sm">
          <div class="settings-row">
            <div>
              <div class="settings-label">主题模式</div>
              <div class="settings-description">选择亮色、暗色或跟随系统</div>
            </div>
            <NRadioGroup :value="theme" @update:value="(value) => setGlobalConfig({ theme: value })">
              <NRadioButton value="light">浅色</NRadioButton>
              <NRadioButton value="dark">深色</NRadioButton>
              <NRadioButton value="system">跟随系统</NRadioButton>
            </NRadioGroup>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-label">主题色</div>
              <div class="settings-description">统一按钮、链接和强调色</div>
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="item in colorOptions"
                :key="item.value"
                type="button"
                class="size-8 cursor-pointer rounded-full border-3 transition-transform hover:scale-110"
                :class="themeColor === item.value ? 'border-black/65 dark:border-white/80' : 'border-transparent'"
                :style="{ backgroundColor: item.color }"
                :aria-label="item.label"
                @click="setGlobalConfig({ themeColor: item.value })"
              />
            </div>
          </div>
          <div class="settings-row border-b-0!">
            <div>
              <div class="settings-label">圆角</div>
              <div class="settings-description">控制卡片与控件的视觉柔和程度</div>
            </div>
            <NRadioGroup :value="borderRadius" @update:value="(value) => setGlobalConfig({ borderRadius: value })">
              <NRadioButton :value="4">4px</NRadioButton>
              <NRadioButton :value="8">8px</NRadioButton>
              <NRadioButton :value="12">12px</NRadioButton>
            </NRadioGroup>
          </div>
        </NCard>

        <NCard title="布局" :bordered="false" class="rounded-2xl! shadow-sm">
          <div class="settings-row">
            <div>
              <div class="settings-label">侧栏折叠</div>
              <div class="settings-description">设置当前侧栏的展开状态</div>
            </div>
            <NSwitch :value="collapse" @update:value="(value) => setGlobalConfig({ collapse: value })" />
          </div>
          <div class="settings-row border-b-0!">
            <div>
              <div class="settings-label">内容密度</div>
              <div class="settings-description">紧凑模式会减少页面留白和表格高度</div>
            </div>
            <NRadioGroup :value="density" @update:value="(value) => setGlobalConfig({ density: value })">
              <NRadioButton value="standard">标准</NRadioButton>
              <NRadioButton value="compact">紧凑</NRadioButton>
            </NRadioGroup>
          </div>
        </NCard>

        <NCard title="动画" :bordered="false" class="rounded-2xl! shadow-sm">
          <div class="settings-row">
            <div>
              <div class="settings-label">路由动画</div>
              <div class="settings-description">页面先完整淡出，再淡入新页面</div>
            </div>
            <NSwitch
              :value="routeAnimation.enabled"
              @update:value="(value) => setGlobalConfig({ routeAnimation: { enabled: value } })"
            />
          </div>
          <div class="settings-row">
            <div><div class="settings-label">动画类型</div></div>
            <NSelect
              class="w-52"
              :value="routeAnimation.type"
              :options="animationTypeOptions"
              @update:value="(value) => setGlobalConfig({ routeAnimation: { type: value } })"
            />
          </div>
          <div class="settings-row border-b-0!">
            <div><div class="settings-label">动画速度</div></div>
            <NRadioGroup
              :value="routeAnimation.speed"
              @update:value="(value) => setGlobalConfig({ routeAnimation: { speed: value } })"
            >
              <NRadioButton value="fast">快</NRadioButton>
              <NRadioButton value="normal">标准</NRadioButton>
              <NRadioButton value="slow">慢</NRadioButton>
            </NRadioGroup>
          </div>
        </NCard>

        <NCard title="安全与其他" :bordered="false" class="rounded-2xl! shadow-sm">
          <div class="settings-row border-b-0!">
            <div>
              <div class="settings-label">自动锁屏</div>
              <div class="settings-description">在指定时间无操作后自动进入锁屏界面</div>
            </div>
            <NSelect
              class="w-52"
              :value="autoLockMinutes"
              :options="autoLockOptions"
              @update:value="(value) => setGlobalConfig({ autoLockMinutes: value })"
            />
          </div>
        </NCard>
      </div>
    </div>
  </NScrollbar>
</template>

<script setup lang="ts">
import { themeColorTokens, useGlobalConfig } from "@/hooks";
import type { AutoLockMinutes, RouteAnimationType, ThemeColor } from "@/hooks";
import { NButton, NCard, NPopconfirm, NRadioButton, NRadioGroup, NScrollbar, NSelect, NSwitch } from "naive-ui";

const {
  theme,
  collapse,
  themeColor,
  borderRadius,
  density,
  routeAnimation,
  autoLockMinutes,
  setGlobalConfig,
  resetGlobalConfig,
} = useGlobalConfig();

const colorLabels: Record<ThemeColor, string> = {
  green: "绿色",
  blue: "蓝色",
  cyan: "青色",
  orange: "橙色",
  red: "红色",
  violet: "紫色",
};
const colorOptions = (Object.keys(themeColorTokens) as ThemeColor[]).map((value) => ({
  value,
  label: colorLabels[value],
  color: themeColorTokens[value].base,
}));
const animationTypeOptions: Array<{ label: string; value: RouteAnimationType }> = [
  { label: "纯淡入淡出", value: "fade" },
  { label: "淡入淡出 + 上移", value: "fade-up" },
  { label: "淡入淡出 + 缩放", value: "fade-scale" },
];
const autoLockOptions: Array<{ label: string; value: AutoLockMinutes }> = [
  { label: "关闭自动锁屏", value: 0 },
  { label: "5 分钟", value: 5 },
  { label: "15 分钟", value: 15 },
  { label: "30 分钟", value: 30 },
  { label: "60 分钟", value: 60 },
];
</script>

<style scoped>
.settings-row {
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid color-mix(in srgb, currentColor 9%, transparent);
  padding: 14px 0;
}

.settings-label {
  font-size: 14px;
  font-weight: 600;
}

.settings-description {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.48;
}

@media (max-width: 640px) {
  .settings-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
