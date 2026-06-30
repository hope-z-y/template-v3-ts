import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import type { PluginOption } from "vite";

export const createVitePlugins = (): PluginOption[] => [
  vue({
    script: {
      defineModel: true,
      propsDestructure: true,
    },
  }),
  vueJsx(),
  tailwindcss(),
];
