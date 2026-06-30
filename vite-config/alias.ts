import { fileURLToPath, URL } from 'node:url'
import type { AliasOptions } from 'vite'

const resolvePath = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export const createAlias = (): AliasOptions => [
  {
    find: '@',
    replacement: resolvePath('../src'),
  },
  {
    find: '@components',
    replacement: resolvePath('../src/components'),
  },
  {
    find: '@hooks',
    replacement: resolvePath('../src/hooks'),
  },
  {
    find: '@assets',
    replacement: resolvePath('../src/assets'),
  },
  {
    find: '@styles',
    replacement: resolvePath('../src/styles'),
  },
  {
    find: '@utils',
    replacement: resolvePath('../src/utils'),
  },
  {
    find: '@views',
    replacement: resolvePath('../src/views'),
  },
]
