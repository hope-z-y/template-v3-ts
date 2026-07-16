<template>
  <NScrollbar class="h-full">
    <main class="dashboard mx-auto max-w-[1680px] p-3 md:p-6">
      <header class="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div class="text-xs font-medium text-black/45 dark:text-white/45">{{ formattedDate }}</div>
          <h1 class="m-0 mt-1 text-2xl font-semibold">{{ greeting }}，{{ userInfo?.username || userInfo?.account }}</h1>
          <p class="m-0 mt-1 text-sm text-black/48 dark:text-white/48">这是今日系统运行与组织动态概览</p>
        </div>
        <NButton :loading="loading" @click="LoadDashboard"
          ><template #icon
            ><NIcon><ArrowClockwise24Regular /></NIcon></template
          >刷新数据</NButton
        >
      </header>

      <NAlert v-if="error" type="error" class="mb-4">工作台数据加载失败，请稍后重试</NAlert>
      <div v-if="overview?.canViewSystemMetrics" class="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <section v-for="metric in metrics" :key="metric.label" class="metric-panel">
          <div class="flex items-center justify-between">
            <span class="text-sm text-black/52 dark:text-white/52">{{ metric.label }}</span
            ><NIcon :size="19" :color="metric.color"><component :is="metric.icon" /></NIcon>
          </div>
          <div class="mt-3 text-3xl font-semibold tabular-nums">{{ metric.value }}</div>
          <div class="mt-2 text-xs text-black/38 dark:text-white/38">{{ metric.note }}</div>
        </section>
      </div>

      <div
        class="mt-4 grid gap-4"
        :class="overview?.canViewSystemMetrics ? 'xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]' : ''"
      >
        <section v-if="overview?.canViewSystemMetrics" class="panel">
          <div class="panel-title">
            <div>
              <h2>近 7 日登录趋势</h2>
              <p>成功登录次数</p>
            </div>
            <span class="text-2xl font-semibold tabular-nums">{{ trendTotal }}</span>
          </div>
          <div class="trend-chart">
            <div v-for="item in overview?.loginTrend || []" :key="item.date" class="trend-column">
              <div class="trend-value">{{ item.count }}</div>
              <div class="trend-track">
                <div class="trend-bar" :style="{ height: `${Math.max(5, (item.count / maxTrend) * 100)}%` }" />
              </div>
              <div class="trend-label">{{ FormatWeekday(item.date) }}</div>
            </div>
          </div>
        </section>
        <section class="panel">
          <div class="panel-title">
            <div>
              <h2>快捷入口</h2>
              <p>常用管理任务</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <RouterLink v-for="item in availableLinks" :key="item.path" :to="item.path" class="quick-link"
              ><NIcon :size="20"><component :is="item.icon" /></NIcon><span>{{ item.label }}</span
              ><NIcon class="ml-auto opacity-35"><ChevronRight16Regular /></NIcon
            ></RouterLink>
          </div>
        </section>
      </div>

      <div class="mt-4 grid gap-4" :class="overview?.canViewSystemMetrics ? 'xl:grid-cols-2' : ''">
        <section v-if="overview?.canViewSystemMetrics" class="panel">
          <div class="panel-title">
            <div>
              <h2>最新公告</h2>
              <p>组织信息与业务通知</p>
            </div>
            <RouterLink to="/system-management/notice-management" class="text-sm text-[var(--app-primary-color)]"
              >查看全部</RouterLink
            >
          </div>
          <NEmpty v-if="!overview?.recentNotices.length" description="暂无已发布公告" />
          <div v-else class="divide-y divide-black/6 dark:divide-white/7">
            <div v-for="item in overview.recentNotices" :key="item.id" class="flex items-center gap-3 py-3">
              <NTag size="small" :type="item.type === 'announcement' ? 'warning' : 'info'">{{
                item.type === "announcement" ? "公告" : "通知"
              }}</NTag
              ><span class="min-w-0 flex-1 truncate text-sm">{{ item.title }}</span
              ><time class="text-xs text-black/38 dark:text-white/38">{{ FormatDate(item.publishAt) }}</time>
            </div>
          </div>
        </section>
        <section class="panel">
          <div class="panel-title">
            <div>
              <h2>最近登录</h2>
              <p>系统访问动态</p>
            </div>
          </div>
          <NEmpty v-if="!overview?.recentLogins.length" description="暂无登录记录" />
          <div v-else class="divide-y divide-black/6 dark:divide-white/7">
            <div
              v-for="item in overview.recentLogins"
              :key="item.id"
              class="grid grid-cols-[minmax(100px,1fr)_120px_150px] gap-3 py-3 text-sm"
            >
              <span class="truncate font-medium">{{ item.username || "未知用户" }}</span
              ><span class="truncate text-black/48 dark:text-white/48">{{ item.loginIp || "-" }}</span
              ><time class="text-right text-xs text-black/38 dark:text-white/38">{{
                FormatDateTime(item.loginAt)
              }}</time>
            </div>
          </div>
        </section>
      </div>
    </main>
  </NScrollbar>
</template>

<script setup lang="ts">
import { GetDashboardOverview } from "@/api/dashboard";
import type { IDashboardOverview } from "@/api/types";
import { useUserStore } from "@/stores";
import ArrowClockwise24Regular from "@vicons/fluent/es/ArrowClockwise24Regular";
import Building24Regular from "@vicons/fluent/es/Building24Regular";
import ChevronRight16Regular from "@vicons/fluent/es/ChevronRight16Regular";
import Megaphone24Regular from "@vicons/fluent/es/Megaphone24Regular";
import People24Regular from "@vicons/fluent/es/People24Regular";
import PersonLock24Regular from "@vicons/fluent/es/PersonLock24Regular";
import Shield24Regular from "@vicons/fluent/es/Shield24Regular";
import { NAlert, NButton, NEmpty, NIcon, NScrollbar, NTag } from "naive-ui";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
const overview = ref<IDashboardOverview>();
const loading = ref(false);
const error = ref(false);
const greeting = computed(() =>
  new Date().getHours() < 12 ? "早上好" : new Date().getHours() < 18 ? "下午好" : "晚上好",
);
const formattedDate = new Intl.DateTimeFormat("zh-CN", { dateStyle: "full" }).format(new Date());
const metrics = computed(() => [
  {
    label: "启用用户",
    value: overview.value?.summary?.userCount ?? "--",
    note: "当前有效账号",
    icon: People24Regular,
    color: "#2080f0",
  },
  {
    label: "有效角色",
    value: overview.value?.summary?.roleCount ?? "--",
    note: "组织授权角色",
    icon: Shield24Regular,
    color: "#18a058",
  },
  {
    label: "启用部门",
    value: overview.value?.summary?.departmentCount ?? "--",
    note: "组织架构节点",
    icon: Building24Regular,
    color: "#0e7a8a",
  },
  {
    label: "已发公告",
    value: overview.value?.summary?.publishedNoticeCount ?? "--",
    note: "当前发布总量",
    icon: Megaphone24Regular,
    color: "#f0a020",
  },
  {
    label: "今日登录",
    value: overview.value?.summary?.todayLoginCount ?? "--",
    note: "成功访问次数",
    icon: PersonLock24Regular,
    color: "#d03050",
  },
]);
const links = [
  {
    label: "用户管理",
    path: "/system-management/user-management",
    permission: "system:user:list",
    icon: People24Regular,
  },
  {
    label: "角色管理",
    path: "/system-management/role-management",
    permission: "system:role:list",
    icon: Shield24Regular,
  },
  {
    label: "部门管理",
    path: "/system-management/dept-management",
    permission: "system:department:list",
    icon: Building24Regular,
  },
  {
    label: "通知公告",
    path: "/system-management/notice-management",
    permission: "system:notice:list",
    icon: Megaphone24Regular,
  },
];
const availableLinks = computed(() => links.filter((item) => userStore.hasPermission(item.permission)));
const trendTotal = computed(() => overview.value?.loginTrend.reduce((sum, item) => sum + item.count, 0) ?? 0);
const maxTrend = computed(() => Math.max(1, ...(overview.value?.loginTrend.map((item) => item.count) || [1])));
const FormatWeekday = (date: string) =>
  new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(new Date(`${date}T00:00:00`));
const FormatDate = (value: string | null) =>
  value ? new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(value)) : "-";
const FormatDateTime = (value: string) => new Date(value).toLocaleString("zh-CN", { hour12: false });
async function LoadDashboard() {
  loading.value = true;
  error.value = false;
  try {
    overview.value = await GetDashboardOverview();
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
}
onMounted(LoadDashboard);
</script>

<style scoped>
.metric-panel,
.panel {
  border: 1px solid color-mix(in srgb, currentColor 8%, transparent);
  background: color-mix(in srgb, var(--n-color, #fff) 96%, transparent);
  box-shadow: 0 1px 3px rgb(0 0 0/4%);
}
.metric-panel {
  min-height: 126px;
  padding: 18px;
}
.panel {
  min-height: 260px;
  padding: 20px;
}
.panel-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}
.panel-title h2 {
  margin: 0;
  font-size: 16px;
}
.panel-title p {
  margin: 4px 0 0;
  font-size: 12px;
  opacity: 0.42;
}
.trend-chart {
  display: grid;
  height: 190px;
  grid-template-columns: repeat(7, 1fr);
  gap: 14px;
}
.trend-column {
  display: grid;
  grid-template-rows: 20px 1fr 22px;
  align-items: end;
  text-align: center;
}
.trend-value,
.trend-label {
  font-size: 11px;
  opacity: 0.48;
}
.trend-track {
  height: 130px;
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
}
.trend-bar {
  width: 100%;
  background: var(--app-primary-color);
  opacity: 0.8;
  transition: height 0.35s ease;
}
.quick-link {
  display: flex;
  min-height: 58px;
  align-items: center;
  gap: 10px;
  border: 1px solid color-mix(in srgb, currentColor 9%, transparent);
  padding: 0 14px;
  color: inherit;
  text-decoration: none;
  transition: 0.15s;
}
.quick-link:hover {
  border-color: var(--app-primary-color);
  background: color-mix(in srgb, var(--app-primary-color) 7%, transparent);
}
@media (max-width: 640px) {
  .metric-panel {
    padding: 14px;
  }
  .metric-panel:nth-child(5) {
    grid-column: span 2;
  }
  .panel {
    padding: 16px;
  }
  .trend-chart {
    gap: 6px;
  }
}
</style>
