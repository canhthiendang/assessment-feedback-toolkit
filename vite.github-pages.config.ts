import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repositoryName = 'assessment-feedback-toolkit';
const basePath = `/${repositoryName}`;

export default defineConfig({
  root: 'github-pages',
  base: `${basePath}/`,
  publicDir: '../public',
  plugins: [react()],
  define: {
    'process.env.NEXT_PUBLIC_STATIC_EDITION': JSON.stringify('true'),
    'process.env.NEXT_PUBLIC_BASE_PATH': JSON.stringify(basePath),
    'process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL': JSON.stringify('https://forms.cloud.microsoft/e/2CbzbswhcQ'),
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
});
