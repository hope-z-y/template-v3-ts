import type { IDept } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle } from "@/utils";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Mail24Regular from "@vicons/fluent/es/Mail24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Organization24Regular from "@vicons/fluent/es/Organization24Regular";
import Person24Regular from "@vicons/fluent/es/Person24Regular";
import Phone24Regular from "@vicons/fluent/es/Phone24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export const statusOptions = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
];

export const statusMap: Record<number, { label: string; type: "success" | "error" }> = {
  1: { label: "启用", type: "success" },
  0: { label: "禁用", type: "error" },
};

const renderActionButton = (label: string, icon: Component, type: "primary" | "error", onClick: () => void) => {
  return h(
    NButton,
    { text: true, type, onClick },
    {
      icon: () => h(NIcon, null, { default: () => h(icon) }),
      default: () => label,
    },
  );
};

export interface IDeptColumnHandlers {
  onEdit: (row: IDept) => void;
  onDelete: (row: IDept) => void;
}

export const createDeptColumns = (handlers: IDeptColumnHandlers): DataTableColumns<IDept> => {
  const userStore = useUserStore();

  return [
    {
      title: RenderColumnTitle(Organization24Regular, "部门名称"),
      key: "deptName",
      minWidth: 200,
      align: "left",
      titleAlign: "left",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(TextNumberFormat24Regular, "显示顺序"),
      key: "sort",
      width: 110,
      align: "center",
      titleAlign: "center",
    },
    {
      title: RenderColumnTitle(Person24Regular, "负责人"),
      key: "leader",
      width: 130,
      align: "center",
      titleAlign: "center",
      render: (row) => row.leader || "-",
    },
    {
      title: RenderColumnTitle(Phone24Regular, "联系电话"),
      key: "phone",
      width: 150,
      align: "center",
      titleAlign: "center",
      render: (row) => row.phone || "-",
    },
    {
      title: RenderColumnTitle(Mail24Regular, "邮箱"),
      key: "email",
      minWidth: 190,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.email || "-",
    },
    {
      title: RenderColumnTitle(Status24Regular, "状态"),
      key: "status",
      width: 110,
      align: "center",
      titleAlign: "center",
      render: (row) => {
        const status = Number(row.status);
        const current = statusMap[status] ?? { label: "未知", type: "error" as const };
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
                userStore.hasPermission("system:dept:edit")
                  ? renderActionButton("编辑", Edit24Regular, "primary", () => handlers.onEdit(row))
                  : null,
                userStore.hasPermission("system:dept:delete")
                  ? renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row))
                  : null,
              ].filter(Boolean),
          },
        ),
    },
  ];
};
