import type { IMenu } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle, StatusMap, getFluentIconComponent, type NaiveType, type Status } from "@/utils";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextBulletListSquare24Regular from "@vicons/fluent/es/TextBulletListSquare24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NButton, NEllipsis, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export const statusOptions = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
];

export const visibleOptions = [
  { label: "显示", value: 1 },
  { label: "隐藏", value: 0 },
];

export const menuTypeOptions = [
  { label: "目录", value: "M" },
  { label: "菜单", value: "C" },
  { label: "按钮", value: "F" },
];

export const menuTypeMap: Record<string, { label: string; type: "info" | "success" | "warning" }> = {
  M: { label: "目录", type: "info" },
  C: { label: "菜单", type: "success" },
  F: { label: "按钮", type: "warning" },
};

export const isFrameOptions = [
  { label: "是", value: 1 },
  { label: "否", value: 0 },
];

export const isCacheOptions = [
  { label: "缓存", value: 1 },
  { label: "不缓存", value: 0 },
];

const renderActionButton = (label: string, icon: Component, type: NaiveType, onClick: () => void) => {
  return h(
    NButton,
    { text: true, type, onClick },
    {
      icon: () => h(NIcon, null, { default: () => h(icon) }),
      default: () => label,
    },
  );
};

export interface IMenuColumnHandlers {
  onEdit: (row: IMenu) => void;
  onDelete: (row: IMenu) => void;
}

export const createMenuColumns = (handlers: IMenuColumnHandlers): DataTableColumns<IMenu> => {
  const userStore = useUserStore();

  return [
    {
      title: RenderColumnTitle(TextBulletListSquare24Regular, "菜单名称"),
      key: "menuName",
      tree: true,
      minWidth: 200,
      align: "left",
      titleAlign: "center",
      render: (row) => {
        const iconComponent = getFluentIconComponent(row.icon);
        const content = h(
          "span",
          { class: "inline-flex min-w-0 max-w-full items-center gap-2" },
          [
            iconComponent ? h(NIcon, { size: 18, class: "shrink-0" }, { default: () => h(iconComponent) }) : null,
            h("span", { class: "truncate" }, row.menuName),
          ].filter(Boolean),
        );

        return h(NEllipsis, { tooltip: true }, { default: () => content });
      },
    },
    {
      title: RenderColumnTitle(TextBulletListSquare24Regular, "类型"),
      key: "menuType",
      width: 90,
      align: "center",
      titleAlign: "center",
      render: (row) => {
        const current = menuTypeMap[row.menuType] ?? { label: row.menuType, type: "info" as const };
        return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
      },
    },
    {
      title: RenderColumnTitle(TextNumberFormat24Regular, "排序"),
      key: "sort",
      width: 80,
      align: "center",
      titleAlign: "center",
    },
    {
      title: RenderColumnTitle(TextBulletListSquare24Regular, "权限标识"),
      key: "permission",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.permission || "-",
    },
    {
      title: RenderColumnTitle(TextBulletListSquare24Regular, "路由地址"),
      key: "path",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.path || "-",
    },
    {
      title: RenderColumnTitle(Status24Regular, "状态"),
      key: "status",
      width: 90,
      align: "center",
      titleAlign: "center",
      render: (row) => {
        const current = StatusMap.get(row.status as Status) ?? { label: "未知", type: "error" };
        return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
      },
    },
    {
      title: RenderColumnTitle(Options24Regular, "操作"),
      key: "actions",
      width: 170,
      align: "center",
      titleAlign: "center",
      fixed: "right",
      render: (row) =>
        h(
          NSpace,
          { size: 8, justify: "center", inline: true },
          {
            default: () =>
              [
                userStore.hasPermission("system:menu:edit")
                  ? renderActionButton("编辑", Edit24Regular, "primary", () => handlers.onEdit(row))
                  : null,
                userStore.hasPermission("system:menu:delete")
                  ? renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row))
                  : null,
              ].filter(Boolean),
          },
        ),
    },
  ];
};
