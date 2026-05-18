import { defineConfig } from "vite";

// Storybook uses its own Vite config, separate from rwsdk's vite.config.mts
// which includes Cloudflare/Redwood plugins incompatible with browser builds
export default defineConfig({});
