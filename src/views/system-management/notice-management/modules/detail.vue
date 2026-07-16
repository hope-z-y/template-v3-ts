<template>
  <Modal
    ><div v-if="record" class="px-2 pb-4">
      <div class="flex items-center gap-2">
        <NTag :type="record.type === 'announcement' ? 'warning' : 'info'">{{
          record.type === "announcement" ? "公告" : "通知"
        }}</NTag
        ><NTag :type="record.status === 'published' ? 'success' : 'default'">{{ statusLabel }}</NTag>
      </div>
      <h2 class="mb-2 mt-4 text-xl">{{ record.title }}</h2>
      <div class="text-xs text-black/40 dark:text-white/40">
        发布时间：{{ record.publishAt ? new Date(record.publishAt).toLocaleString("zh-CN") : "未发布" }}
      </div>
      <div class="my-5 border-t border-black/7 dark:border-white/8" />
      <div class="whitespace-pre-wrap text-sm leading-7">{{ record.content }}</div>
    </div></Modal
  >
</template>
<script setup lang="ts">
import { useModal } from "@/hooks";
import { NTag } from "naive-ui";
import { computed } from "vue";
import type { INoticeDetailData } from "../data";
const [Modal, modalApi] = useModal<INoticeDetailData>({
  title: "通知公告详情",
  width: "680px",
  preset: "card",
  footer: false,
});
const record = computed(() => modalApi.getData()?.record);
const statusLabel = computed(
  () => ({ draft: "草稿", published: "已发布", closed: "已关闭" })[record.value?.status || "draft"],
);
</script>
