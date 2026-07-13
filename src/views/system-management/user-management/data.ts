/**
 * 用户管理 - 表格列与公共选项配置
 *
 * 本文件集中维护：
 * - 表格行类型 IUserRow
 * - 状态 / 性别等下拉选项
 * - createUserColumns：生成 Naive UI 表格列（含自定义 render）
 */

import type { Gender, IAuditable, IUser } from "@/api/types";
import { useUserStore } from "@/stores";
import { RenderColumnTitle, type NaiveType } from "@/utils";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import KeyReset24Regular from "@vicons/fluent/es/KeyReset24Regular";
import Mail24Regular from "@vicons/fluent/es/Mail24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Organization24Regular from "@vicons/fluent/es/Organization24Regular";
import Person24Regular from "@vicons/fluent/es/Person24Regular";
import Phone24Regular from "@vicons/fluent/es/Phone24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import { NAvatar, NButton, NIcon, NSpace, NTag, type DataTableColumns } from "naive-ui";
import { h, type Component } from "vue";

// #region 类型定义
/** 表格行数据 = 用户基础信息 + 审计字段（创建时间等） */
export type IUserRow = IUser & IAuditable;
// #endregion

// #region 下拉选项与映射
/** 用户状态选项（表单 / 筛选复用） */
export const statusOptions = [
  { label: "启用", value: "enabled" },
  { label: "禁用", value: "disabled" },
];

/** 性别选项 */
export const genderOptions = [
  { label: "未知", value: "unknown" },
  { label: "男", value: "male" },
  { label: "女", value: "female" },
];

/** 性别枚举 -> 展示文案 */
export const genderMap: Record<Gender, string> = {
  unknown: "未知",
  male: "男",
  female: "女",
};
// #endregion

// #region 操作按钮渲染
/**
 * 渲染表格「操作」列中的文字按钮（带图标）
 * 使用 h() 创建虚拟 DOM，是 Naive UI 自定义列 render 的常见写法
 */
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
// #endregion

// #region 列配置入参类型
/** createUserColumns 所需的操作回调，由 index.vue 传入 */
export interface IUserColumnOptions {
  onEdit: (row: IUserRow) => void;
  onDelete: (row: IUserRow) => void;
  onResetPassword?: (row: IUserRow) => void;
}
// #endregion

// #region 头像首字母工具
/** 无头像时，取用户名/账号首字母作为 Avatar 占位 */
const getDisplayInitial = (row: IUserRow) => {
  const name = row.username?.trim() || row.account?.trim() || "?";
  return name.slice(0, 1).toUpperCase();
};
// #endregion

// #region 表格列定义
/**
 * 生成用户管理表格的全部业务列
 * @param options 行内「编辑 / 删除 / 重置密码」回调
 */
export const createUserColumns = (options: IUserColumnOptions): DataTableColumns<IUserRow> => {
  const { onEdit, onDelete, onResetPassword } = options;
  const userStore = useUserStore();

  return [
    {
      title: RenderColumnTitle(Person24Regular, "用户名"),
      key: "username",
      minWidth: 140,
      maxWidth: 240,
      resizable: true,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      // 头像 + 用户名组合展示
      render: (row) =>
        h("span", { class: "inline-flex items-center justify-center gap-2" }, [
          row.avatar
            ? h(NAvatar, { round: true, size: "small", src: row.avatar })
            : h(NAvatar, { round: true, size: "small" }, { default: () => getDisplayInitial(row) }),
          row.username || row.account || "-",
        ]),
    },
    {
      title: RenderColumnTitle(Person24Regular, "账号"),
      key: "account",
      minWidth: 120,
      resizable: true,
      maxWidth: 240,
      align: "center",
      titleAlign: "center",
      render: (row) => row.account || "-",
    },
    {
      title: RenderColumnTitle(Phone24Regular, "手机号"),
      key: "phone",
      minWidth: 140,
      resizable: true,
      maxWidth: 180,
      align: "center",
      titleAlign: "center",
      render: (row) => row.phone || "-",
    },
    {
      title: RenderColumnTitle(Mail24Regular, "邮箱"),
      key: "email",
      minWidth: 180,
      maxWidth: 220,
      resizable: true,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.email || "-",
    },
    {
      title: RenderColumnTitle(Person24Regular, "性别"),
      key: "gender",
      minWidth: 90,
      maxWidth: 120,
      resizable: true,
      align: "center",
      titleAlign: "center",
      render: (row) => genderMap[row.gender] ?? "未知",
    },
    {
      title: RenderColumnTitle(Organization24Regular, "所属部门"),
      key: "deptId",
      minWidth: 140,
      maxWidth: 180,
      resizable: true,
      align: "center",
      titleAlign: "center",
      ellipsis: { tooltip: true },
      render: (row) => row.department?.deptName ?? "无部门",
    },
    {
      title: RenderColumnTitle(Status24Regular, "状态"),
      key: "status",
      minWidth: 100,
      maxWidth: 180,
      resizable: true,
      align: "center",
      titleAlign: "center",
      // StatusMap 统一维护状态文案与 Tag 颜色
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
      width: 180,
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
                userStore.hasPermission("system:user:update")
                  ? renderActionButton("编辑", Edit24Regular, "primary", () => onEdit(row))
                  : null,
                onResetPassword && userStore.hasPermission("system:user:update")
                  ? renderActionButton("重置密码", KeyReset24Regular, "warning", () => onResetPassword(row))
                  : null,
                userStore.hasPermission("system:user:delete")
                  ? renderActionButton("删除", Delete24Regular, "error", () => onDelete(row))
                  : null,
              ].filter(Boolean),
          },
        ),
    },
  ];
};
// #endregion
