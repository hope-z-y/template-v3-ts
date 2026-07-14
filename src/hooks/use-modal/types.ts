import type { Component, InjectionKey } from "vue";

/** 弹窗的响应式状态（保存在 useModal 闭包 / 共享上下文中） */
export interface ModalState {
  /** 弹窗显隐 */
  visible: boolean;
  /** 确认按钮 loading（由 lock / unlock 控制，用于提交中的状态） */
  confirmLoading: boolean;
  /** 外部通过 setData 传入的数据（如 { mode, record }） */
  data: unknown;
}

/**
 * 弹窗的命令式 API。
 * 打开方（页面）用 setData(...).open() 传数据并打开；
 * 内容方（表单组件）用 getData() 取数据、lock()/unlock() 控制提交 loading、close() 关闭。
 */
export interface ModalApi<TData = unknown> {
  /** 打开弹窗 */
  open: () => ModalApi<TData>;
  /** 关闭弹窗 */
  close: () => ModalApi<TData>;
  /** 设置共享数据（支持链式调用：modalApi.setData({...}).open()） */
  setData: (data: TData) => ModalApi<TData>;
  /** 读取共享数据 */
  getData: () => TData;
  /** 锁定：确认按钮进入 loading（通常在提交接口前调用） */
  lock: () => ModalApi<TData>;
  /** 解锁：确认按钮退出 loading */
  unlock: () => ModalApi<TData>;
}

/** 弹窗行为配置（由"内容方"的 useModal 声明） */
export interface UseModalOptions<TData = unknown> {
  /**
   * 双端连接模式（打开方使用）：传入内容组件（如 form.vue），
   * 返回的 Modal 组件负责渲染该组件并通过 provide 建立状态连接，
   * 透传所有 attrs / 事件（如 @success）给内容组件
   */
  connectedComponent?: Component;
  /**
   * 弹窗标题。函数形式接收 setData 传入的数据，
   * 用于动态标题（如 (data) => data?.mode === "edit" ? "编辑岗位" : "新增岗位"）
   */
  title?: string | ((data: TData) => string);
  /** 弹窗宽度，默认 40vw */
  width?: string;
  /** NModal 预设，默认 dialog；详情展示类可用 card */
  preset?: "dialog" | "card";
  /** 是否渲染底部"取消/确定"按钮，默认 true；纯展示弹窗设为 false */
  footer?: boolean;
  /** 确认按钮文案，默认"确定" */
  confirmText?: string;
  /** 取消按钮文案，默认"取消" */
  cancelText?: string;
  /** 点击确认按钮时触发（表单校验与提交写在这里，成功后自行调用 modalApi.close()） */
  onConfirm?: () => unknown;
  /** 弹窗打开时触发，接收 setData 传入的数据（如编辑模式下拉取详情回填表单） */
  onOpened?: (data: TData) => unknown;
  /** 弹窗关闭动画结束后触发（如重置表单与校验状态） */
  onClosed?: () => void;
}

/** 双端共享的连接上下文：打开方 provide，内容方 inject */
export interface ModalContext {
  state: ModalState;
  api: ModalApi;
  /**
   * 内容方注册的行为配置。
   * 打开方创建上下文时它是空的，内容方 useModal 执行时把自己的 options 挂进来，
   * 这样"确认按钮点谁的回调"由内容方说了算
   */
  options: UseModalOptions<unknown>;
}

/** provide / inject 的注入键 */
export const MODAL_CONTEXT_KEY: InjectionKey<ModalContext> = Symbol("use-modal-context");
