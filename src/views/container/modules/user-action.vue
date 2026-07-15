<template>
  <div class="user-action w-64 overflow-hidden">
    <div class="flex items-center gap-3">
      <NAvatar round :src="userInfo?.avatar || UserAvatar" :size="44" class="shrink-0 shadow-sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-semibold text-black/88 dark:text-white/90">
          {{ userInfo?.username || userInfo?.account || "未命名" }}
        </div>
        <div class="mt-0.5 truncate text-xs text-black/45 dark:text-white/45">
          {{ userInfo?.email || "未设置邮箱" }}
        </div>
      </div>
    </div>

    <div class="my-4 border-t border-black/6 dark:border-white/8" />

    <ul class="m-0 list-none">
      <li
        v-for="item in actions"
        :key="item.key"
        :class="item.key === 'logout' ? 'mt-3 border-t border-black/6 pt-3 dark:border-white/8' : ''"
      >
        <button
          type="button"
          class="action-item flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer"
          :class="
            item.danger
              ? 'text-red-500 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-400/30'
              : 'text-black/75 hover:bg-black/10 dark:text-white/75 dark:hover:bg-white/30'
          "
          @click="handleAction(item.key)"
        >
          <NIcon :size="18" class="shrink-0 opacity-80 text-inherit!">
            <component :is="item.icon" />
          </NIcon>
          <span>{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from "@/assets/images/Vue.png";
import { useLockScreen } from "@/hooks";
import { useUserStore } from "@/stores";
import LockClosed24Regular from "@vicons/fluent/es/LockClosed24Regular";
import Person24Regular from "@vicons/fluent/es/Person24Regular";
import Settings24Regular from "@vicons/fluent/es/Settings24Regular";
import SignOut24Regular from "@vicons/fluent/es/SignOut24Regular";
import { NAvatar, NIcon } from "naive-ui";
import { storeToRefs } from "pinia";
import type { Component } from "vue";
import { useRouter } from "vue-router";

type UserActionKey = "lock" | "profile" | "settings" | "logout";

interface UserActionItem {
  key: UserActionKey;
  label: string;
  icon: Component;
  danger?: boolean;
}

const emit = defineEmits<{
  select: [key: UserActionKey];
}>();

const { userInfo } = storeToRefs(useUserStore());
const { logout } = useUserStore();
const { lock } = useLockScreen();
const router = useRouter();

const actions: UserActionItem[] = [
  { key: "lock", label: "屏幕锁定", icon: LockClosed24Regular },
  { key: "profile", label: "个人信息", icon: Person24Regular },
  { key: "settings", label: "应用设置", icon: Settings24Regular },
  {
    key: "logout",
    label: "退出登录",
    icon: SignOut24Regular,
    danger: true,
  },
];

const handleAction = (key: UserActionKey) => {
  switch (key) {
    case "lock":
      lock();
      break;
    case "profile":
      void router.push("/account/profile");
      break;
    case "settings":
      void router.push("/account/settings");
      break;
    case "logout":
      void logout();
      break;
  }
  emit("select", key);
};
</script>

<style scoped></style>
