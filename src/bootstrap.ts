import { GetAllDictData, GetGlobalConfig } from "@/api/system-management";
import { SetAllDictData, useGlobalConfig } from "@/hooks";
import { useAppStore, useUserStore } from "@/stores";

export type BootstrapContext = {
  startedAt: string;
  remoteDataLoaded: boolean;
};

const ResolveAppName = (parameters: Record<string, string>) => {
  return parameters["app.name"] || parameters["system.app.name"] || parameters.VITE_APP_NAME;
};

export const bootstrap = async (): Promise<BootstrapContext> => {
  const appStore = useAppStore();
  const userStore = useUserStore();
  let remoteDataLoaded = false;

  try {
    if (!userStore.accessToken && userStore.refreshToken) {
      await userStore.refreshSession();
    }

    if (userStore.accessToken) {
      const [parameters, dictionaries] = await Promise.all([GetGlobalConfig(), GetAllDictData()]);
      appStore.SetGlobalParameters(parameters);
      SetAllDictData(dictionaries);

      const appName = ResolveAppName(parameters);
      if (appName) useGlobalConfig().setGlobalConfig({ appName });
      remoteDataLoaded = true;
    }
  } catch {
    // 启动数据失败不阻塞应用挂载，后续页面仍可按需重新请求。
  } finally {
    appStore.MarkInitialized();
  }

  return { startedAt: new Date().toISOString(), remoteDataLoaded };
};
