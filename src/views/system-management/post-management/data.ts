import type { IPost } from "@/api/types";
import type { PageColumn, SearchFieldSchema } from "@/hooks";
import { CommonStatusOptions } from "@/utils/constant";
import Briefcase24Regular from "@vicons/fluent/es/Briefcase24Regular";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NTag } from "naive-ui";
import { h } from "vue";

/** 列表行数据类型（与接口返回的岗位实体一致） */
export type IPostRow = IPost;

/** 搜索区的查询模型（即 pageApi.query 的类型） */
export interface IPostQuery {
  postName?: string;
  postCode?: string;
  status?: IPost["status"];
}

/** 新增 / 编辑弹窗的共享数据：由列表页 setData 传入，表单通过 modalApi.getData() 读取 */
export interface IPostModalData {
  mode: "create" | "edit";
  record: IPostRow | null;
}

/** 搜索表单 schema：纯声明配置，调整搜索项只改这里 */
export const SearchSchema: SearchFieldSchema<IPostQuery>[] = [
  { field: "postName", label: "岗位名称" },
  { field: "postCode", label: "岗位编码" },
  { field: "status", label: "状态", component: "select", props: { options: CommonStatusOptions } },
];

/**
 * 列定义工厂：依赖页面运行时的回调（如打开编辑弹窗）通过 handlers 注入，
 * 让 data.ts 保持与 modalApi 等页面状态解耦
 */
export const CreateColumns = (handlers: { onEdit: (row: IPostRow) => void }): PageColumn<IPostRow>[] => [
  { type: "index" },
  { key: "postCode", title: "岗位编码", icon: Briefcase24Regular, minWidth: 140, ellipsis: { tooltip: true } },
  { key: "postName", title: "岗位名称", icon: Briefcase24Regular, minWidth: 140, ellipsis: { tooltip: true } },
  { key: "postSort", title: "显示顺序", icon: TextNumberFormat24Regular, minWidth: 110 },
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
    actions: [
      {
        label: "编辑",
        icon: Edit24Regular,
        auth: "system:post:update",
        onClick: handlers.onEdit,
      },
      {
        label: "删除",
        icon: Delete24Regular,
        buttonType: "error",
        auth: "system:post:delete",
        // confirm 返回确认文案，确认后走 api.delete + 自动刷新
        confirm: (row) => `确定要删除岗位「${row.postName}」吗？`,
      },
    ],
  },
];
