<template>
  <Transition name="lock-screen">
    <div v-if="isLocked" class="fixed inset-0 z-99999 overflow-hidden bg-[#0b1118] text-white">
      <div class="absolute inset-0 lock-atmosphere" />
      <div class="relative flex h-full items-center justify-center p-6">
        <div
          class="w-full max-w-md rounded-3xl border border-white/12 bg-white/8 p-8 text-center shadow-2xl backdrop-blur-2xl"
        >
          <div class="text-5xl font-light tracking-tight tabular-nums">{{ currentTime }}</div>
          <div class="mt-1 text-sm text-white/55">{{ currentDate }}</div>

          <NAvatar round :size="76" :src="userInfo?.avatar || UserAvatar" class="mt-8 ring-4 ring-white/10 shadow-xl" />
          <div class="mt-4 text-lg font-semibold">{{ userInfo?.username || userInfo?.account }}</div>
          <div class="mt-1 text-sm text-white/50">屏幕已锁定，请输入当前登录密码</div>

          <NInput
            v-model:value="password"
            class="mt-6"
            type="password"
            show-password-on="click"
            size="large"
            placeholder="请输入密码解锁"
            :disabled="unlocking"
            @keyup.enter="handleUnlock"
          />
          <NButton class="mt-4" type="primary" size="large" block :loading="unlocking" @click="handleUnlock">
            解锁
          </NButton>
          <NButton class="mt-2 text-white/65!" text block @click="handleLogout">退出登录</NButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import UserAvatar from "@/assets/images/Vue.png";
import { useLockScreen } from "@/hooks";
import { useUserStore } from "@/stores";
import { NAvatar, NButton, NInput, useMessage } from "naive-ui";
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, ref } from "vue";

const message = useMessage();
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
const { isLocked, unlocking, unlock, clear } = useLockScreen();
const password = ref("");
const now = ref(new Date());
const timer = window.setInterval(() => (now.value = new Date()), 1_000);

const currentTime = computed(() => now.value.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
const currentDate = computed(() =>
  now.value.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" }),
);

const handleUnlock = async () => {
  if (!password.value.trim()) {
    message.warning("请输入当前登录密码");
    return;
  }
  try {
    const success = await unlock(password.value);
    if (success) password.value = "";
  } catch {
    // 错误提示由请求拦截器展示；保持锁屏状态，允许用户继续输入
  }
};

const handleLogout = async () => {
  clear();
  await userStore.logout();
};

onBeforeUnmount(() => window.clearInterval(timer));
</script>

<style scoped>
.lock-atmosphere {
  background:
    radial-gradient(circle at 22% 18%, color-mix(in srgb, var(--app-primary-color) 42%, transparent), transparent 32%),
    radial-gradient(circle at 80% 78%, rgba(36, 99, 235, 0.25), transparent 34%),
    linear-gradient(145deg, #0b1118 0%, #111827 54%, #071019 100%);
}

.lock-screen-enter-active,
.lock-screen-leave-active {
  transition: opacity 180ms ease;
}

.lock-screen-enter-from,
.lock-screen-leave-to {
  opacity: 0;
}
</style>
