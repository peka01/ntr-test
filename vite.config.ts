import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

// Ensure __dirname is available in ESM context
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Set base path for GitHub Pages (your repository name)
    const base = process.env.NODE_ENV === 'production' ? '/ntr-test/' : '/';
    
    return {
      base,
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.SUPABASE_URL': JSON.stringify('https://bumphnqhbbtmlhiwokmy.supabase.co'),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bXBobnFoYmJ0bWxoaXdva215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NTI4MTMsImV4cCI6MjA3MjAyODgxM30.l9b82y_-e0l293VvBOemT_m60jW_qxxzCcLmhFWaofw')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              supabase: ['@supabase/supabase-js'],
              gemini: ['@google/genai']
            }
          }
        }
      },
      server: {
        host: '0.0.0.0',
        port: 3000,
        proxy: {
          // Dev-time proxy so /helpdocs/ works in Vite too (no third-party proxies)
          '/helpdocs': {
            target: 'https://raw.githubusercontent.com/peka01/helpdoc/main',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/helpdocs/, ''),
          }
        },
        watch: {
          usePolling: true
        }
      },
      assetsInclude: ['**/*.md']
    };
});
