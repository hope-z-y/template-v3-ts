import type { IAuditable, IQueryUserParams, IUser } from "@/api/types";
import type { PageColumn, SearchFieldSchema } from "@/hooks";
import { CommonStatusOptions, GenderMap } from "@/utils/constant";
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
import { NAvatar, NTag, type TreeSelectOption } from "naive-ui";
import { h } from "vue";

/** 表格行数据 = 用户基础信息 + 审计字段（创建时间等） */
export type IUserRow = IUser & IAuditable;

/** 搜索区的查询模型 */
export interface IUserQuery {
  account?: string;
  username?: string;
  phone?: string;
  email?: string;
  status?: IQueryUserParams["status"];
  deptId?: string | null;
}

/** 新增 / 编辑弹窗的共享数据：由列表页 setData 传入，表单通过 modalApi.getData() 读取 */
export interface IUserModalData {
  mode: "create" | "edit";
  record: IUserRow | null;
}

/**
 * 搜索表单 schema 工厂：部门树 options 是页面里异步加载的响应式数据，
 * 通过 getter 注入（schema 的 props 支持函数形式，每次渲染取最新值）
 */
export const CreateSearchSchema = (deps: {
  getDeptTreeOptions: () => TreeSelectOption[];
  getDeptTreeLoading: () => boolean;
}): SearchFieldSchema<IUserQuery>[] => [
  { field: "account", label: "登录账号" },
  { field: "username", label: "用户名称" },
  { field: "phone", label: "手机号" },
  { field: "email", label: "邮箱" },
  { field: "status", label: "状态", component: "select", props: { options: CommonStatusOptions } },
  {
    field: "deptId",
    label: "所属部门",
    component: "tree-select",
    props: () => ({
      options: deps.getDeptTreeOptions(),
      loading: deps.getDeptTreeLoading(),
      defaultExpandAll: true,
      keyField: "key",
      labelField: "label",
      childrenField: "children",
    }),
  },
];

/** deptId 需要转成数组，默认构建规则覆盖不了，自定义 buildParams */
export const BuildUserParams = (query: IUserQuery, page: number, pageSize: number): IQueryUserParams => {
  const params: IQueryUserParams = { pageNum: page, pageSize };

  const account = query.account?.trim();
  const username = query.username?.trim();
  const phone = query.phone?.trim();
  const email = query.email?.trim();

  if (account) params.account = account;
  if (username) params.username = username;
  if (phone) params.phone = phone;
  if (email) params.email = email;
  if (query.status) params.status = query.status;
  if (query.deptId) params.deptId = [query.deptId];

  return params;
};

/** 无头像时，取用户名 / 账号首字母作为 Avatar 占位 */
const getDisplayInitial = (row: IUserRow) => {
  const name = row.username?.trim() || row.account?.trim() || "?";
  return name.slice(0, 1).toUpperCase();
};

/** 列定义工厂：编辑 / 重置密码回调由页面注入 */
export const CreateColumns = (handlers: {
  onEdit: (row: IUserRow) => void;
  onResetPassword: (row: IUserRow) => void;
}): PageColumn<IUserRow>[] => [
  { type: "selection" },
  { type: "index" },
  {
    key: "username",
    title: "用户名",
    icon: Person24Regular,
    minWidth: 140,
    maxWidth: 240,
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
    key: "account",
    title: "账号",
    icon: Person24Regular,
    minWidth: 120,
    maxWidth: 240,
    render: (row) => row.account || "-",
  },
  {
    key: "phone",
    title: "手机号",
    icon: Phone24Regular,
    minWidth: 140,
    maxWidth: 180,
    render: (row) => row.phone || "-",
  },
  {
    key: "email",
    title: "邮箱",
    icon: Mail24Regular,
    minWidth: 180,
    maxWidth: 220,
    ellipsis: { tooltip: true },
    render: (row) => row.email || "-",
  },
  {
    key: "gender",
    title: "性别",
    icon: Person24Regular,
    minWidth: 90,
    maxWidth: 120,
    render: (row) => GenderMap[row.gender] ?? "未知",
  },
  {
    key: "deptId",
    title: "所属部门",
    icon: Organization24Regular,
    minWidth: 140,
    maxWidth: 180,
    ellipsis: { tooltip: true },
    render: (row) => row.department?.deptName ?? "无部门",
  },
  {
    key: "status",
    title: "状态",
    icon: Status24Regular,
    minWidth: 100,
    maxWidth: 180,
    render: (row) =>
      row.status === "enabled"
        ? h(NTag, { type: "success", size: "small" }, { default: () => "启用" })
        : h(NTag, { type: "error", size: "small" }, { default: () => "禁用" }),
  },
  { key: "createdAt", title: "创建时间", icon: CalendarLtr24Regular, minWidth: 180 },
  {
    type: "actions",
    icon: Options24Regular,
    minWidth: 260,
    actions: [
      {
        label: "编辑",
        icon: Edit24Regular,
        auth: "system:user:update",
        onClick: handlers.onEdit,
      },
      {
        label: "重置密码",
        icon: KeyReset24Regular,
        buttonType: "warning",
        auth: "system:user:update",
        onClick: handlers.onResetPassword,
      },
      {
        label: "删除",
        icon: Delete24Regular,
        buttonType: "error",
        auth: "system:user:delete",
        confirm: (row) => `确定要删除用户「${row.username || row.account}」吗？`,
      },
    ],
  },
];
