<template>
  <div class="relative w-full max-w-md" @click="openSearch">
    <NInput readonly placeholder="搜索菜单..." class="cursor-pointer">
      <template #prefix>
        <NIcon size="16">
          <Search24Regular />
        </NIcon>
      </template>

      <template #suffix>
        <kbd
          class="inline-flex shrink-0 items-center gap-1 rounded-sm border border-black/8 bg-black/3 px-1.5 py-1 text-[11px] font-medium leading-none text-black/45 dark:border-white/10 dark:bg-white/5 dark:text-white/45"
        >
          <span>{{ modifierKey }}</span>
          <span>K</span>
        </kbd>
      </template>
    </NInput>
  </div>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex justify-center bg-black/55 px-4 pt-[min(15vh,120px)] backdrop-blur-sm"
        @click.self="closeSearch"
      >
        <Transition
          appear
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2 scale-[0.98]"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 -translate-y-2 scale-[0.98]"
        >
          <div
            v-if="visible"
            class="h-fit w-full max-w-xl overflow-hidden rounded-xl border shadow-2xl"
            :style="modalStyle"
            @click.stop
          >
            <div
              class="flex items-center gap-3 border-b border-black/6 px-4 py-3 dark:border-white/8"
            >
              <NIcon :size="20" class="shrink-0 text-black/45 dark:text-white/45">
                <Search24Regular />
              </NIcon>
              <input
                ref="modalInputRef"
                v-model="keyword"
                type="search"
                class="min-w-0 flex-1 border-0 bg-transparent text-base text-black/88 outline-none placeholder:text-black/35 [&::-webkit-search-cancel-button]:hidden dark:text-white/90 dark:placeholder:text-white/35"
                placeholder="搜索菜单..."
                autocomplete="off"
                spellcheck="false"
                @keydown.down.prevent="moveActive(1)"
                @keydown.up.prevent="moveActive(-1)"
                @keydown.enter.prevent="selectActive"
                @keydown.esc.prevent="closeSearch"
              />
              <button
                type="button"
                class="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-black/45 transition-colors hover:bg-black/5 hover:text-black/70 dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white/80"
                aria-label="关闭搜索"
                @click="closeSearch"
              >
                <NIcon :size="18">
                  <Dismiss24Regular />
                </NIcon>
              </button>
            </div>

            <div class="max-h-[min(50vh,360px)] overflow-y-auto p-2">
              <template v-if="!keyword.trim()">
                <div class="px-3 py-8 text-center text-sm text-black/40 dark:text-white/40">
                  输入关键词搜索菜单
                </div>
              </template>

              <template v-else-if="filteredItems.length === 0">
                <div class="px-3 py-8 text-center text-sm text-black/40 dark:text-white/40">
                  未找到「{{ keyword.trim() }}」相关的菜单
                </div>
              </template>

              <ul v-else class="m-0 list-none p-0">
                <li
                  v-for="(item, index) in filteredItems"
                  :key="item.id"
                  class="cursor-pointer rounded-lg px-3 py-2.5 transition-colors"
                  :class="
                    index === activeIndex
                      ? ''
                      : 'text-black/78 hover:bg-black/4 dark:text-white/78 dark:hover:bg-white/6'
                  "
                  :style="index === activeIndex ? activeItemStyle : undefined"
                  @mouseenter="activeIndex = index"
                  @mousedown.prevent
                  @click="handleSelect(item)"
                >
                  <div class="text-sm font-medium">{{ item.label }}</div>
                  <div v-if="item.path" class="mt-0.5 text-xs text-black/40 dark:text-white/40">
                    {{ item.path }}
                  </div>
                </li>
              </ul>
            </div>

            <div
              class="flex items-center justify-between gap-4 border-t border-black/6 px-4 py-2.5 text-xs text-black/40 dark:border-white/8 dark:text-white/40"
            >
              <div class="flex flex-wrap items-center gap-3">
                <span class="inline-flex items-center gap-1.5">
                  <kbd :class="kbdClass">↑</kbd>
                  <kbd :class="kbdClass">↓</kbd>
                  <span>导航</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <kbd :class="kbdClass">↵</kbd>
                  <span>选择</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <kbd :class="kbdClass">esc</kbd>
                  <span>关闭</span>
                </span>
              </div>
              <span class="shrink-0">菜单搜索</span>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Dismiss24Regular, Search24Regular } from "@vicons/fluent";
import { useEventListener, useScrollLock } from "@vueuse/core";
import { NIcon, NInput, useThemeVars } from "naive-ui";
import { computed, nextTick, ref, watch } from "vue";
import { useRouter } from "vue-router";

export interface MenuSearchItem {
  id: string;
  label: string;
  path?: string;
  keywords?: string[];
}

const props = withDefaults(
  defineProps<{
    items?: MenuSearchItem[];
  }>(),
  {
    items: () => [
      { id: "home", label: "首页", path: "/home", keywords: ["home", "index"] },
      { id: "user", label: "用户管理", path: "/user", keywords: ["user", "manage"] },
    ],
  },
);

const emit = defineEmits<{
  select: [item: MenuSearchItem];
}>();

const router = useRouter();
const themeVars = useThemeVars();
const scrollLock = useScrollLock(document.body);

const visible = ref(false);
const keyword = ref("");
const activeIndex = ref(0);
const modalInputRef = ref<HTMLInputElement | null>(null);

const kbdClass =
  "inline-flex min-w-5 items-center justify-center rounded border border-black/8 bg-black/3 px-1.5 py-0.5 text-sm leading-none dark:border-white/10 dark:bg-white/5";

const modalStyle = computed(() => ({
  backgroundColor: themeVars.value.modalColor,
  borderColor: themeVars.value.borderColor,
}));

const activeItemStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${themeVars.value.primaryColor} 12%, transparent)`,
  color: themeVars.value.primaryColor,
}));

const isMac = computed(() => {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Mac/.test(navigator.userAgent);
});

const modifierKey = computed(() => (isMac.value ? "⌘" : "Ctrl"));

const filteredItems = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  if (!query) return [];

  return props.items.filter((item) => {
    if (item.label.toLowerCase().includes(query)) return true;
    if (item.path?.toLowerCase().includes(query)) return true;
    return item.keywords?.some((word) => word.toLowerCase().includes(query));
  });
});

watch(keyword, () => {
  activeIndex.value = 0;
});

watch(filteredItems, (items) => {
  if (activeIndex.value >= items.length) {
    activeIndex.value = Math.max(items.length - 1, 0);
  }
});

watch(visible, (show) => {
  scrollLock.value = show;
});

const openSearch = async () => {
  visible.value = true;
  await nextTick();
  modalInputRef.value?.focus();
};

const closeSearch = () => {
  visible.value = false;
  keyword.value = "";
  activeIndex.value = 0;
};

const moveActive = (step: number) => {
  if (!filteredItems.value.length) return;
  const total = filteredItems.value.length;
  activeIndex.value = (activeIndex.value + step + total) % total;
};

const handleSelect = (item: MenuSearchItem) => {
  if (item.path) {
    router.push(item.path);
  }
  emit("select", item);
  closeSearch();
};

const selectActive = () => {
  const item = filteredItems.value[activeIndex.value];
  if (item) handleSelect(item);
};

useEventListener(window, "keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (visible.value) {
      closeSearch();
    } else {
      openSearch();
    }
  }
});
</script>
