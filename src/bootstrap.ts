export type BootstrapContext = {
  startedAt: string;
};

const loadLocalConfig = async () => {
  const rawConfig = localStorage.getItem("template-v3-ts:config");

  if (!rawConfig) {
    return {};
  }

  try {
    return JSON.parse(rawConfig) as Record<string, unknown>;
  } catch (error) {
    console.warn("[bootstrap] Failed to parse local config:", error);
    return {};
  }
};

export const bootstrap = async (): Promise<BootstrapContext> => {
  await loadLocalConfig();

  return {
    startedAt: new Date().toISOString(),
  };
};
