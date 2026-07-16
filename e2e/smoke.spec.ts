import { expect, test, type Page } from "@playwright/test";
import { generateKeyPairSync } from "node:crypto";

const { publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const profile = {
  userInfo: {
    id: "1",
    account: "admin",
    username: "超级管理员",
    phone: "13800138000",
    email: "admin@example.com",
    avatar: null,
    gender: "unknown",
    status: "enabled",
    deptId: null,
    department: null,
    roles: [],
    posts: [],
    isAdmin: true,
    lastLoginIp: "127.0.0.1",
    lastLoginAt: "2026-07-14T10:00:00.000Z",
    passwordUpdatedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    createdById: null,
    updatedById: null,
    remark: null,
  },
  permissions: ["*:*:*"],
  menus: [
    {
      id: "10",
      parentId: null,
      menuName: "用户管理",
      menuType: "menu",
      routePath: "/system-management/user-management",
      component: "system-management/user-management/index",
      permissionCode: "system:user:list",
      icon: "UserOutlined",
      sort: 1,
      visible: true,
      cacheable: false,
      externalLink: null,
      children: [],
    },
  ],
};

const respond = (data: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ code: 200, data, message: "success" }),
});

const authenticate = async (page: Page) => {
  let verifyAttempts = 0;
  await page.addInitScript(() => {
    sessionStorage.setItem("template-v3-ts:auth:refresh-token", "test-refresh-token");
  });
  await page.route("**/api/auth/refresh", (route) =>
    route.fulfill(respond({ accessToken: "access", refreshToken: "refresh", expiresIn: 3600 })),
  );
  await page.route("**/api/auth/profile", (route) => {
    if (route.request().method() === "PATCH") return route.fulfill(respond(profile.userInfo));
    return route.fulfill(respond(profile));
  });
  await page.route("**/api/auth/public-key", (route) => route.fulfill(respond(publicKey)));
  await page.route("**/api/auth/verify-password", (route) => {
    verifyAttempts += 1;
    if (verifyAttempts === 1) {
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ code: 400, data: null, message: "当前密码错误" }),
      });
    }
    return route.fulfill(respond(true));
  });
  await page.route("**/api/system/parameter/global-config", (route) => route.fulfill(respond({})));
  await page.route("**/api/system/dict/data/all", (route) => route.fulfill(respond({})));
  await page.route("**/api/system/notice/inbox/unread-count", (route) => route.fulfill(respond(1)));
  await page.route("**/api/system/notice/inbox**", (route) =>
    route.fulfill(
      respond({
        rows: [
          {
            id: "900",
            title: "系统维护通知",
            type: "notice",
            content: "今晚进行例行维护",
            publishAt: "2026-07-16T08:00:00.000Z",
            readAt: null,
          },
        ],
        total: 1,
      }),
    ),
  );
  await page.route("**/api/system/department/tree", (route) => route.fulfill(respond([])));
  await page.route("**/api/system/user**", (route) =>
    route.fulfill(
      respond({
        rows: [
          {
            ...profile.userInfo,
            roles: [{ id: "100", roleName: "超级管理员", roleKey: "admin" }],
            posts: [],
          },
        ],
        total: 1,
      }),
    ),
  );
};

test("renders the login page", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "登录" })).toBeVisible();
});

test("opens account pages, persists settings and unlocks the screen", async ({ page }) => {
  await authenticate(page);
  await page.goto("/account/settings");
  await expect(page.getByRole("heading", { name: "应用设置" })).toBeVisible();

  await page.getByRole("button", { name: "蓝色" }).click();
  await page.getByText("紧凑", { exact: true }).click();
  await page.getByRole("switch").first().click();
  await expect(page.locator(".n-menu--collapsed")).toBeVisible();
  const storedConfig = await page.evaluate(() => JSON.parse(localStorage.getItem("template-v3-ts:config") || "{}"));
  expect(storedConfig).toMatchObject({ themeColor: "blue", density: "compact", collapse: true });

  await page.getByText("admin@example.com", { exact: true }).hover();
  await page.getByText("屏幕锁定", { exact: true }).click();
  await expect(page.getByText("屏幕已锁定，请输入当前登录密码")).toBeVisible();
  await page.getByPlaceholder("请输入密码解锁").fill("wrong-password");
  await page.getByRole("button", { name: "解锁" }).click();
  await expect(page.getByText("屏幕已锁定，请输入当前登录密码")).toBeVisible();
  await page.getByPlaceholder("请输入密码解锁").fill("admin123456");
  await page.getByRole("button", { name: "解锁" }).click();
  await expect(page.getByText("屏幕已锁定，请输入当前登录密码")).toBeHidden();

  await page.goto("/account/profile");
  await expect(page.getByRole("heading", { name: "个人信息" })).toBeVisible();
  await expect(page.locator('input[value="admin"]')).toBeDisabled();
});

test("keeps search actions inline and toggles the data fullscreen area", async ({ page }) => {
  await authenticate(page);
  await page.setViewportSize({ width: 760, height: 820 });
  await page.goto("/system-management/user-management");
  await expect(page.getByText("用户管理", { exact: true }).last()).toBeVisible();

  const buttons = [
    page.getByRole("button", { name: "搜索" }),
    page.getByRole("button", { name: "重置" }),
    page.getByRole("button", { name: "展开" }),
  ];
  const boxes = await Promise.all(buttons.map((button) => button.boundingBox()));
  expect(boxes.every(Boolean)).toBe(true);
  const yPositions = boxes.map((box) => box!.y);
  expect(Math.max(...yPositions) - Math.min(...yPositions)).toBeLessThanOrEqual(2);

  await page.getByRole("button", { name: "数据区域全屏" }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await page.getByRole("button", { name: "退出数据全屏" }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
});

test("shows distributed notices in the personal notification center", async ({ page }) => {
  await authenticate(page);
  await page.goto("/account/notifications");
  await expect(page.getByRole("heading", { name: "通知中心" })).toBeVisible();
  await expect(page.getByText("系统维护通知", { exact: true })).toBeVisible();
});
