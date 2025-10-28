import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // For GitHub Actions builds, environment variables are set at build time
    // For local development, they come from .env file
    const geminiApiKey = process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
    const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
    
    console.log('🔧 Vite config environment variables:', {
      mode,
      geminiApiKey: geminiApiKey ? `${geminiApiKey.substring(0, 4)}...` : 'not set',
      supabaseUrl: supabaseUrl ? 'set' : 'not set',
      supabaseAnonKey: supabaseAnonKey ? 'set' : 'not set'
    });
    
    // Custom plugin to serve docs folder
    const serveDocsPlugin = () => ({
      name: 'serve-docs',
      configureServer(server) {
        server.middlewares.use('/docs', (req, res, next) => {
          const filePath = resolve(process.cwd(), 'docs', req.url);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            // Set appropriate MIME type based on file extension
            const ext = filePath.split('.').pop()?.toLowerCase();
            let contentType = 'text/plain; charset=utf-8';
            
            if (ext === 'md') {
              contentType = 'text/markdown; charset=utf-8';
            } else if (ext === 'json') {
              contentType = 'application/json; charset=utf-8';
            } else if (ext === 'css') {
              contentType = 'text/css; charset=utf-8';
            } else if (ext === 'js') {
              contentType = 'application/javascript; charset=utf-8';
            }
            
            res.setHeader('Content-Type', contentType);
            res.end(fs.readFileSync(filePath, 'utf-8'));
          } else {
            next();
          }
        });
      }
    });

    return {
      base: '/ntr-test/',
      plugins: [react(), serveDocsPlugin()],
      // Ensure proper module resolution for GitHub Pages
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url))
        }
      },
      define: {
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiApiKey),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey)
      },
      // Configure Vite to serve docs folder as static assets
      publicDir: 'public',
      build: {
        outDir: 'dist',
        sourcemap: false,
        // Ensure proper file extensions for GitHub Pages
        assetsDir: 'assets',
        rollupOptions: {
          output: {
            // Force .js extension for all JavaScript files to ensure proper MIME type
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              // Force .js extension for JavaScript files
              if (assetInfo.name && assetInfo.name.endsWith('.js')) {
                return 'assets/[name]-[hash].js';
              }
              // Ensure other assets have proper extensions
              return 'assets/[name]-[hash].[ext]';
            },
            // Ensure proper module format
            format: 'es'
          }
        },
        // Use ES modules for better GitHub Pages compatibility
        target: 'esnext',
        minify: 'terser',
        terserOptions: {
          format: {
            comments: false
          }
        },
        // Ensure compatibility with GitHub Pages
        modulePreload: {
          polyfill: true
        },
        // Force proper MIME types
        assetsInlineLimit: 0
      },
      server: {
        headers: {
          // Content Security Policy to allow external content
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com",
            "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://api.github.com https://raw.githubusercontent.com https://peka01.github.io https://generativelanguage.googleapis.com https://*.supabase.co",
            "frame-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'"
          ].join('; '),
          // CORS headers for development
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, Pragma'
        }
      }
    };
});
