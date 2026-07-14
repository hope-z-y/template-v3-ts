import Checkmark24Regular from "@vicons/fluent/es/Checkmark24Regular";
import Dismiss24Regular from "@vicons/fluent/es/Dismiss24Regular";
import { NButton, NIcon, NModal } from "naive-ui";
import { defineComponent, type SlotsType } from "vue";
import type { ModalContext } from "./types";

/**
 * 创建实际渲染 NModal 的组件（useModal 内容方 / 独立模式返回的 Modal）。
 * 工厂形式：组件通过闭包直接引用共享上下文，不需要任何 props 传递。
 *
 * 统一收敛了原先每个 form.vue 里重复的 NModal 样板：
 * preset dialog、40vw 宽度、禁用遮罩关闭、底部"取消/确定"按钮、确认 loading。
 */
export const createModalComponent = (context: ModalContext) => {
  return defineComponent({
    name: "UseModalRenderer",
    slots: Object as SlotsType<{
      /** 弹窗内容 */
      default?: () => unknown;
      /** 自定义底部（覆盖内置"取消/确定"按钮） */
      footer?: () => unknown;
    }>,
    setup(_props, { slots }) {
      const { state, options } = context;

      // 函数形式的标题把 setData 传入的数据交给业务计算（如按 mode 显示"新增/编辑"）
      const resolveTitle = () => (typeof options.title === "function" ? options.title(state.data) : options.title);

      const handleConfirm = async () => {
        // 校验、提交、成功后 close 都由内容方的 onConfirm 负责，
        // 提交过程中的按钮 loading 由内容方通过 modalApi.lock()/unlock() 控制
        await options.onConfirm?.();
      };

      const renderFooter = () => {
        if (slots.footer) return slots.footer();

        return (
          <div class="flex justify-end gap-2">
            <NButton onClick={() => (state.visible = false)}>
              {{
                icon: () => (
                  <NIcon>
                    <Dismiss24Regular />
                  </NIcon>
                ),
                default: () => options.cancelText ?? "取消",
              }}
            </NButton>
            <NButton type="primary" loading={state.confirmLoading} onClick={handleConfirm}>
              {{
                icon: () => (
                  <NIcon>
                    <Checkmark24Regular />
                  </NIcon>
                ),
                default: () => options.confirmText ?? "确定",
              }}
            </NButton>
          </div>
        );
      };

      return () => {
        const preset = options.preset ?? "dialog";
        const showFooter = options.footer !== false;

        return (
          <NModal
            show={state.visible}
            onUpdateShow={(value: boolean) => (state.visible = value)}
            preset={preset}
            style={{ width: options.width ?? "40vw" }}
            title={resolveTitle()}
            maskClosable={false}
            // dialog 预设的样式微调与原 form.vue 保持一致
            {...(preset === "dialog"
              ? { showIcon: false, contentClass: "my-4!", titleClass: "naive-modal-title" }
              : {})}
            onAfterLeave={() => options.onClosed?.()}
          >
            {{
              default: slots.default,
              // dialog 预设的底部插槽叫 action，card 预设叫 footer
              ...(showFooter ? { [preset === "dialog" ? "action" : "footer"]: renderFooter } : {}),
            }}
          </NModal>
        );
      };
    },
  });
};
