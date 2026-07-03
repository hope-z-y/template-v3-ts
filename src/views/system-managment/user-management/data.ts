import type { IAuditable, IUser } from "@/api/types";
import { RenderColumnTitle, StatusMap, type NaiveType } from "@/utils";
import {
  CalendarLtr24Regular,
  Delete24Regular,
  Edit24Regular,
  KeyReset24Regular,
  Mail24Regular,
  Options24Regular,
  Organization24Regular,
  Person24Regular,
  Phone24Regular,
  Status24Regular,
} from "@vicons/fluent";
import { NAvatar, NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

export type IUserRow = IUser & IAuditable;

export const genderOptions = [
  { label: "未知", value: 0 },
  { label: "男", value: 1 },
  { label: "女", value: 2 },
];

export const genderMap: Record<number, string> = {
  0: "未知",
  1: "男",
  2: "女",
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

export interface IUserColumnOptions {
  onEdit: (row: IUserRow) => void;
  onDelete: (row: IUserRow) => void;
  onResetPassword?: (row: IUserRow) => void;
}

export const createUserColumns = (options: IUserColumnOptions): DataTableColumns<IUserRow> => {
  const { onEdit, onDelete, onResetPassword } = options;

  return [
    {
      title: RenderColumnTitle(Person24Regular, "用户名"),
      key: "nickname",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) =>
        h("span", { class: "inline-flex items-center justify-center gap-2" }, [
          row.avatar
            ? h(NAvatar, { round: true, size: "small", src: row.avatar })
            : h(NAvatar, { round: true, size: "small" }, { default: () => row.nickname?.slice(0, 1).toUpperCase() }),
          row.nickname,
        ]),
    },
    {
      title: RenderColumnTitle(Person24Regular, "账号"),
      key: "username",
      minWidth: 120,
      align: "center",
      titleAlign: "center",
      render: (row) => row.username || "-",
    },
    {
      title: RenderColumnTitle(Phone24Regular, "手机号"),
      key: "phone",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      render: (row) => row.phone || "-",
    },
    {
      title: RenderColumnTitle(Mail24Regular, "邮箱"),
      key: "email",
      minWidth: 180,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.email || "-",
    },
    {
      title: RenderColumnTitle(Person24Regular, "性别"),
      key: "gender",
      minWidth: 90,
      align: "center",
      titleAlign: "center",
      render: (row) => genderMap[Number(row.gender)] ?? "未知",
    },
    {
      title: RenderColumnTitle(Organization24Regular, "所属部门"),
      key: "deptId",
      minWidth: 140,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => {
        return row.dept.deptName ?? "无部门";
      },
    },
    {
      title: RenderColumnTitle(Status24Regular, "状态"),
      key: "status",
      minWidth: 100,
      align: "center",
      titleAlign: "center",
      render: (row) => {
        const current = StatusMap.get(row.status) ?? { label: "未知", type: "error" };
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
      width: onResetPassword ? 280 : 180,
      align: "center",
      titleAlign: "center",
      fixed: "right",
      render: (row) =>
        h(
          NSpace,
          { size: 8, justify: "space-between", inline: true },
          {
            default: () =>
              [
                renderActionButton("编辑", Edit24Regular, "primary", () => onEdit(row)),
                onResetPassword
                  ? renderActionButton("重置密码", KeyReset24Regular, "warning", () => onResetPassword(row))
                  : null,
                renderActionButton("删除", Delete24Regular, "error", () => onDelete(row)),
              ].filter(Boolean),
          },
        ),
    },
  ];
};
