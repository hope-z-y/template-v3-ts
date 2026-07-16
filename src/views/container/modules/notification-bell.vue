<template>
  <NPopover v-model:show="visible" trigger="click" placement="bottom-end" :width="360" @update:show="OnVisibleChange">
    <template #trigger>
      <NBadge :value="unreadCount" :max="99" :show="unreadCount > 0">
        <NButton quaternary circle aria-label="通知中心"
          ><template #icon
            ><NIcon><Alert24Regular /></NIcon></template
        ></NButton>
      </NBadge>
    </template>
    <div class="notification-popover">
      <header class="flex items-center justify-between border-b border-black/7 pb-3 dark:border-white/8">
        <div>
          <div class="font-semibold">通知中心</div>
          <div class="mt-0.5 text-xs text-black/40 dark:text-white/40">
            {{ unreadCount ? `${unreadCount} 条未读` : "暂无未读" }}
          </div>
        </div>
        <NButton v-if="unreadCount" text type="primary" size="small" @click="ReadAll">全部已读</NButton>
      </header>
      <NSpin :show="loading"
        ><NEmpty v-if="!items.length" class="py-8" description="暂无通知" />
        <div v-else class="max-h-96 overflow-auto">
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="notification-item"
            @click="OpenNotice(item.id)"
          >
            <span v-if="!item.readAt" class="unread-dot" /><span class="min-w-0 flex-1"
              ><span class="block truncate text-sm font-medium">{{ item.title }}</span
              ><span class="mt-1 block text-xs text-black/40 dark:text-white/40">{{
                FormatDate(item.publishAt)
              }}</span></span
            >
          </button>
        </div></NSpin
      >
      <NButton
        block
        text
        type="primary"
        class="mt-3 border-t border-black/7 pt-3 dark:border-white/8"
        @click="GoToCenter"
        >查看全部通知</NButton
      >
    </div>
  </NPopover>
</template>
<script setup lang="ts">
import { GetNoticeInbox, GetUnreadNoticeCount, MarkAllNoticesRead } from "@/api/system-management";
import type { IUserNotice } from "@/api/types";
import Alert24Regular from "@vicons/fluent/es/Alert24Regular";
import { NBadge, NButton, NEmpty, NIcon, NPopover, NSpin } from "naive-ui";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const visible = ref(false);
const unreadCount = ref(0);
const items = ref<IUserNotice[]>([]);
const loading = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;
// 角标刷新失败不打断页面使用，统一交给请求拦截器记录或提示。
async function RefreshCount() {
  try {
    unreadCount.value = await GetUnreadNoticeCount();
  } catch {
    /* 全局拦截器处理 */
  }
}
async function LoadItems() {
  loading.value = true;
  try {
    const result = await GetNoticeInbox({ pageNum: 1, pageSize: 6 });
    items.value = result.rows;
  } finally {
    loading.value = false;
  }
}
function OnVisibleChange(show: boolean) {
  if (show) void LoadItems();
}
async function ReadAll() {
  await MarkAllNoticesRead();
  unreadCount.value = 0;
  items.value = items.value.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() }));
}
function OpenNotice(id: string) {
  visible.value = false;
  void router.push({ path: "/account/notifications", query: { notice: id } });
}
function GoToCenter() {
  visible.value = false;
  void router.push("/account/notifications");
}
const FormatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "刚刚";
onMounted(() => {
  void RefreshCount();
  // 仅轮询轻量计数接口，用户展开浮层时再加载通知列表。
  timer = setInterval(() => void RefreshCount(), 60_000);
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>
<style scoped>
.notification-item {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, currentColor 7%, transparent);
  background: transparent;
  padding: 13px 4px;
  text-align: left;
  color: inherit;
  cursor: pointer;
}
.notification-item:hover {
  background: color-mix(in srgb, var(--app-primary-color) 6%, transparent);
}
.unread-dot {
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: var(--app-primary-color);
}
</style>
