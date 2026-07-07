import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useUserStore } from "./index";

describe("useUserStore permissions", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    setActivePinia(createPinia());
  });

  it("matches profile permissions", () => {
    const store = useUserStore();

    store.setProfile({
      user: {
        id: 1,
        account: "admin",
        status: 1,
      },
      roles: ["operator"],
      permissions: ["system:user:add"],
    });
    store.setMenuPermissions(["system:user:delete"]);

    expect(store.hasPermission("system:user:add")).toBe(true);
    expect(store.hasPermission("system:user:delete")).toBe(false);
    expect(store.hasPermission("system:user:update")).toBe(false);
  });

  it("treats admin role as full access", () => {
    const store = useUserStore();

    store.setProfile({
      user: {
        id: 1,
        account: "root",
        status: 1,
      },
      roles: ["admin"],
      permissions: [],
    });

    expect(store.hasPermission("any:permission:value")).toBe(true);
  });

  it("normalizes nested role objects from profile responses", () => {
    const store = useUserStore();

    store.setProfile({
      user: {
        id: 1,
        account: "admin",
        status: 1,
        userRoles: [
          {
            role: {
              roleCode: "admin",
            },
          },
        ],
      },
      roles: [],
      permissions: [],
    } as never);

    expect(store.hasPermission("system:user:list")).toBe(true);
    expect(store.hasRole("admin")).toBe(true);
  });

  it("normalizes object permission values from profile responses", () => {
    const store = useUserStore();

    store.setProfile({
      user: {
        id: 1,
        account: "operator",
        status: 1,
      },
      roles: [],
      permissions: [{ permission: "system:user:list" }],
    } as never);

    expect(store.hasPermission("system:user:list")).toBe(true);
  });

  it("supports some/every matching for permissions and roles", () => {
    const store = useUserStore();

    store.setProfile({
      user: {
        id: 1,
        account: "auditor",
        status: 1,
      },
      roles: ["auditor", "operator"],
      permissions: ["system:user:list", "system:user:add"],
    });

    expect(store.hasPermission(["system:user:add", "system:user:delete"])).toBe(true);
    expect(store.hasPermission(["system:user:list", "system:user:add"], "every")).toBe(true);
    expect(store.hasPermission(["system:user:list", "system:user:delete"], "every")).toBe(false);
    expect(store.hasRole(["operator", "admin"])).toBe(true);
    expect(store.hasRole(["auditor", "operator"], "every")).toBe(true);
  });
});
