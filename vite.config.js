import { defineConfig } from 'vite';
import { specter } from 'vite-plugin-specter';

export default defineConfig({
  plugins: [specter()],
  server: {
    port: 8000,
    strictPort: true, // always use 8000 — never auto-pick another port
  },
});
