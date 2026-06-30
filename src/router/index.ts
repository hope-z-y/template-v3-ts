import { createRouter, createWebHistory, type Router } from "vue-router";
import { GuardAfter } from "./modules/guard.after";
import { GuardBefore } from "./modules/guard.before";
import { staticRoutes } from "./modules/routes";

export const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...staticRoutes],
});

router.beforeEach(GuardBefore);

router.afterEach(GuardAfter);

export * from "./modules/routes";
