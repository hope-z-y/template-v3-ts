import { NIcon } from "naive-ui";
import { h, type Component } from "vue";

/**
 * 自定义渲染表格图标Label
 * @param icon 渲染图标
 * @param label label名称
 * @returns
 */
export const RenderColumnTitle = (icon: Component, label: string) => {
  return () =>
    h("span", { class: "inline-flex items-center justify-center gap-1" }, [
      h(NIcon, { size: 16, class: "shrink-0" }, { default: () => h(icon) }),
      label,
    ]);
};
