import { beforeEach, describe, expect, it } from "vitest";
import { APP_CONFIG_STORAGE_KEY, defaultGlobalConfig, readGlobalConfig } from "./config-storage";

describe("global config storage", () => {
  beforeEach(() => localStorage.clear());

  it("migrates the legacy theme and collapse fields into version 2 defaults", () => {
    localStorage.setItem(APP_CONFIG_STORAGE_KEY, JSON.stringify({ appName: "Legacy", theme: "light", collapse: true }));
    expect(readGlobalConfig()).toEqual({
      ...defaultGlobalConfig,
      appName: "Legacy",
      theme: "light",
      collapse: true,
    });
  });

  it("falls back to defaults when storage is invalid", () => {
    localStorage.setItem(APP_CONFIG_STORAGE_KEY, "not-json");
    expect(readGlobalConfig()).toEqual(defaultGlobalConfig);
  });
});
