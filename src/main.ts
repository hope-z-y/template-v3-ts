import { createApp } from "vue";
/** 全局状态管理 */
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
/** 程序加载前的初始化 */
import { bootstrap } from "./bootstrap";
/** 路由 */
import { router } from "./router";
import { setupDirectives } from "./directives";
/** 全局样式 */
import "@/styles/common.css";
/** 滚动条样式 */
import "@/styles/scrollbar.css";
/** 全局tailwindcss */
import "@/styles/tailwind.css";

import App from "./App.vue";

const setup = async () => {
  await bootstrap();

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);

  const app = createApp(App);
  app.use(pinia);
  app.use(router);
  setupDirectives(app);
  app.mount("#app");
};

setup();
