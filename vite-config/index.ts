import { fileURLToPath, URL } from 'node:url'
import type { ConfigEnv, UserConfig } from 'vite'
import { loadEnv } from 'vite'
import { createAlias } from './alias'
import { createBuildOptions } from './build'
import { createVitePlugins } from './plugins'
import { createServerOptions } from './server'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const srcDir = fileURLToPath(new URL('../src', import.meta.url))

export const createViteConfig = ({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, rootDir, '')
  const isProduction = mode === 'production'

  return {
    root: rootDir,
    base: env.VITE_ROUTE_PREFIX || '/',
    publicDir: 'public',
    cacheDir: 'node_modules/.vite',
    envDir: rootDir,
    envPrefix: ['VITE_'],
    plugins: createVitePlugins(),
    resolve: {
      alias: createAlias(),
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      dedupe: ['vue'],
    },
    css: {
      devSourcemap: !isProduction,
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    server: createServerOptions(env),
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: false,
    },
    build: createBuildOptions(isProduction),
    optimizeDeps: {
      include: ['vue', 'vue-router', 'naive-ui'],
      entries: [`${srcDir}/main.ts`],
    },
  }
}
