import type { MenuType } from "@/api/types";

type MenuTypeTagType = "info" | "success" | "warning";

/** 菜单显示状态选项 */
export const VisibleOptions = [
  { label: "显示", value: true },
  { label: "隐藏", value: false },
];

/** 菜单类型选项 */
export const MenuTypeOptions = [
  { label: "目录", value: "directory" },
  { label: "菜单", value: "menu" },
  { label: "按钮", value: "button" },
];

/** 菜单类型 -> 标签展示映射 */
export const MenuTypeMap: Record<MenuType, { label: string; type: MenuTypeTagType }> = {
  directory: { label: "目录", type: "info" },
  menu: { label: "菜单", type: "success" },
  button: { label: "按钮", type: "warning" },
};

/** 是否缓存选项 */
export const IsCacheOptions = [
  { label: "缓存", value: true },
  { label: "不缓存", value: false },
];
