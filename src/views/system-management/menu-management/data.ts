import type { IMenu } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle, GetAntdIconComponent, type NaiveType } from "@/utils";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextBulletListSquare24Regular from "@vicons/fluent/es/TextBulletListSquare24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NButton, NEllipsis, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export const statusOptions = [
  { label: "启用", value: "enabled" },
  { label: "禁用", value: "disabled" },
];

export const visibleOptions = [
  { label: "显示", value: true },
  { label: "隐藏", value: false },
];

export const menuTypeOptions = [
  { label: "目录", value: "directory" },
  { label: "菜单", value: "menu" },
  { label: "按钮", value: "button" },
];

export const menuTypeMap: Record<string, { label: string; type: "info" | "success" | "warning" }> = {
  directory: { label: "目录", type: "info" },
  menu: { label: "菜单", type: "success" },
  button: { label: "按钮", type: "warning" },
};

export const isFrameOptions = [
  { label: "是", value: true },
  { label: "否", value: false },
];

export const isCacheOptions = [
  { label: "缓存", value: true },
  { label: "不缓存", value: false },
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
      titleAlign: "left",
      render: (row) => {
        const iconComponent = GetAntdIconComponent(row.icon);
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
      key: "permissionCode",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.permissionCode || "-",
    },
    {
      title: RenderColumnTitle(TextBulletListSquare24Regular, "路由地址"),
      key: "routePath",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.routePath || "-",
    },
    {
      title: RenderColumnTitle(Status24Regular, "状态"),
      key: "status",
      width: 90,
      align: "center",
      titleAlign: "center",
      render: (row) => {
        const current =
          row.status === "enabled"
            ? { label: "启用", type: "success" as const }
            : { label: "禁用", type: "error" as const };
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
                userStore.hasPermission("system:menu:update")
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
