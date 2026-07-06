<!-- Fluent 24 Regular 图标选择器 -->

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
      <NInput v-model:value="keyword" placeholder="搜索图标，如 People24Regular" clearable size="small" class="mb-3" />
      <NScrollbar style="max-height: 280px">
        <div class="grid grid-cols-6 gap-1">
          <NTooltip v-for="name in filteredIcons" :key="name" trigger="hover">
            <template #trigger>
              <NButton
                quaternary
                :type="modelValue === name ? 'primary' : 'default'"
                class="!w-10 !h-10"
                @click="handleSelect(name)"
              >
                <template #icon>
                  <NIcon :size="24" :component="getFluentIconComponent(name) ?? undefined" />
                </template>
              </NButton>
            </template>
            {{ name }}
          </NTooltip>
        </div>
      </NScrollbar>
    </div>
  </NPopover>
</template>

<script setup lang="ts">
import { getFluentIconComponent, MENU_FLUENT_ICON_NAMES } from "@/utils/modules/fluent-icon";
import { Dismiss24Regular } from "@vicons/fluent";
import { NButton, NIcon, NInput, NPopover, NScrollbar, NTooltip } from "naive-ui";
import { computed, ref } from "vue";

const modelValue = defineModel<string>("value", { default: "" });

const popoverVisible = ref(false);
const keyword = ref("");

const selectedIcon = computed(() => getFluentIconComponent(modelValue.value));

const displayValue = computed(() => modelValue.value || "");

const filteredIcons = computed(() => {
  const key = keyword.value.trim().toLowerCase();
  if (!key) return MENU_FLUENT_ICON_NAMES;
  return MENU_FLUENT_ICON_NAMES.filter((name) => name.toLowerCase().includes(key));
});

const handleSelect = (name: string) => {
  modelValue.value = name;
  popoverVisible.value = false;
};

const handleClear = () => {
  modelValue.value = "";
};
</script>
