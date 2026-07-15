import type { IGlobalConfig, ThemeColor } from "../types";

export const APP_CONFIG_STORAGE_KEY = "template-v3-ts:config";

export const defaultGlobalConfig: IGlobalConfig = {
  version: 2,
  appName: "Vue3-Template",
  theme: "dark",
  collapse: false,
  themeColor: "green",
  borderRadius: 8,
  density: "standard",
  routeAnimation: {
    enabled: true,
    type: "fade",
    speed: "normal",
  },
  autoLockMinutes: 0,
};

export const themeColorTokens: Record<ThemeColor, { base: string; hover: string; pressed: string; suppl: string }> = {
  green: { base: "#18a058", hover: "#36ad6a", pressed: "#0c7a43", suppl: "#36ad6a" },
  blue: { base: "#2080f0", hover: "#4098fc", pressed: "#1060c9", suppl: "#4098fc" },
  cyan: { base: "#0e7a8a", hover: "#1594a6", pressed: "#095f6c", suppl: "#1594a6" },
  orange: { base: "#f0a020", hover: "#fcb040", pressed: "#c97c10", suppl: "#fcb040" },
  red: { base: "#d03050", hover: "#de576d", pressed: "#ab1f3f", suppl: "#de576d" },
  violet: { base: "#7c5cfc", hover: "#9277ff", pressed: "#6241d8", suppl: "#9277ff" },
};

const mergeConfig = (
  stored: Partial<IGlobalConfig> & { routeAnimation?: Partial<IGlobalConfig["routeAnimation"]> },
) => ({
  ...defaultGlobalConfig,
  ...stored,
  version: 2 as const,
  routeAnimation: {
    ...defaultGlobalConfig.routeAnimation,
    ...(stored.routeAnimation ?? {}),
  },
});

export const readGlobalConfig = (): IGlobalConfig => {
  if (typeof window === "undefined") return structuredClone(defaultGlobalConfig);

  try {
    const raw = window.localStorage.getItem(APP_CONFIG_STORAGE_KEY);
    if (!raw) return structuredClone(defaultGlobalConfig);
    return mergeConfig(JSON.parse(raw) as Partial<IGlobalConfig>);
  } catch {
    return structuredClone(defaultGlobalConfig);
  }
};

export const writeGlobalConfig = (config: IGlobalConfig) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APP_CONFIG_STORAGE_KEY, JSON.stringify(config));
};
