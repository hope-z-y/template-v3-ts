/**
 * 全局配置
 */
export interface IGlobalConfig {
  /** 应用名称 */
  appName: string;
  /** 主题 */
  theme: "light" | "dark";
  /** 菜单栏折叠 */
  collapse: boolean;
}
