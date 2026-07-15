/**
 * 全局配置
 */
export type ThemeMode = "light" | "dark" | "system";
export type ThemeColor = "green" | "blue" | "cyan" | "orange" | "red" | "violet";
export type ContentDensity = "standard" | "compact";
export type RouteAnimationType = "fade" | "fade-up" | "fade-scale";
export type RouteAnimationSpeed = "fast" | "normal" | "slow";
export type AutoLockMinutes = 0 | 5 | 15 | 30 | 60;

export interface RouteAnimationConfig {
  enabled: boolean;
  type: RouteAnimationType;
  speed: RouteAnimationSpeed;
}

export interface IGlobalConfig {
  version: 2;
  appName: string;
  theme: ThemeMode;
  collapse: boolean;
  themeColor: ThemeColor;
  borderRadius: 4 | 8 | 12;
  density: ContentDensity;
  routeAnimation: RouteAnimationConfig;
  autoLockMinutes: AutoLockMinutes;
}

export type ResolvedTheme = Exclude<ThemeMode, "system">;
export type GlobalConfigPatch = Omit<Partial<IGlobalConfig>, "routeAnimation"> & {
  routeAnimation?: Partial<RouteAnimationConfig>;
};
