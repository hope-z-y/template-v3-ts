import { RenderColumnTitle } from "@/utils";
import { NButton, NIcon, NSpace } from "naive-ui";
import type { DataTableColumn } from "naive-ui";
import type { PageActionsColumn, PageColumn, PageDataColumn, PageRowAction } from "../types";
import type { ColumnVisibilityOption } from "./column-visibility";

/** 列构建时需要的外部能力，由 use-page.ts 注入 */
export interface BuildColumnsContext<TRow> {
  /** 权限判断（userStore.hasPermission） */
  hasPermission: (value: string | string[]) => boolean;
  /** 当前页码 / 页大小，用于序号列的连续编号；全量模式恒为 1 页 */
  getPageOffset: () => number;
  /** 可见列 key 集合（列设置的勾选结果） */
  visibleKeys: Set<string>;
  /** 行操作的二次确认执行器 */
  confirmAction: (options: { content: string; successText?: string; onConfirm: () => Promise<void> | void }) => void;
  /** 默认删除逻辑：api.delete + 刷新，供 confirm 类 action 缺省使用 */
  defaultDelete?: (row: TRow) => Promise<void>;
}

/** 类型收窄辅助：区分特殊列与普通数据列 */
const isSpecialColumn = <TRow,>(
  column: PageColumn<TRow>,
): column is Exclude<PageColumn<TRow>, PageDataColumn<TRow>> => {
  return "type" in column && (column.type === "index" || column.type === "selection" || column.type === "actions");
};

/** 渲染操作列里的单个文字按钮 */
const renderActionButton = <TRow,>(action: PageRowAction<TRow>, row: TRow, ctx: BuildColumnsContext<TRow>) => {
  const handleClick = () => {
    // confirm 优先：先询问，确认后执行 onConfirm（缺省回退到 api.delete + 刷新）
    if (action.confirm) {
      const content = action.confirm(row);
      // 返回 false 表示本次拦截（业务可在 confirm 内自行提示原因）
      if (content === false) return;

      ctx.confirmAction({
        content,
        successText: action.successText,
        onConfirm: async () => {
          if (action.onConfirm) {
            await action.onConfirm(row);
          } else if (ctx.defaultDelete) {
            await ctx.defaultDelete(row);
          }
        },
      });
      return;
    }

    action.onClick?.(row);
  };

  return (
    <NButton text type={action.buttonType ?? "primary"} onClick={handleClick}>
      {{
        icon: action.icon ? () => <NIcon component={action.icon} /> : undefined,
        default: () => action.label,
      }}
    </NButton>
  );
};

/** 构建操作列：按钮组 + 权限过滤 + 行级显隐 */
const buildActionsColumn = <TRow,>(
  column: PageActionsColumn<TRow>,
  ctx: BuildColumnsContext<TRow>,
): DataTableColumn<TRow> => {
  const title = column.title ?? "操作";

  return {
    key: "actions",
    title: column.icon ? RenderColumnTitle(column.icon, title) : title,
    width: column.width,
    minWidth: column.minWidth ?? 170,
    align: "center",
    titleAlign: "center",
    fixed: "right",
    render: (row) => {
      const buttons = column.actions
        .filter((action) => (action.auth ? ctx.hasPermission(action.auth) : true))
        .filter((action) => (action.show ? action.show(row) : true))
        .map((action) => renderActionButton(action, row, ctx));

      return (
        <NSpace size={8} justify="center" inline>
          {buttons}
        </NSpace>
      );
    },
  };
};

/**
 * 把 usePage 的列配置编译成 Naive UI 的最终列定义。
 * 依次处理：特殊列展开（index / selection / actions）、权限过滤、
 * 列设置显隐过滤、icon 标题渲染、align 默认值。
 */
export const buildColumns = <TRow,>(
  columns: PageColumn<TRow>[],
  ctx: BuildColumnsContext<TRow>,
): DataTableColumn<TRow>[] => {
  const result: DataTableColumn<TRow>[] = [];

  for (const column of columns) {
    if (isSpecialColumn(column)) {
      if (column.type === "index") {
        result.push({
          key: "index",
          title: column.title ?? "序号",
          width: column.width ?? 70,
          align: "center",
          titleAlign: "center",
          // 序号跨页连续：offset 由分页状态计算（全量模式 offset 恒为 0）
          render: (_row, rowIndex) => ctx.getPageOffset() + rowIndex + 1,
        });
        continue;
      }

      if (column.type === "selection") {
        result.push({ type: "selection", width: column.width });
        continue;
      }

      // actions 列受列设置控制（key 固定为 "actions"，且在列设置里默认 disabled 不可隐藏）
      if (ctx.visibleKeys.has("actions")) {
        result.push(buildActionsColumn(column, ctx));
      }
      continue;
    }

    // 普通数据列：先过权限，再过列设置
    if (column.auth && !ctx.hasPermission(column.auth)) continue;
    if (!ctx.visibleKeys.has(String(column.key))) continue;

    const { icon, auth: _auth, defaultVisible: _defaultVisible, title, ...rest } = column;

    result.push({
      align: "center",
      titleAlign: "center",
      ...rest,
      // 声明了 icon 时用"图标 + 文案"的标题渲染，与全站表格风格统一
      title: icon ? RenderColumnTitle(icon, title) : title,
    } as DataTableColumn<TRow>);
  }

  return result;
};

/**
 * 从列配置推导"列设置"弹出层的数据源：
 * 只有普通数据列和操作列参与显隐控制（index / selection 列始终显示），
 * 操作列固定为 disabled（不可隐藏）。
 */
export const buildColumnVisibilityDefaults = <TRow,>(columns: PageColumn<TRow>[]): ColumnVisibilityOption[] => {
  const result: ColumnVisibilityOption[] = [];

  for (const column of columns) {
    if (isSpecialColumn(column)) {
      if (column.type === "actions") {
        result.push({ key: "actions", title: column.title ?? "操作", visible: true, disabled: true });
      }
      continue;
    }

    result.push({
      key: String(column.key),
      title: column.title,
      visible: column.defaultVisible ?? true,
    });
  }

  return result;
};
