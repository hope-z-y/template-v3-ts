import { NButton, NIcon } from "naive-ui";
import type { VNodeChild } from "vue";
import type { PageToolbarAction, PageToolbarContext } from "../types";

/** 工具栏渲染时需要的外部能力，由 use-page.ts 注入 */
export interface RenderToolbarContext<TRow> {
  hasPermission: (value: string | string[]) => boolean;
  /** 危险操作二次确认执行器（清空日志、批量删除等） */
  confirmAction: (options: { content: string; successText?: string; onConfirm: () => Promise<void> | void }) => void;
  /** 获取工具栏回调的运行时上下文（勾选行等） */
  getToolbarContext: () => PageToolbarContext<TRow>;
}

/**
 * 声明式工具栏按钮渲染（渲染在页面标题右侧、刷新按钮左边）。
 * 内置权限过滤与二次确认，onClick / confirm 二选一，语义与行操作按钮一致。
 * 所有回调都会收到 { checkedRowKeys, selection } 上下文，供批量操作使用。
 */
export const renderToolbar = <TRow,>(
  actions: PageToolbarAction<TRow>[],
  ctx: RenderToolbarContext<TRow>,
): VNodeChild => {
  return actions
    .filter((action) => (action.auth ? ctx.hasPermission(action.auth) : true))
    .map((action) => {
      const handleClick = () => {
        const toolbarCtx = ctx.getToolbarContext();

        if (action.confirm) {
          const content = action.confirm(toolbarCtx);
          // 返回 false 表示业务拦截本次操作
          if (content === false) return;

          ctx.confirmAction({
            content,
            successText: action.successText ?? "操作成功",
            onConfirm: async () => {
              await action.onConfirm?.(toolbarCtx);
            },
          });
          return;
        }

        action.onClick?.(toolbarCtx);
      };

      return (
        <NButton
          key={action.label}
          type={action.buttonType ?? "primary"}
          disabled={action.disabled?.(ctx.getToolbarContext()) ?? false}
          onClick={handleClick}
        >
          {{
            icon: action.icon ? () => <NIcon component={action.icon} /> : undefined,
            default: () => action.label,
          }}
        </NButton>
      );
    });
};
