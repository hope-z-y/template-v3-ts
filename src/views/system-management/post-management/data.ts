import type { IAuditable, IPost } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle, StatusMap, type NaiveType, type Status } from "@/utils";
import Briefcase24Regular from "@vicons/fluent/es/Briefcase24Regular";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export type IPostRow = IPost & IAuditable;

export const statusOptions = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
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

export interface IPostColumnHandlers {
  onEdit: (row: IPostRow) => void;
  onDelete: (row: IPostRow) => void;
}

export const createPostColumns = (handlers: IPostColumnHandlers): DataTableColumns<IPostRow> => {
  const userStore = useUserStore();

  return [
    {
      title: RenderColumnTitle(Briefcase24Regular, "岗位编码"),
      key: "postCode",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(Briefcase24Regular, "岗位名称"),
      key: "postName",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
    },
    {
      title: RenderColumnTitle(TextNumberFormat24Regular, "显示顺序"),
      key: "postSort",
      width: 110,
      align: "center",
      titleAlign: "center",
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
                userStore.hasPermission("system:post:edit")
                  ? renderActionButton("编辑", Edit24Regular, "primary", () => handlers.onEdit(row))
                  : null,
                userStore.hasPermission("system:post:delete")
                  ? renderActionButton("删除", Delete24Regular, "error", () => handlers.onDelete(row))
                  : null,
              ].filter(Boolean),
          },
        ),
    },
  ];
};
