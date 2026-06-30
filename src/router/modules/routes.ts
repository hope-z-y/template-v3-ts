import type {
  RouteLocation,
  RouteLocationNormalizedLoaded,
  RouteRecordRaw,
} from "vue-router";

export const staticRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Container",
    component: () => import("@/views/container/index.vue"),
    redirect: (_to: RouteLocation, _from: RouteLocationNormalizedLoaded) => {
      return "/home";
    },
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/home/index.vue"),
        meta: { title: "首页", icon: "AlignCenterHorizontal20Regular" },
      },
      {
        path: "system-management",
        name: "SystemManagement",
        redirect: "/system-management/user-management",
        meta: { title: "系统管理", icon: "Settings24Regular" },
        children: [
          {
            path: "user-management",
            name: "UserManagement",
            component: () =>
              import("@/views/system-managment/user-management/index.vue"),
            meta: { title: "用户管理", icon: "People24Regular" },
          },
          {
            path: "role-management",
            name: "RoleManagement",
            component: () =>
              import("@/views/system-managment/role-management/index.vue"),
            meta: { title: "角色管理", icon: "Shield24Regular" },
          },
          {
            path: "menu-management",
            name: "MenuManagement",
            component: () =>
              import("@/views/system-managment/menu-management/index.vue"),
            meta: { title: "菜单管理", icon: "TextBulletListSquare24Regular" },
          },
          {
            path: "dept-management",
            name: "DeptManagement",
            component: () =>
              import("@/views/system-managment/dept-management/index.vue"),
            meta: { title: "部门管理", icon: "Organization24Regular" },
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录" },
  },
];
