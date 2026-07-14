import type { CommonStatus, IDept } from "@/api/types";
import type { PageColumn, SearchFieldSchema } from "@/hooks";
import { CommonStatusMap, CommonStatusOptions } from "@/utils/constant";
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
import { NTag } from "naive-ui";
import { h } from "vue";

/** 搜索区的查询模型 */
export interface IDeptQuery {
  deptName?: string;
  status?: CommonStatus;
}

/** 新增 / 编辑弹窗的共享数据：由列表页 setData 传入，表单通过 modalApi.getData() 读取 */
export interface IDeptModalData {
  mode: "create" | "edit";
  record: IDept | null;
}

/** 搜索表单 schema */
export const SearchSchema: SearchFieldSchema<IDeptQuery>[] = [
  { field: "deptName", label: "部门名称" },
  { field: "status", label: "状态", component: "select", props: { options: CommonStatusOptions } },
];

/** 树形过滤：命中节点或其子孙命中的节点保留（搜索时保持树结构） */
const matchesNode = (node: IDept, filters: IDeptQuery): boolean => {
  const deptName = filters.deptName?.trim();
  const nameMatched = !deptName || node.deptName.includes(deptName);
  const statusMatched = filters.status === undefined || filters.status === null || node.status === filters.status;
  return nameMatched && statusMatched;
};

export const FilterDeptTree = (nodes: IDept[], filters: IDeptQuery): IDept[] => {
  return nodes.reduce<IDept[]>((result, node) => {
    const children = node.children?.length ? FilterDeptTree(node.children, filters) : [];

    if (matchesNode(node, filters) || children.length > 0) {
      result.push({
        ...node,
        children: children.length > 0 ? children : undefined,
      });
    }

    return result;
  }, []);
};

/** 列定义工厂：编辑回调由页面注入 */
export const CreateColumns = (handlers: { onEdit: (row: IDept) => void }): PageColumn<IDept>[] => [
  {
    key: "deptName",
    title: "部门名称",
    icon: Organization24Regular,
    minWidth: 200,
    align: "left",
    titleAlign: "left",
    ellipsis: { tooltip: true },
  },
  { key: "sort", title: "显示顺序", icon: TextNumberFormat24Regular, minWidth: 110 },
  {
    key: "leaderUserId",
    title: "负责人",
    icon: Person24Regular,
    minWidth: 130,
    render: (row) => row.leaderUserId || "-",
  },
  { key: "phone", title: "联系电话", icon: Phone24Regular, minWidth: 150, render: (row) => row.phone || "-" },
  {
    key: "email",
    title: "邮箱",
    icon: Mail24Regular,
    minWidth: 190,
    ellipsis: { tooltip: true },
    render: (row) => row.email || "-",
  },
  {
    key: "status",
    title: "状态",
    icon: Status24Regular,
    minWidth: 110,
    render: (row) => {
      const current = CommonStatusMap[row.status] ?? { label: "未知", type: "error" as const };
      return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
    },
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
        auth: "system:department:update",
        onClick: handlers.onEdit,
      },
      {
        label: "删除",
        icon: Delete24Regular,
        buttonType: "error",
        auth: "system:department:delete",
        confirm: (row) => `确定要删除部门「${row.deptName}」吗？`,
      },
    ],
  },
];
