import type { IAuditable, IRole } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle, StatusMap, type NaiveType, type Status } from "@/utils";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Shield24Regular from "@vicons/fluent/es/Shield24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export type IRoleRow = IRole & IAuditable;

export const statusOptions = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
];

export const dataScopeOptions = [
  { label: "全部数据权限", value: 1 },
  { label: "自定义数据权限", value: 2 },
  { label: "本部门数据权限", value: 3 },
  { label: "本部门及以下数据权限", value: 4 },
  { label: "仅本人数据权限", value: 5 },
];

export const dataScopeMap: Record<number, string> = {
  1: "全部数据权限",
  2: "自定义数据权限",
  3: "本部门数据权限",
  4: "本部门及以下数据权限",
  5: "仅本人数据权限",
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
      key: "roleCode",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(TextNumberFormat24Regular, "显示顺序"),
      key: "roleSort",
      width: 110,
      align: "center",
      titleAlign: "center",
    },
    {
      title: RenderColumnTitle(Shield24Regular, "数据权限"),
      key: "dataScope",
      minWidth: 160,
      align: "center",
      titleAlign: "center",
      render: (row) => dataScopeMap[Number(row.dataScope)] ?? "未知",
    },
    {
      title: RenderColumnTitle(Status24Regular, "状态"),
      key: "status",
      width: 100,
      align: "center",
      titleAlign: "center",
      render: (row) => {
        const current = StatusMap.get(row.status as Status) ?? { label: "未知", type: "error" };
        return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
      },
    },
    {
      title: RenderColumnTitle(CalendarLtr24Regular, "创建时间"),
      key: "createdAt",
      width: 180,
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
                userStore.hasPermission("system:role:edit")
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
