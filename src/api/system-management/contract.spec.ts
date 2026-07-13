import { beforeEach, describe, expect, it, vi } from "vitest";

const requestMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@/request", () => ({ request: requestMock }));

import {
  CleanLoginLogs,
  CleanOperLogs,
  GetAllUsers,
  GetConfigByKey,
  GetDictDataByType,
  GetUserById,
  ResetUserPassword,
} from ".";

describe("system-management 后端契约", () => {
  beforeEach(() => vi.clearAllMocks());

  it("保留用户兼容接口并按字符串 ID 拼接路径", () => {
    GetAllUsers();
    GetUserById("9007199254740993");
    ResetUserPassword("9007199254740993", { password: "encrypted" });

    expect(requestMock.get).toHaveBeenNthCalledWith(1, "/system/user/all");
    expect(requestMock.get).toHaveBeenNthCalledWith(2, "/system/user/9007199254740993");
    expect(requestMock.patch).toHaveBeenCalledWith("/system/user/9007199254740993/password", {
      password: "encrypted",
    });
  });

  it("使用参数、字典和日志兼容路径", () => {
    GetConfigByKey("site.name");
    GetDictDataByType("common_status");
    CleanLoginLogs();
    CleanOperLogs();

    expect(requestMock.get).toHaveBeenNthCalledWith(1, "/system/parameter/key/site.name");
    expect(requestMock.get).toHaveBeenNthCalledWith(2, "/system/dict/data/type/common_status");
    expect(requestMock.delete).toHaveBeenNthCalledWith(1, "/system/login-log/clean");
    expect(requestMock.delete).toHaveBeenNthCalledWith(2, "/system/operation-log/clean");
  });
});
