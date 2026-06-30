import { defineConfig } from 'vite'
import { createViteConfig } from './vite-config'

export default defineConfig((configEnv) => createViteConfig(configEnv))
