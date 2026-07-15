import { computed, reactive, toRefs, type ComputedRef, type ToRefs } from "vue";
import { defaultGlobalConfig, readGlobalConfig, themeColorTokens, writeGlobalConfig } from "./modules/config-storage";
import type { GlobalConfigPatch, IGlobalConfig, ResolvedTheme } from "./types";

const systemDarkQuery =
  typeof window === "undefined" || typeof window.matchMedia !== "function"
    ? undefined
    : window.matchMedia("(prefers-color-scheme: dark)");
const globalConfig = reactive<IGlobalConfig>(readGlobalConfig());

const resolvedTheme = computed<ResolvedTheme>(() => {
  if (globalConfig.theme !== "system") return globalConfig.theme;
  return systemDarkQuery?.matches ? "dark" : "light";
});

const applyDocumentAppearance = () => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolvedTheme.value === "dark");
  document.documentElement.dataset.density = globalConfig.density;
  document.documentElement.style.setProperty("--app-primary-color", themeColorTokens[globalConfig.themeColor].base);
  document.documentElement.style.setProperty("--app-border-radius", `${globalConfig.borderRadius}px`);
};

const persistAndApply = () => {
  writeGlobalConfig(globalConfig);
  applyDocumentAppearance();
};

const setGlobalConfig = (patch: GlobalConfigPatch) => {
  const routeAnimation = patch.routeAnimation
    ? { ...globalConfig.routeAnimation, ...patch.routeAnimation }
    : globalConfig.routeAnimation;
  Object.assign(globalConfig, patch, { routeAnimation });
  persistAndApply();
};

const resetGlobalConfig = () => {
  Object.assign(globalConfig, structuredClone(defaultGlobalConfig));
  persistAndApply();
};

const toggleTheme = (event?: Event) => {
  const mouseEvent = event as MouseEvent | undefined;
  const nextTheme: ResolvedTheme = resolvedTheme.value === "dark" ? "light" : "dark";
  const applyTheme = () => setGlobalConfig({ theme: nextTheme });

  if (!document.startViewTransition || !mouseEvent) {
    applyTheme();
    return;
  }

  const transition = document.startViewTransition(applyTheme);
  void transition.ready.then(() => {
    const { clientX, clientY } = mouseEvent;
    const radius = Math.hypot(Math.max(clientX, innerWidth - clientX), Math.max(clientY, innerHeight - clientY));
    document.documentElement.animate(
      { clipPath: [`circle(0 at ${clientX}px ${clientY}px)`, `circle(${radius}px at ${clientX}px ${clientY}px)`] },
      { duration: 500, pseudoElement: "::view-transition-new(root)" },
    );
  });
};

const toggleCollapse = () => setGlobalConfig({ collapse: !globalConfig.collapse });

systemDarkQuery?.addEventListener("change", () => {
  if (globalConfig.theme === "system") applyDocumentAppearance();
});
applyDocumentAppearance();

export const useGlobalConfig = (): ToRefs<IGlobalConfig> & {
  resolvedTheme: ComputedRef<ResolvedTheme>;
  toggleTheme: (event?: Event) => void;
  toggleCollapse: () => void;
  setGlobalConfig: (patch: GlobalConfigPatch) => void;
  resetGlobalConfig: () => void;
} => ({
  ...toRefs(globalConfig),
  resolvedTheme,
  toggleTheme,
  toggleCollapse,
  setGlobalConfig,
  resetGlobalConfig,
});

export { globalConfig };
