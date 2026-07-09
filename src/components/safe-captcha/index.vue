<template>
  <button
    type="button"
    class="captcha-img flex h-10 w-30 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded border border-black/8 bg-black/3 p-0 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
    title="点击刷新验证码"
    :disabled="disabled || loading"
    @click="$emit('refresh')"
  >
    <img v-if="captchaSrc" :src="captchaSrc" alt="验证码" class="size-full object-contain" />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  /** 后端返回的验证码图片内容，推荐返回 data:image/* 或图片路径。 */
  img?: string;
  /** 父组件正在刷新验证码时禁用点击，避免连续请求。 */
  loading?: boolean;
  /** 外部可显式禁用验证码刷新按钮。 */
  disabled?: boolean;
}>();

defineEmits<{
  refresh: [];
}>();

const captchaSrc = computed(() => {
  const raw = props.img?.trim();
  if (!raw) return "";

  // 最安全的情况：后端直接返回图片 data URL，或返回同源图片路径。
  if (raw.startsWith("data:image/") || raw.startsWith("/")) {
    return raw;
  }

  // 兼容旧接口返回 SVG 字符串，但不使用 v-html，避免把任意 HTML 注入页面。
  if (raw.startsWith("<svg")) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(raw)}`;
  }

  // 其它内容一律不渲染，验证码接口异常时宁可空白，也不渲染未知 HTML。
  return `data:image/svg+xml;base64,${raw}`;
});
</script>
