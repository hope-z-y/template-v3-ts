<template>
  <div class="user-action w-64 overflow-hidden">
    <div class="flex items-center gap-3">
      <NAvatar round :src="UserAvatar" :size="44" class="shrink-0 shadow-sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-semibold text-black/88 dark:text-white/90">
          {{ userInfo?.username || userInfo?.account || "未命名" }}
        </div>
        <div class="mt-0.5 truncate text-xs text-black/45 dark:text-white/45">
          {{ userInfo?.email || "未设置邮箱" }}
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <NTag size="small" :bordered="false" type="info"> 角色信息展示 </NTag>
      <NTag size="small" :bordered="false"> 部门信息展示 </NTag>
    </div>

    <div class="my-4 border-t border-black/6 dark:border-white/8" />

    <ul class="m-0 list-none">
      <li v-for="item in actions" :key="item.key">
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
import { NAvatar, NIcon, NTag } from "naive-ui";
import { LockClosed24Regular, Person24Regular, SignOut24Regular } from "@vicons/fluent";
import { useUserStore } from "@/stores";
import UserAvatar from "@/assets/images/Vue.png";
import type { Component } from "vue";
import { storeToRefs } from "pinia";

type UserActionKey = "profile" | "lock" | "logout";

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
const { logout, lockScreen } = useUserStore();

const actions: UserActionItem[] = [
  {
    key: "profile",
    label: "个人信息",
    icon: Person24Regular,
  },
  {
    key: "lock",
    label: "锁定屏幕",
    icon: LockClosed24Regular,
  },
  {
    key: "logout",
    label: "退出登录",
    icon: SignOut24Regular,
    danger: true,
  },
];

const handleAction = (key: UserActionKey) => {
  if (key === "logout") {
    logout();
  } else if (key === "lock") {
    lockScreen();
  }
  emit("select", key);
};
</script>

<style scoped></style>
