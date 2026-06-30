import { reactive, toRefs, type ToRefs } from "vue";
import type { IGlobalConfig } from "./types";

const defaultConfig: IGlobalConfig = {
  appName: "Vue3-Template",
  theme: "dark",
  collapse: false,
};
const _getLocalConfig = (): IGlobalConfig => {
  const config = localStorage.getItem("template-v3-ts:config");
  try {
    return config ? JSON.parse(config) : defaultConfig;
  } catch {
    return defaultConfig;
  }
};
// 全局只维护一份状态（singleton）
const globalConfig = reactive<IGlobalConfig>({ ..._getLocalConfig() });

const useGlobalConfig = (): ToRefs<IGlobalConfig> & {
  toggleTheme: (e: Event) => void;
  toggleCollapse: () => void;
} => {
  const toggleTheme = (e: Event) => {
    const mouseEvent = e as MouseEvent;
    // 获取到 transition API 实例
    const transition = document.startViewTransition(() => {
      globalConfig.theme = globalConfig.theme === "dark" ? "light" : "dark";

      if (globalConfig.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    });

    transition.ready.then(() => {
      const { clientX, clientY } = mouseEvent;
      const radius = Math.hypot(
        Math.max(clientX, innerWidth - clientX),
        Math.max(clientY, innerHeight - clientY),
      );
      const clipPath = [
        `circle(0% at ${clientX}px ${clientY}px)`,
        `circle(${radius}px at ${clientX}px ${clientY}px)`,
      ];

      // 自定义动画
      document.documentElement.animate(
        {
          // 动画始终从小圆到大圆
          clipPath: clipPath,
        },
        {
          duration: 500,
          // 切换到dark时，应该动画化新视图；切换到light时，也应该动画化新视图
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  const toggleCollapse = () => {
    globalConfig.collapse = !globalConfig.collapse;
  };

  return { toggleTheme, toggleCollapse, ...toRefs(globalConfig) };
};
export { useGlobalConfig, globalConfig };

export type * from "./types";
