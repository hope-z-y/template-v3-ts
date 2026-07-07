import type { App } from "vue";
import { permissionDirective } from "./modules/permission";

/**
 * 统一注册全局指令。
 * 后续新增指令时，放到 modules 目录，并在这里完成 app.directive 注册。
 */
export const setupDirectives = (app: App) => {
  app.directive("permission", permissionDirective);
};
