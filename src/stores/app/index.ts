import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAppStore = defineStore("AppStore", () => {
  // 登录后一次性加载后端全局参数，供标题、上传限制等跨页面配置读取。
  const globalParameters = ref<Record<string, string>>({});
  const initialized = ref(false);

  const SetGlobalParameters = (parameters: Record<string, string>) => {
    globalParameters.value = parameters;
  };

  const MarkInitialized = () => {
    initialized.value = true;
  };

  /** 读取全局参数；后端未配置时使用调用方提供的默认值。 */
  const GetGlobalParameter = (key: string, fallback = "") => globalParameters.value[key] ?? fallback;

  return {
    globalParameters,
    initialized: computed(() => initialized.value),
    SetGlobalParameters,
    GetGlobalParameter,
    MarkInitialized,
  };
});
