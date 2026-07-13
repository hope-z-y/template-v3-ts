import type { IRole } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle, type NaiveType } from "@/utils";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Shield24Regular from "@vicons/fluent/es/Shield24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export type IRoleRow = IRole;

export const statusOptions = [
  { label: "启用", value: "enabled" },
  { label: "禁用", value: "disabled" },
];

export const dataScopeOptions = [
  { label: "全部数据权限", value: "all" },
  { label: "自定义数据权限", value: "custom" },
  { label: "本部门数据权限", value: "department" },
  { label: "本部门及以下数据权限", value: "department_and_children" },
  { label: "仅本人数据权限", value: "self" },
];

export const dataScopeMap: Record<string, string> = {
  all: "全部数据权限",
  custom: "自定义数据权限",
  department: "本部门数据权限",
  department_and_children: "本部门及以下数据权限",
  self: "仅本人数据权限",
};

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

export interface IRoleColumnHandlers {
  onEdit: (row: IRoleRow) => void;
  onDelete: (row: IRoleRow) => void;
}

export const createRoleColumns = (handlers: IRoleColumnHandlers): DataTableColumns<IRoleRow> => {
  const userStore = useUserStore();

  return [
    {
      title: RenderColumnTitle(Shield24Regular, "角色名称"),
      key: "roleName",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(Shield24Regular, "角色编码"),
      key: "roleKey",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(TextNumberFormat24Regular, "显示顺序"),
      key: "roleSort",
      minWidth: 110,
      align: "center",
      titleAlign: "center",
    },
    {
      title: RenderColumnTitle(Shield24Regular, "数据权限"),
      key: "dataScope",
      minWidth: 160,
      align: "center",
      titleAlign: "center",
      render: (row) => dataScopeMap[row.dataScope] ?? "未知",
    },
    {
      title: RenderColumnTitle(Status24Regular, "状态"),
      key: "status",
      width: 100,
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
      title: RenderColumnTitle(CalendarLtr24Regular, "创建时间"),
      key: "createdAt",
      minWidth: 180,
      align: "center",
      titleAlign: "center",
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
                userStore.hasPermission("system:role:update")
                  ? renderActionButton("编辑", Edit24Regular, "primary", () => handlers.onEdit(row))
                  : null,
                userStore.hasPermission("system:role:delete")
                  ? renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row))
                  : null,
              ].filter(Boolean),
          },
        ),
    },
  ];
};
