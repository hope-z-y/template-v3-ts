import { useDialog, useMessage } from "naive-ui";

/**
 * 危险操作二次确认：吸收原 useDeleteConfirm。
 * 基于 useDialog / useMessage，因此 createDeleteConfirm 必须在组件 setup 内调用
 * （usePage 本身就在页面 setup 中执行，天然满足）。
 */
export const createDeleteConfirm = () => {
  const dialog = useDialog();
  const message = useMessage();

  const confirm = (options: {
    title?: string;
    content: string;
    successText?: string;
    /** 点击"确定"后执行的动作（通常是删除接口） */
    onConfirm: () => Promise<void> | void;
    /** 动作成功后的收尾（通常是刷新列表） */
    onSuccess?: () => Promise<void> | void;
  }) => {
    dialog.error({
      title: options.title ?? "确认删除",
      content: options.content,
      positiveText: "确定",
      negativeText: "取消",
      // 返回 Promise 时 Naive UI 会自动给"确定"按钮加 loading，并在 reject 时保持弹窗
      onPositiveClick: async () => {
        await options.onConfirm();
        message.success(options.successText ?? "删除成功");
        await options.onSuccess?.();
      },
    });
  };

  return { confirm };
};
