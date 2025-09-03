import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // For GitHub Actions builds, environment variables are set at build time
    // For local development, they come from .env file
    const geminiApiKey = process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
    const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://bumphnqhbbtmlhiwokmy.supabase.co';
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bXBobnFoYmJ0bWxoaXVva215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NTI4MTMsImV4cCI6MjA3MjAyODgxM30.l9b82y_-e0l293VvBOemT_m60jW_qxxzCcLmhFWaofw';
    
    console.log('🔧 Vite config environment variables:', {
      mode,
      geminiApiKey: geminiApiKey ? `${geminiApiKey.substring(0, 4)}...` : 'not set',
      supabaseUrl: supabaseUrl ? 'set' : 'not set',
      supabaseAnonKey: supabaseAnonKey ? 'set' : 'not set'
    });
    
    return {
      base: '/ntr-test/',
      plugins: [react()],
      define: {
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiApiKey),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey)
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
          input: './index.html'
        },
        // Ensure proper file extensions for GitHub Pages
        assetsDir: 'assets'
      }
    };
});
