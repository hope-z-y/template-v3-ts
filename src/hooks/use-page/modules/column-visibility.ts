import { computed, ref, watch } from "vue";

/** "列设置"弹出层里的一项 */
export interface ColumnVisibilityOption {
  key: string;
  title: string;
  visible: boolean;
  /** 不允许取消显示的列（操作列等） */
  disabled?: boolean;
}

/**
 * 表格列显隐状态：吸收原 useColumnVisibility。
 * 传入 storageKey 时会把用户的选择持久化到 localStorage，刷新页面后恢复。
 *
 * 注意持久化只存 { key, visible }，title/disabled 永远以代码里的最新定义为准，
 * 这样改了列名或新增列都不会被旧缓存"污染"。
 */
export const createColumnVisibility = (defaults: ColumnVisibilityOption[], storageKey?: string) => {
  const readStored = (): ColumnVisibilityOption[] => {
    if (!storageKey || typeof window === "undefined") return defaults;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return defaults;

      const visibleMap = new Map(
        (JSON.parse(raw) as Array<Pick<ColumnVisibilityOption, "key" | "visible">>).map((item) => [
          item.key,
          item.visible,
        ]),
      );

      return defaults.map((item) => ({
        ...item,
        // disabled 的列强制可见，其余列优先取缓存里的用户选择
        visible: item.disabled ? true : (visibleMap.get(item.key) ?? item.visible),
      }));
    } catch {
      // 缓存损坏时静默回退到默认配置
      return defaults;
    }
  };

  const columnOptions = ref<ColumnVisibilityOption[]>(readStored());

  /** 可见列 key 集合，供列过滤时 O(1) 查询 */
  const visibleKeys = computed(
    () => new Set(columnOptions.value.filter((item) => item.visible).map((item) => item.key)),
  );

  const setVisible = (key: string, visible: boolean) => {
    columnOptions.value = columnOptions.value.map((column) => (column.key === key ? { ...column, visible } : column));
  };

  watch(
    columnOptions,
    (value) => {
      if (!storageKey || typeof window === "undefined") return;
      window.localStorage.setItem(storageKey, JSON.stringify(value.map(({ key, visible }) => ({ key, visible }))));
    },
    { deep: true },
  );

  return {
    columnOptions,
    visibleKeys,
    setVisible,
  };
};
