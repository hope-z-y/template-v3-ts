import type { IMenu } from "@/api/types";
import { describe, expect, it, vi } from "vitest";
import { collectMenuButtonPermissions, menusToOptions } from "./menu-to-options";
import { menusToRoutes } from "./menu-to-routes";

const createMenu = (overrides: Partial<IMenu>): IMenu => ({
  id: 1,
  parentId: 0,
  menuType: "C",
  menuName: "用户管理",
  permission: "system:user:list",
  path: "/system-management/user-management",
  component: "system-management/user-management/index",
  query: null,
  icon: null,
  sort: 1,
  visible: 1,
  status: 1,
  isFrame: 0,
  isCache: 0,
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

describe("menu-to-routes", () => {
  it("builds route records from menu nodes", () => {
    const routes = menusToRoutes([createMenu({})]);

    expect(routes).toHaveLength(1);
    expect(routes[0]?.path).toBe("system-management/user-management");
    expect(routes[0]?.meta?.permission).toBe("system:user:list");
    expect(routes[0]?.component).toBeTruthy();
  });

  it("skips button permissions as routes", () => {
    const routes = menusToRoutes([createMenu({ menuType: "F", path: "", component: null })]);

    expect(routes).toHaveLength(0);
  });

  it("collects only button permissions from menu trees", () => {
    const permissions = collectMenuButtonPermissions([
      createMenu({
        permission: "system:user:list",
        children: [
          createMenu({
            id: 2,
            menuType: "F",
            path: "",
            component: null,
            permission: "system:user:add",
          }),
        ],
      }),
    ]);

    expect(permissions).toEqual(["system:user:add"]);
  });

  it("uses built-in component contract to keep template route paths stable", () => {
    const menu = createMenu({
      path: "user",
      component: "system-management/user-management/index",
    });

    const routes = menusToRoutes([menu]);
    const options = menusToOptions([menu]);

    expect(routes[0]?.path).toBe("system-management/user-management");
    expect(options[0]?.key).toBe("/system-management/user-management");
  });

  it("does not silently rewrite misspelled component paths", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    menusToRoutes([
      createMenu({
        component: "system-managment/user-management/index",
      }),
    ]);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("未找到视图组件: views/system-managment/user-management/index.vue"),
    );

    warn.mockRestore();
  });
});
