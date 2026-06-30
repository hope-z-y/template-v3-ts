import type { BuildOptions } from "vite";

const vendorChunks: Record<string, string[]> = {
  vue: ["vue", "vue-router"],
  naive: ["naive-ui", "@vicons/ionicons5"],
};

export const createBuildOptions = (isProduction: boolean): BuildOptions => ({
  target: "es2022",
  cssTarget: "chrome107",
  sourcemap: !isProduction,
  minify: isProduction ? "oxc" : false,
  reportCompressedSize: isProduction,
  chunkSizeWarningLimit: 1200,
  assetsInlineLimit: 4096,
  outDir: "dist",
  assetsDir: "assets",
  emptyOutDir: true,
  modulePreload: {
    polyfill: true,
  },
  rollupOptions: {
    output: {
      entryFileNames: "assets/js/[name]-[hash].js",
      chunkFileNames: "assets/js/[name]-[hash].js",
      assetFileNames: (assetInfo) => {
        const name = assetInfo.names[0] ?? "";

        if (/\.(css)$/i.test(name)) {
          return "assets/css/[name]-[hash][extname]";
        }

        if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(name)) {
          return "assets/images/[name]-[hash][extname]";
        }

        if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
          return "assets/fonts/[name]-[hash][extname]";
        }

        return "assets/[name]-[hash][extname]";
      },
      manualChunks(id) {
        if (!id.includes("node_modules")) {
          return;
        }

        for (const [chunkName, packages] of Object.entries(vendorChunks)) {
          if (packages.some((packageName) => id.includes(`node_modules/${packageName}`))) {
            return chunkName;
          }
        }

        return "vendor";
      },
    },
  },
});
