import { NIcon } from "naive-ui";
import { h, type Component } from "vue";

/**
 * RenderColumnTitle
 * 自定义渲染表格列标题：左侧图标 + 右侧文案，用于 Naive UI DataTable 的 title 插槽。
 *
 * @param icon - 渲染用的 Vue 图标组件
 * @param label - 列标题文案
 * @returns () => VNode - 返回可供 title 使用的渲染函数
 */
export const RenderColumnTitle = (icon: Component, label: string) => {
  return () =>
    h("span", { class: "inline-flex items-center justify-center gap-1" }, [
      h(NIcon, { size: 16, class: "shrink-0" }, { default: () => h(icon) }),
      label,
    ]);
};
