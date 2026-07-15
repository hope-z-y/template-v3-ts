import type { CommonStatus, IRole } from "@/api/types";
import type { PageColumn, SearchFieldSchema } from "@/hooks";
import { CommonStatusOptions, DataScopeMap } from "@/utils/constant";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Shield24Regular from "@vicons/fluent/es/Shield24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NTag } from "naive-ui";
import { h } from "vue";

/** 列表行数据类型（与接口返回的角色实体一致） */
export type IRoleRow = IRole;

/** 搜索区的查询模型 */
export interface IRoleQuery {
  roleName?: string;
  roleKey?: string;
  status?: CommonStatus;
}

/** 新增 / 编辑弹窗的共享数据：由列表页 setData 传入，表单通过 modalApi.getData() 读取 */
export interface IRoleModalData {
  mode: "create" | "edit";
  record: IRoleRow | null;
}

/** 搜索表单 schema */
export const SearchSchema: SearchFieldSchema<IRoleQuery>[] = [
  { field: "roleName", label: "角色名称" },
  { field: "roleKey", label: "角色编码" },
  { field: "status", label: "状态", component: "select", props: { options: CommonStatusOptions } },
];

export const IsSuperAdminRole = (row: IRoleRow) => row.roleKey === "admin";

/** 列定义工厂：编辑回调由页面注入 */
export const CreateColumns = (handlers: { onEdit: (row: IRoleRow) => void }): PageColumn<IRoleRow>[] => [
  { type: "index" },
  { key: "roleName", title: "角色名称", icon: Shield24Regular, minWidth: 140, ellipsis: { tooltip: true } },
  { key: "roleKey", title: "角色编码", icon: Shield24Regular, minWidth: 140, ellipsis: { tooltip: true } },
  { key: "roleSort", title: "显示顺序", icon: TextNumberFormat24Regular, minWidth: 110 },
  {
    key: "dataScope",
    title: "数据权限",
    icon: Shield24Regular,
    minWidth: 160,
    render: (row) => DataScopeMap[row.dataScope] ?? "未知",
  },
  {
    key: "status",
    title: "状态",
    icon: Status24Regular,
    minWidth: 100,
    render: (row) =>
      row.status === "enabled"
        ? h(NTag, { type: "success", size: "small" }, { default: () => "启用" })
        : h(NTag, { type: "error", size: "small" }, { default: () => "禁用" }),
  },
  { key: "createdAt", title: "创建时间", icon: CalendarLtr24Regular, minWidth: 180 },
  {
    type: "actions",
    icon: Options24Regular,
    minWidth: 170,
    actions: [
      {
        label: "编辑",
        icon: Edit24Regular,
        auth: "system:role:update",
        show: (row) => !IsSuperAdminRole(row),
        onClick: handlers.onEdit,
      },
      {
        label: "删除",
        icon: Delete24Regular,
        buttonType: "error",
        auth: "system:role:delete",
        show: (row) => !IsSuperAdminRole(row),
        confirm: (row) => `确定要删除角色「${row.roleName}」吗？`,
      },
    ],
  },
];
