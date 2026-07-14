import type { IConfig, IQueryConfigParams } from "@/api/types";
import type { PageColumn, SearchFieldSchema } from "@/hooks";
import { ConfigTypeMap } from "@/utils/constant";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Wrench24Regular from "@vicons/fluent/es/Wrench24Regular";
import { NTag } from "naive-ui";
import { h } from "vue";

/** 列表行数据类型（与接口返回的参数配置实体一致） */
export type IConfigRow = IConfig;

/** 搜索区的查询模型 */
export type IConfigQuery = Pick<IQueryConfigParams, "paramName" | "paramKey">;

/** 新增 / 编辑弹窗的共享数据：由列表页 setData 传入，表单通过 modalApi.getData() 读取 */
export interface IConfigModalData {
  mode: "create" | "edit";
  record: IConfigRow | null;
}

/** 搜索表单 schema */
export const SearchSchema: SearchFieldSchema<IConfigQuery>[] = [
  { field: "paramName", label: "参数名称" },
  { field: "paramKey", label: "参数键名" },
];

/**
 * 列定义工厂：编辑回调与"内置参数不允许删除"的提示（依赖 useMessage）由页面注入
 */
export const CreateColumns = (handlers: {
  onEdit: (row: IConfigRow) => void;
  /** 删除被拦截时的提示（如 message.warning） */
  onDeleteBlocked: (reason: string) => void;
}): PageColumn<IConfigRow>[] => [
  { type: "index" },
  { key: "paramName", title: "参数名称", icon: Wrench24Regular, minWidth: 140, ellipsis: { tooltip: true } },
  { key: "paramKey", title: "参数键名", icon: Wrench24Regular, minWidth: 140, ellipsis: { tooltip: true } },
  { key: "paramValue", title: "参数键值", icon: Wrench24Regular, minWidth: 160, ellipsis: { tooltip: true } },
  {
    key: "paramType",
    title: "参数类型",
    icon: Wrench24Regular,
    minWidth: 110,
    render: (row) => {
      const current = ConfigTypeMap[row.paramType] ?? { label: "未知", type: "default" as const };
      return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
    },
  },
  { key: "createdAt", title: "创建时间", icon: CalendarLtr24Regular, minWidth: 180 },
  {
    type: "actions",
    icon: Options24Regular,
    actions: [
      {
        label: "编辑",
        icon: Edit24Regular,
        auth: "system:parameter:update",
        onClick: handlers.onEdit,
      },
      {
        label: "删除",
        icon: Delete24Regular,
        buttonType: "error",
        auth: "system:parameter:delete",
        // 内置参数不渲染删除按钮（沿用原有行级控制）
        show: (row) => row.paramType !== "system",
        // confirm 里再做一层业务拦截：返回 false 表示阻止本次删除
        confirm: (row) => {
          if (row.paramType === "system") {
            handlers.onDeleteBlocked("内置参数不允许删除");
            return false;
          }
          return `确定要删除参数「${row.paramName}」吗？`;
        },
      },
    ],
  },
];
