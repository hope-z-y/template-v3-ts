import * as FluentIcons from "@vicons/fluent";
import type { Component } from "vue";

/** 菜单可选图标（均为 Fluent 24 Regular 线框风格） */
export const MENU_FLUENT_ICON_NAMES = [
  "Settings24Regular",
  "People24Regular",
  "Person24Regular",
  "Shield24Regular",
  "TextBulletListSquare24Regular",
  "Organization24Regular",
  "Briefcase24Regular",
  "Book24Regular",
  "Wrench24Regular",
  "Pulse24Regular",
  "SignIn24Regular",
  "History24Regular",
  "Home24Regular",
  "Apps24Regular",
  "Grid24Regular",
  "Document24Regular",
  "Folder24Regular",
  "Database24Regular",
  "Server24Regular",
  "Cloud24Regular",
  "Globe24Regular",
  "Link24Regular",
  "Mail24Regular",
  "Phone24Regular",
  "CalendarLtr24Regular",
  "Calendar24Regular",
  "ChartMultiple24Regular",
  "Money24Regular",
  "Cart24Regular",
  "Building24Regular",
  "Desktop24Regular",
  "Laptop24Regular",
  "Print24Regular",
  "Image24Regular",
  "Camera24Regular",
  "Video24Regular",
  "Mic24Regular",
  "Key24Regular",
  "LockClosed24Regular",
  "Alert24Regular",
  "Info24Regular",
  "Star24Regular",
  "Bookmark24Regular",
  "Tag24Regular",
  "Attach24Regular",
  "Share24Regular",
  "Copy24Regular",
  "Clipboard24Regular",
  "Search24Regular",
  "Filter24Regular",
  "Options24Regular",
  "PanelLeft24Regular",
  "Code24Regular",
  "ArrowUpload24Regular",
  "ArrowDownload24Regular",
  "Add24Regular",
  "Edit24Regular",
  "Delete24Regular",
  "Checkmark24Regular",
  "Dismiss24Regular",
  "AlignCenterHorizontal20Regular",
] as const;

export type MenuFluentIconName = (typeof MENU_FLUENT_ICON_NAMES)[number];

const fluentIconMap = FluentIcons as Record<string, Component>;

/** 是否为 vicons/fluent 中存在的 24Regular 图标名 */
export const isFluentMenuIconName = (iconName?: string | null): iconName is string => {
  return Boolean(iconName?.endsWith("24Regular") && fluentIconMap[iconName]);
};

/**
 * 根据 Fluent 图标组件名解析图标组件。
 * 仅接受以 24Regular 结尾且在图标库中存在的名称，否则返回 null。
 */
export const getFluentIconComponent = (iconName?: string | null): Component | null => {
  if (!isFluentMenuIconName(iconName)) return null;
  return fluentIconMap[iconName];
};
