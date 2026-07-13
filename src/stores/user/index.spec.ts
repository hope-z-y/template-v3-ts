import type { IProfileRole, IUserProfile } from "@/api/types";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useUserStore } from "./index";

/** 生成后端当前格式的角色，避免每个测试重复填写审计字段。 */
const createRole = (roleKey: string): IProfileRole => ({
  id: `role-${roleKey}`,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  createdById: null,
  updatedById: null,
  remark: null,
  roleName: roleKey,
  roleKey,
  roleSort: 1,
  dataScope: "all",
  status: "enabled",
  menuIds: [],
  deptIds: [],
});

/** 生成 GET /auth/profile 的完整测试数据。 */
const createProfile = ({
  roleKeys = [],
  permissions = [],
  isAdmin = false,
}: {
  roleKeys?: string[];
  permissions?: string[];
  isAdmin?: boolean;
} = {}): IUserProfile => ({
  userInfo: {
    id: "100000000000000001",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    createdById: null,
    updatedById: null,
    remark: null,
    account: "tester",
    username: "测试用户",
    phone: null,
    email: null,
    avatar: null,
    gender: "unknown",
    status: "enabled",
    deptId: null,
    lastLoginIp: null,
    lastLoginAt: null,
    passwordUpdatedAt: null,
    department: null,
    roles: roleKeys.map(createRole),
    posts: [],
    isAdmin,
  },
  permissions,
  menus: [],
});

describe("useUserStore permissions", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    setActivePinia(createPinia());
  });

  it("matches profile permissions", () => {
    const store = useUserStore();

    store.setProfile(createProfile({ roleKeys: ["operator"], permissions: ["system:user:create"] }));

    expect(store.hasPermission("system:user:create")).toBe(true);
    expect(store.hasPermission("system:user:update")).toBe(false);
  });

  it("treats backend isAdmin flag as full access", () => {
    const store = useUserStore();

    store.setProfile(createProfile({ isAdmin: true }));

    expect(store.hasPermission("any:permission:value")).toBe(true);
    expect(store.hasRole("admin")).toBe(true);
  });

  it("reads role keys from userInfo roles", () => {
    const store = useUserStore();

    store.setProfile(createProfile({ roleKeys: ["admin"] }));

    expect(store.hasPermission("system:user:list")).toBe(true);
    expect(store.hasRole("admin")).toBe(true);
  });

  it("supports some/every matching for permissions and roles", () => {
    const store = useUserStore();

    store.setProfile(
      createProfile({
        roleKeys: ["auditor", "operator"],
        permissions: ["system:user:update", "system:user:create"],
      }),
    );

    expect(store.hasPermission(["system:user:create", "system:user:delete"])).toBe(true);
    expect(store.hasPermission(["system:user:update", "system:user:create"], "every")).toBe(true);
    expect(store.hasPermission(["system:user:list", "system:user:delete"], "every")).toBe(false);
    expect(store.hasRole(["operator", "admin"])).toBe(true);
    expect(store.hasRole(["auditor", "operator"], "every")).toBe(true);
  });
});
