import { defineComponent, h, inject, provide, reactive, watch } from "vue";
import { createModalComponent } from "./modal";
import { MODAL_CONTEXT_KEY, type ModalApi, type ModalContext, type ModalState, type UseModalOptions } from "./types";

/** 创建共享上下文：响应式状态 + 命令式 API（两端共用同一份） */
const createModalContext = (): ModalContext => {
  const state = reactive<ModalState>({
    visible: false,
    confirmLoading: false,
    data: undefined,
  });

  // 所有方法返回 api 自身，支持 modalApi.setData({...}).open() 链式调用
  const api: ModalApi = {
    open: () => {
      state.visible = true;
      return api;
    },
    close: () => {
      state.visible = false;
      return api;
    },
    setData: (data) => {
      state.data = data;
      return api;
    },
    getData: () => state.data,
    lock: () => {
      state.confirmLoading = true;
      return api;
    },
    unlock: () => {
      state.confirmLoading = false;
      return api;
    },
  };

  // options 先占位为空，内容方 useModal 执行时把行为配置合并进来
  return { state, api, options: {} };
};

/**
 * useModal：vben useVbenModal 风格的弹窗 hook，双端连接模式。
 *
 * 【打开方】页面里连接一个内容组件（如 form.vue）：
 * ```ts
 * const [FormModal, formModalApi] = useModal<FormData>({ connectedComponent: PostForm });
 * // 模板：<FormModal @success="pageApi.refresh" />   （attrs / 事件透传给 PostForm）
 * // 打开：formModalApi.setData({ mode: "edit", record: row }).open();
 * ```
 *
 * 【内容方】form.vue 内部声明弹窗行为：
 * ```ts
 * const [Modal, modalApi] = useModal({ title: () => ..., onConfirm: handleSubmit, onClosed: resetForm });
 * // 模板：<Modal><NForm>...</NForm></Modal>
 * // 取数据：modalApi.getData()；提交时 modalApi.lock() / unlock()；成功后 modalApi.close()
 * ```
 *
 * 两端通过 provide / inject 共享同一份闭包状态：打开方的 Modal 组件 provide 上下文，
 * 内容方渲染在它内部，inject 到同一份 state / api，因此 formModalApi 和 modalApi
 * 操作的是同一个弹窗。
 *
 * 【独立模式】不传 connectedComponent 且当前组件树上没有连接上下文时，
 * useModal 自建一份状态，适合"详情弹窗"这类内容就写在当前页面里的场景。
 */
export const useModal = <TData = unknown>(options: UseModalOptions<TData> = {}) => {
  /* ----------------------------- 打开方（连接模式） ----------------------------- */
  if (options.connectedComponent) {
    const context = createModalContext();
    const connected = options.connectedComponent;

    const Modal = defineComponent({
      name: "UseModalConnector",
      // 透传的 attrs（含 @success 等事件）手动转发给内容组件，不落在包装层上
      inheritAttrs: false,
      setup(_props, { attrs, slots }) {
        // 关键一步：把上下文注入组件树，内容组件 setup 里的 useModal 会 inject 到它
        provide(MODAL_CONTEXT_KEY, context);
        return () => h(connected, attrs, slots);
      },
    });

    return [Modal, context.api as ModalApi<TData>] as const;
  }

  /* ------------------------- 内容方 / 独立模式（渲染 NModal） ------------------------- */

  // 有打开方就复用它的上下文（连接模式）；没有就自建（独立模式）
  const context = inject(MODAL_CONTEXT_KEY, null) ?? createModalContext();

  // 把内容方声明的行为（title / onConfirm / onClosed 等）合并到共享上下文，
  // Modal 渲染组件与确认按钮读取的都是这份配置
  Object.assign(context.options, options as UseModalOptions<unknown>);

  // onOpened 用 watch 实现：visible 变为 true 时触发（如编辑模式拉详情回填）。
  // useModal 在组件 setup 中调用，watch 会随组件卸载自动停止
  if (options.onOpened) {
    watch(
      () => context.state.visible,
      (visible) => {
        if (visible) options.onOpened?.(context.state.data as TData);
      },
    );
  }

  const Modal = createModalComponent(context);

  return [Modal, context.api as ModalApi<TData>] as const;
};
