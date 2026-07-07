<template>
  <div
    ref="scrollRef"
    class="scrollbar-none w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden border-t border-t-gray-300 pt-2 dark:border-t-gray-600"
    :class="{ 'cursor-grabbing select-none': isDragging }"
    @mousedown="onDragStart"
    @wheel="onWheel"
  >
    <LayoutGroup>
      <motion.ul
        layout
        class="m-0 flex w-max list-none flex-nowrap items-center gap-1.5"
        @contextmenu="handleListContextMenu"
      >
        <AnimatePresence mode="popLayout" :initial="false">
          <motion.li
            v-for="tag in tags"
            :key="tag.path"
            layout
            class="flex shrink-0 cursor-pointer origin-center"
            :data-path="tag.path"
            :initial="tagMotion.initial"
            :animate="tagMotion.animate"
            :exit="tagMotion.exit"
            :transition="tagMotion.transition"
            @contextmenu="(e) => handleContextMenu(e, tag.path)"
            @click="handleTagClick(tag.path)"
          >
            <NTag
              :bordered="false"
              :type="getTagType(tag)"
              :closable="tag.path !== '/home'"
              @close="(e: MouseEvent) => handleClose(e, tag.path)"
            >
              <template #icon>
                <NIcon :size="16" :component="getTagIcon(tag)" :color="getIconColor(tag)" />
              </template>
              {{ tag.title }}
            </NTag>
          </motion.li>
        </AnimatePresence>
      </motion.ul>
    </LayoutGroup>
  </div>

  <NDropdown
    placement="bottom-start"
    trigger="manual"
    :x="x"
    :y="y"
    :options="actions"
    :show="showDropdown"
    :on-clickoutside="onClickOutside"
    @update:show="(v) => (showDropdown = v)"
    @select="handleSelect"
  />
</template>

<script setup lang="ts">
import { useMenuTagStore, type MenuTagItem } from "@/stores/menu-tag";
import { getFluentIconComponent } from "@/utils";
import ArrowCounterclockwise24Regular from "@vicons/fluent/es/ArrowCounterclockwise24Regular";
import BoardSplit24Regular from "@vicons/fluent/es/BoardSplit24Regular";
import Dismiss24Regular from "@vicons/fluent/es/Dismiss24Regular";
import Tag24Regular from "@vicons/fluent/es/Tag24Regular";
import TagDismiss24Regular from "@vicons/fluent/es/TagDismiss24Regular";
import TextGrammarArrowLeft24Regular from "@vicons/fluent/es/TextGrammarArrowLeft24Regular";
import TextGrammarArrowRight24Regular from "@vicons/fluent/es/TextGrammarArrowRight24Regular";
import TextGrammarDismiss24Regular from "@vicons/fluent/es/TextGrammarDismiss24Regular";
import { AnimatePresence, LayoutGroup, motion } from "motion-v";
import { NDropdown, NIcon, NTag, useThemeVars, type TagProps } from "naive-ui";
import { storeToRefs } from "pinia";
import { computed, h, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";

const DRAG_THRESHOLD = 5;

const HOME_PATH = "/home";

type MenuActionKey =
  "closeLeftMenu" | "closeRightMenu" | "closeAllMenu" | "closeCurrentPage" | "refreshPage" | "affixedCurrentMenu";

const router = useRouter();
const themeVars = useThemeVars();
const menuTagStore = useMenuTagStore();
const { tags, activePath } = storeToRefs(menuTagStore);

const scrollRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const dragState = {
  active: false,
  startX: 0,
  scrollLeft: 0,
  moved: false,
};
const { isActive, closeLeft, closeRight, closeAll, closeCurrent, refreshTag, toggleAffix, removeTag } = menuTagStore;

/** 标签进入、退出与排序时的 motion 配置 */
const tagMotion = {
  initial: { opacity: 0, scale: 0.82, x: 14 },
  animate: { opacity: 1, scale: 1, x: 0 },
  exit: { opacity: 0, scale: 0.82, x: -14, filter: "blur(2px)" },
  transition: {
    layout: { type: "spring", stiffness: 520, damping: 38, mass: 0.75 },
    opacity: { duration: 0.18 },
    scale: { duration: 0.18 },
    x: { duration: 0.18 },
    filter: { duration: 0.12 },
  },
} as const;

const createAction = (key: MenuActionKey, label: string, icon: typeof Tag24Regular) => ({
  label,
  key,
  icon: () => h(NIcon, null, () => h(icon)),
});

const showDropdown = ref(false);
const x = ref(0);
const y = ref(0);
const contextMenuPath = ref("");

/** 根据右键目标标签动态生成菜单项 */
const actions = computed(() => {
  const path = contextMenuPath.value;
  if (!path) return [];

  const tag = tags.value.find((item) => item.path === path);
  if (!tag) return [];

  if (path === HOME_PATH) {
    return [
      createAction("closeRightMenu", "关闭右侧菜单", TextGrammarArrowRight24Regular),
      createAction("closeAllMenu", "关闭所有菜单", TextGrammarDismiss24Regular),
      createAction("refreshPage", "刷新页面", ArrowCounterclockwise24Regular),
    ];
  }

  const menuActions = [
    createAction("closeLeftMenu", "关闭左侧菜单", TextGrammarArrowLeft24Regular),
    createAction("closeRightMenu", "关闭右侧菜单", TextGrammarArrowRight24Regular),
    createAction("closeAllMenu", "关闭所有菜单", TextGrammarDismiss24Regular),
    createAction("closeCurrentPage", "关闭当前页面", Dismiss24Regular),
    createAction("refreshPage", "刷新页面", ArrowCounterclockwise24Regular),
    tag.affixed
      ? createAction("affixedCurrentMenu", "取消固定", TagDismiss24Regular)
      : createAction("affixedCurrentMenu", "固定当前菜单", Tag24Regular),
  ];

  return menuActions;
});

const getTagIcon = (tag: MenuTagItem) => {
  if (tag.affixed) return Tag24Regular;
  return getFluentIconComponent(tag.icon) ?? BoardSplit24Regular;
};

/** 选中标签图标使用 success 色，固定但未选中使用 warning 色 */
const getIconColor = (tag: MenuTagItem) => {
  if (isActive(tag.path)) return themeVars.value.successColor;
  if (tag.affixed) return themeVars.value.warningColor;
  return undefined;
};

/** 选中标签为 success；固定但未选中为 warning；其余为 default */
const getTagType = (tag: MenuTagItem): TagProps["type"] => {
  if (isActive(tag.path)) return "success";
  if (tag.affixed) return "warning";
  return "default";
};

const handleTagClick = (path: string) => {
  if (dragState.moved) return;
  if (path !== router.currentRoute.value.path) {
    router.push(path);
  }
};

/** 将当前激活标签滚动到可视区域中央 */
const scrollActiveTagIntoView = (path: string) => {
  const container = scrollRef.value;
  if (!container || !path) return;

  const tagEl = container.querySelector<HTMLElement>(`[data-path="${CSS.escape(path)}"]`);
  tagEl?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
};

watch(
  activePath,
  (path) => {
    nextTick(() => scrollActiveTagIntoView(path));
  },
  { immediate: true },
);

watch(tags, () => {
  nextTick(() => scrollActiveTagIntoView(activePath.value));
});

const onDragMove = (e: MouseEvent) => {
  const el = scrollRef.value;
  if (!el || !dragState.active) return;

  const delta = e.pageX - dragState.startX;
  if (!isDragging.value) {
    if (Math.abs(delta) <= DRAG_THRESHOLD) return;
    isDragging.value = true;
    dragState.moved = true;
  }

  el.scrollLeft = dragState.scrollLeft - delta;
  e.preventDefault();
};

const onDragEnd = () => {
  dragState.active = false;
  isDragging.value = false;
  document.removeEventListener("mousemove", onDragMove);
  document.removeEventListener("mouseup", onDragEnd);

  if (dragState.moved) {
    window.setTimeout(() => {
      dragState.moved = false;
    }, 0);
  }
};

const canScrollHorizontally = () => {
  const el = scrollRef.value;
  if (!el) return false;
  return el.scrollWidth > el.clientWidth + 1;
};

const onDragStart = (e: MouseEvent) => {
  const el = scrollRef.value;
  if (!el || e.button !== 0) return;
  if ((e.target as HTMLElement).closest(".n-tag__close")) return;
  if (!canScrollHorizontally()) return;

  dragState.active = true;
  dragState.moved = false;
  dragState.startX = e.pageX;
  dragState.scrollLeft = el.scrollLeft;

  document.addEventListener("mousemove", onDragMove);
  document.addEventListener("mouseup", onDragEnd);
};

/** 鼠标滚轮纵向滚动时转为横向滚动 */
const onWheel = (e: WheelEvent) => {
  const el = scrollRef.value;
  if (!el || !canScrollHorizontally()) return;
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

  e.preventDefault();
  el.scrollLeft += e.deltaY;
};

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onDragMove);
  document.removeEventListener("mouseup", onDragEnd);
});

const handleClose = (e: MouseEvent, path: string) => {
  e.stopPropagation();
  removeTag(path);
};

/** 阻止列表空白区域触发浏览器默认右键菜单 */
const handleListContextMenu = (e: MouseEvent) => {
  e.preventDefault();
};

const handleContextMenu = (e: MouseEvent, path: string) => {
  e.preventDefault();
  e.stopPropagation();
  contextMenuPath.value = path;
  showDropdown.value = false;
  nextTick().then(() => {
    showDropdown.value = true;
    x.value = e.clientX;
    y.value = e.clientY;
  });
};

const handleSelect = (key: string | number) => {
  const path = contextMenuPath.value;
  if (!path) return;

  switch (key) {
    case "closeLeftMenu":
      closeLeft(path);
      break;
    case "closeRightMenu":
      closeRight(path);
      break;
    case "closeAllMenu":
      closeAll();
      break;
    case "closeCurrentPage":
      closeCurrent(path);
      break;
    case "refreshPage":
      refreshTag(path);
      break;
    case "affixedCurrentMenu":
      toggleAffix(path);
      break;
  }

  showDropdown.value = false;
};

const onClickOutside = () => (showDropdown.value = false);
</script>
