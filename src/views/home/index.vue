<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-6">工作台</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      <div
        v-for="card in statCards"
        :key="card.title"
        class="rounded-lg border p-4 bg-white dark:bg-neutral-900"
      >
        <div class="text-sm text-gray-500 mb-2">{{ card.title }}</div>
        <div class="text-2xl font-bold">{{ card.value }}</div>
      </div>
    </div>
    <div class="rounded-lg border p-4 bg-white dark:bg-neutral-900">
      <div class="text-base font-medium mb-4">快捷入口</div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <RouterLink
          v-for="link in quickLinks"
          :key="link.path"
          :to="link.path"
          class="rounded-md border px-4 py-3 text-center hover:border-primary transition-colors"
        >
          {{ link.title }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const statCards = [
  { title: "用户总数", value: "--" },
  { title: "角色总数", value: "--" },
  { title: "部门总数", value: "--" },
  { title: "在线用户", value: "--" },
];

const quickLinks = [
  { title: "用户管理", path: "/system-management/user-management" },
  { title: "角色管理", path: "/system-management/role-management" },
  { title: "菜单管理", path: "/system-management/menu-management" },
  { title: "部门管理", path: "/system-management/dept-management" },
  { title: "岗位管理", path: "/system-management/post-management" },
  { title: "字典管理", path: "/system-management/dict-management" },
  { title: "参数设置", path: "/system-management/config-management" },
  { title: "登录日志", path: "/monitor/login-log" },
];
</script>

<style scoped></style>
