import type { ServerOptions } from "vite";

export const createServerOptions = (env: Record<string, string>): ServerOptions => {
  const proxyPrefix = env.VITE_PROXY_PREFIX || "/api-proxy";
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:3000";

  return {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    open: false,
    cors: true,
    hmr: {
      overlay: true,
    },
    watch: {
      ignored: ["**/node_modules/**", "**/dist/**"],
    },
    proxy: {
      [proxyPrefix]: {
        target: proxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(new RegExp(`^${proxyPrefix}`), ""),
        configure: (proxy) => {
          proxy.on("error", (error) => {
            console.error(`[vite proxy] ${proxyPrefix} error:`, error.message);
          });
        },
      },
    },
  };
};
