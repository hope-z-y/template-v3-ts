import type { IPost } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle, type NaiveType } from "@/utils";
import Briefcase24Regular from "@vicons/fluent/es/Briefcase24Regular";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export type IPostRow = IPost;

export const statusOptions = [
  { label: "启用", value: "enabled" },
  { label: "禁用", value: "disabled" },
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
      minWidth: 110,
      align: "center",
      titleAlign: "center",
    },
    {
      title: RenderColumnTitle(Status24Regular, "状态"),
      key: "status",
      minWidth: 100,
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
      minWidth: 170,
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
                userStore.hasPermission("system:post:update")
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
