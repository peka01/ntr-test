import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.SUPABASE_URL': JSON.stringify('https://bumphnqhbbtmlhiwokmy.supabase.co'),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bXBobnFoYmJ0bWxoaXdva215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NTI4MTMsImV4cCI6MjA3MjAyODgxM30.l9b82y_-e0l293VvBOemT_m60jW_qxxzCcLmhFWaofw')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      assetsInclude: ['**/*.md']
    };
});
