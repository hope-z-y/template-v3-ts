import * as AntdIcons from "@vicons/antd";
import type { Component } from "vue";

/** @vicons/antd 导出的图标组件映射 */
export const AntdIconMap = AntdIcons as unknown as Readonly<Record<string, Component>>;

/** 可供菜单和图标选择器使用的 Ant Design 图标名称 */
export const ANTD_ICON_NAMES = Object.keys(AntdIconMap);

/**
 * IsAntdMenuIconName
 * 判断给定名称是否为 @vicons/antd 中存在的图标组件名。
 *
 * @param iconName - 图标组件名称，允许为 undefined 或 null
 * @returns iconName is string - 存在时为 true（并收窄为 string），否则为 false
 */
export const IsAntdMenuIconName = (iconName?: string | null): iconName is string => {
  return Boolean(iconName && AntdIconMap[iconName]);
};

/**
 * GetAntdIconComponent
 * 根据 Antd 图标组件名解析对应的 Vue 图标组件。
 *
 * @param iconName - 图标组件名称，允许为 undefined 或 null
 * @returns Component | null - 匹配到时返回组件，否则返回 null
 */
export const GetAntdIconComponent = (iconName?: string | null): Component | null => {
  if (!IsAntdMenuIconName(iconName)) return null;
  return AntdIconMap[iconName as string];
};
