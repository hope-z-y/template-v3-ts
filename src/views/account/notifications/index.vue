<template>
  <NScrollbar class="h-full"
    ><main class="mx-auto max-w-5xl p-3 md:p-6">
      <header class="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 class="m-0 text-2xl font-semibold">通知中心</h1>
          <p class="m-0 mt-1 text-sm text-black/45 dark:text-white/45">查看分发给你的通知与公告</p>
        </div>
        <div class="flex gap-2">
          <NCheckbox v-model:checked="unreadOnly" @update:checked="LoadInbox(1)">仅看未读</NCheckbox
          ><NButton :disabled="!unreadCount" @click="ReadAll">全部已读</NButton>
        </div>
      </header>
      <section class="inbox-panel">
        <NSpin :show="loading"
          ><NEmpty v-if="!items.length" class="py-16" description="暂无通知" /><button
            v-for="item in items"
            v-else
            :key="item.id"
            type="button"
            class="inbox-row"
            @click="OpenDetail(item.id)"
          >
            <span class="status-dot" :class="{ read: item.readAt }" /><span class="min-w-0 flex-1"
              ><span class="flex items-center gap-2"
                ><NTag size="small" :type="item.type === 'announcement' ? 'warning' : 'info'">{{
                  item.type === "announcement" ? "公告" : "通知"
                }}</NTag
                ><strong class="truncate text-sm">{{ item.title }}</strong></span
              ><span class="mt-2 block truncate text-sm text-black/48 dark:text-white/48">{{
                item.content
              }}</span></span
            ><time class="text-xs text-black/38 dark:text-white/38">{{ FormatDate(item.publishAt) }}</time>
          </button></NSpin
        ><NPagination
          v-if="total > pageSize"
          v-model:page="page"
          :page-size="pageSize"
          :item-count="total"
          class="mt-4 justify-end"
          @update:page="LoadInbox"
        />
      </section>
    </main>
    <NModal v-model:show="detailVisible" preset="card" title="通知详情" class="max-w-[680px]"
      ><NSpin :show="detailLoading"
        ><article v-if="detail">
          <div class="flex items-center gap-2">
            <NTag :type="detail.type === 'announcement' ? 'warning' : 'info'">{{
              detail.type === "announcement" ? "公告" : "通知"
            }}</NTag
            ><time class="text-xs text-black/40 dark:text-white/40">{{ FormatDate(detail.publishAt) }}</time>
          </div>
          <h2 class="my-5 text-xl">{{ detail.title }}</h2>
          <div class="whitespace-pre-wrap border-t border-black/7 pt-5 text-sm leading-7 dark:border-white/8">
            {{ detail.content }}
          </div>
        </article></NSpin
      ></NModal
    ></NScrollbar
  >
</template>
<script setup lang="ts">
import {
  GetNoticeInbox,
  GetNoticeInboxDetail,
  GetUnreadNoticeCount,
  MarkAllNoticesRead,
} from "@/api/system-management";
import type { IUserNotice } from "@/api/types";
import { NButton, NCheckbox, NEmpty, NModal, NPagination, NScrollbar, NSpin, NTag } from "naive-ui";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const items = ref<IUserNotice[]>([]);
const detail = ref<IUserNotice>();
const loading = ref(false);
const detailLoading = ref(false);
const detailVisible = ref(false);
const unreadOnly = ref(false);
const unreadCount = ref(0);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
async function LoadInbox(next = page.value) {
  page.value = next;
  loading.value = true;
  try {
    const result = await GetNoticeInbox({ pageNum: next, pageSize, unreadOnly: unreadOnly.value });
    items.value = result.rows;
    total.value = result.total;
    unreadCount.value = await GetUnreadNoticeCount();
  } finally {
    loading.value = false;
  }
}
async function OpenDetail(id: string) {
  detailVisible.value = true;
  detailLoading.value = true;
  try {
    detail.value = await GetNoticeInboxDetail(id);
    // 详情接口会同时标记已读，因此在本地同步列表与角标，避免整页刷新。
    const row = items.value.find((item) => item.id === id);
    if (row && !row.readAt) row.readAt = detail.value.readAt;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
    await router.replace({ query: { ...route.query, notice: id } });
  } finally {
    detailLoading.value = false;
  }
}
async function ReadAll() {
  await MarkAllNoticesRead();
  await LoadInbox(1);
}
const FormatDate = (value: string | null) => (value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-");
onMounted(async () => {
  await LoadInbox();
  if (typeof route.query.notice === "string") await OpenDetail(route.query.notice);
});
</script>
<style scoped>
.inbox-panel {
  border: 1px solid color-mix(in srgb, currentColor 8%, transparent);
  background: color-mix(in srgb, var(--n-color, #fff) 96%, transparent);
  padding: 16px;
}
.inbox-row {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 14px;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, currentColor 7%, transparent);
  background: transparent;
  padding: 16px 4px;
  text-align: left;
  color: inherit;
  cursor: pointer;
}
.inbox-row:hover {
  background: color-mix(in srgb, var(--app-primary-color) 5%, transparent);
}
.status-dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  background: var(--app-primary-color);
}
.status-dot.read {
  background: color-mix(in srgb, currentColor 22%, transparent);
}
</style>
