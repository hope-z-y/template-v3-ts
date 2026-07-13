<!-- Ant Design 图标选择器 -->

<template>
  <NPopover
    v-model:show="popoverVisible"
    trigger="click"
    placement="bottom-start"
    :width="360"
    display-directive="show"
  >
    <template #trigger>
      <NInput
        readonly
        :value="displayValue"
        placeholder="点击选择图标"
        class="cursor-pointer"
        @click="popoverVisible = true"
      >
        <template #prefix>
          <NIcon v-if="selectedIcon" :size="20" :component="selectedIcon" />
        </template>
        <template #suffix>
          <NButton v-if="modelValue" quaternary circle size="tiny" @click.stop="handleClear">
            <template #icon>
              <NIcon :component="Dismiss24Regular" />
            </template>
          </NButton>
        </template>
      </NInput>
    </template>

    <div class="py-1">
      <NInput v-model:value="keyword" placeholder="搜索图标，如 UserOutlined" clearable size="small" class="mb-3" />
      <NScrollbar style="max-height: 280px" class="min-h-12">
        <div class="grid grid-cols-6 gap-1">
          <NTooltip v-for="name in pagedIcons" :key="name" trigger="hover">
            <template #trigger>
              <NButton
                quaternary
                :type="modelValue === name ? 'primary' : 'default'"
                class="!w-10 !h-10"
                @click="handleSelect(name)"
              >
                <template #icon>
                  <NIcon :size="24" :component="GetAntdIconComponent(name) ?? undefined" />
                </template>
              </NButton>
            </template>
            {{ name }}
          </NTooltip>
        </div>
        <NEmpty v-if="!filteredIcons.length" description="未找到匹配图标" size="small" class="py-5" />
      </NScrollbar>
      <div
        v-if="filteredIcons.length"
        class="mt-3 flex items-center justify-between gap-2 border-t border-gray-200 pt-3"
      >
        <span class="shrink-0 text-xs text-gray-500">共 {{ filteredIcons.length }} 个</span>
        <NPagination
          v-model:page="page"
          :page-size="PAGE_SIZE"
          :item-count="filteredIcons.length"
          :page-slot="5"
          size="small"
        />
      </div>
    </div>
  </NPopover>
</template>

<script setup lang="ts">
import { ANTD_ICON_NAMES, GetAntdIconComponent } from "@/utils";
import Dismiss24Regular from "@vicons/fluent/es/Dismiss24Regular";
import { NButton, NEmpty, NIcon, NInput, NPagination, NPopover, NScrollbar, NTooltip } from "naive-ui";
import { computed, ref, watch } from "vue";

const PAGE_SIZE = 36;

const modelValue = defineModel<string>("value", { default: "" });

const popoverVisible = ref(false);
const keyword = ref("");
const page = ref(1);

const selectedIcon = computed(() => GetAntdIconComponent(modelValue.value));

const displayValue = computed(() => modelValue.value || "");

const filteredIcons = computed(() => {
  const key = keyword.value.trim().toLowerCase();
  if (!key) return ANTD_ICON_NAMES;
  return ANTD_ICON_NAMES.filter((name) => name.toLowerCase().includes(key));
});

/** 每页只挂载少量图标组件，避免打开弹窗时同时渲染整个图标库。 */
const pagedIcons = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;
  return filteredIcons.value.slice(start, start + PAGE_SIZE);
});

watch(keyword, () => {
  page.value = 1;
});

const handleSelect = (name: string) => {
  modelValue.value = name;
  popoverVisible.value = false;
};

const handleClear = () => {
  modelValue.value = "";
};
</script>
