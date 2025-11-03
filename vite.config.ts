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
    
    // Determine base URL: Vercel uses root, GitHub Pages uses /ntr-test/
    const isVercel = process.env.VERCEL === '1';
    const baseUrl = isVercel ? '/' : '/ntr-test/';
    
    console.log('🔧 Vite config environment variables:', {
      mode,
      geminiApiKey: geminiApiKey ? `${geminiApiKey.substring(0, 4)}...` : 'not set',
      supabaseUrl: supabaseUrl ? 'set' : 'not set',
      supabaseAnonKey: supabaseAnonKey ? 'set' : 'not set',
      platform: isVercel ? 'Vercel' : 'GitHub Pages',
      baseUrl
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

    // Internal API plugin for help content operations
    const helpApiPlugin = () => ({
      name: 'help-api',
      configureServer(server) {
        // API endpoint to get help content from local or GitHub
        server.middlewares.use('/api/help/content', async (req, res, next) => {
          // Only handle GET requests
          if (req.method !== 'GET') {
            return next();
          }

          try {
            // Parse query parameters
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const sectionId = url.searchParams.get('section');
            const language = url.searchParams.get('lang') || 'sv';
            const source = url.searchParams.get('source') || 'local'; // 'local' or 'github'
            
            if (!sectionId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing section parameter' }));
              return;
            }

            // Map section IDs to actual file paths
            const getActualFilePath = (id: string, lang: string): string => {
              const langFolder = lang === 'sv' ? 'sv' : 'en';
              
              const pathMapping: Record<string, Record<string, string>> = {
                sv: {
                  'overview': 'overview',
                  'troubleshooting': 'troubleshooting',
                  'vouchers': 'Användare/vouchers',
                  'subscriptions': 'Användare/subscriptions',
                  'attendance': 'Användare/attendance',
                  'guided-tours': 'Användare/guided-tours',
                  'news-announcements': 'Användare/news-announcements',
                  'user-management': 'Administratör/user-management',
                  'training-management': 'Administratör/training-management',
                  'tour-management': 'Administratör/tour-management',
                  'shoutout-management': 'Administratör/shoutout-management'
                },
                en: {
                  'overview': 'overview',
                  'troubleshooting': 'troubleshooting',
                  'vouchers': 'User/vouchers',
                  'subscriptions': 'User/subscriptions',
                  'attendance': 'User/attendance',
                  'guided-tours': 'User/guided-tours',
                  'news-announcements': 'User/news-announcements',
                  'user-management': 'Admin/user-management',
                  'training-management': 'Admin/training-management',
                  'tour-management': 'Admin/tour-management',
                  'shoutout-management': 'Admin/shoutout-management'
                }
              };
              
              const mappedPath = pathMapping[langFolder]?.[id];
              return mappedPath ? `${langFolder}/${mappedPath}.md` : `${langFolder}/${id}.md`;
            };

            const relativePath = getActualFilePath(sectionId, language);

            if (source === 'local') {
              // Load from local docs folder
              const filePath = resolve(process.cwd(), 'docs', relativePath);
              
              if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
                res.end(JSON.stringify({ 
                  success: true, 
                  content, 
                  source: 'local',
                  path: relativePath
                }));
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: false, 
                  error: 'File not found',
                  path: relativePath
                }));
              }
            } else if (source === 'github') {
              // Proxy request to GitHub
              const repoOwner = 'peka01';
              const repoName = 'ntr-test';
              const githubUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/docs/${relativePath}`;
              
              const fetch = (await import('node-fetch')).default;
              const response = await fetch(githubUrl);
              
              if (response.ok) {
                const content = await response.text();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
                res.end(JSON.stringify({ 
                  success: true, 
                  content, 
                  source: 'github',
                  path: relativePath
                }));
              } else {
                res.statusCode = response.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: false, 
                  error: `GitHub request failed: ${response.status}`,
                  path: relativePath
                }));
              }
            } else {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid source parameter' }));
            }
          } catch (error) {
            console.error('Help API error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }));
          }
        });

        // API endpoint to commit help content to GitHub
        server.middlewares.use('/api/help/commit', async (req, res, next) => {
          // Only handle POST requests
          if (req.method !== 'POST') {
            return next();
          }

          try {
            // Read request body
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                const data = JSON.parse(body);
                const { sectionId, language, content, commitMessage, token } = data;

                if (!sectionId || !language || !content || !token) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing required parameters' }));
                  return;
                }

                // Map section ID to file path
                const getActualFilePath = (id: string, lang: string): string => {
                  const langFolder = lang === 'sv' ? 'sv' : 'en';
                  
                  const pathMapping: Record<string, Record<string, string>> = {
                    sv: {
                      'overview': 'overview',
                      'troubleshooting': 'troubleshooting',
                      'vouchers': 'Användare/vouchers',
                      'subscriptions': 'Användare/subscriptions',
                      'attendance': 'Användare/attendance',
                      'guided-tours': 'Användare/guided-tours',
                      'news-announcements': 'Användare/news-announcements',
                      'user-management': 'Administratör/user-management',
                      'training-management': 'Administratör/training-management',
                      'tour-management': 'Administratör/tour-management',
                      'shoutout-management': 'Administratör/shoutout-management'
                    },
                    en: {
                      'overview': 'overview',
                      'troubleshooting': 'troubleshooting',
                      'vouchers': 'User/vouchers',
                      'subscriptions': 'User/subscriptions',
                      'attendance': 'User/attendance',
                      'guided-tours': 'User/guided-tours',
                      'news-announcements': 'User/news-announcements',
                      'user-management': 'Admin/user-management',
                      'training-management': 'Admin/training-management',
                      'tour-management': 'Admin/tour-management',
                      'shoutout-management': 'Admin/shoutout-management'
                    }
                  };
                  
                  const mappedPath = pathMapping[langFolder]?.[id];
                  return mappedPath ? `docs/${langFolder}/${mappedPath}.md` : `docs/${langFolder}/${id}.md`;
                };

                const filePath = getActualFilePath(sectionId, language);
                const repoOwner = 'peka01';
                const repoName = 'ntr-test';

                // Get current file SHA if it exists
                const fetch = (await import('node-fetch')).default;
                const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
                
                const getResponse = await fetch(getFileUrl, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'ntr-test-help-system'
                  }
                });

                let sha: string | undefined;
                if (getResponse.ok) {
                  const fileData = await getResponse.json();
                  sha = (fileData as any).sha;
                }

                // Create or update the file
                const commitUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
                const commitData = {
                  message: commitMessage || `Update ${filePath}`,
                  content: Buffer.from(content).toString('base64'),
                  sha: sha
                };

                const commitResponse = await fetch(commitUrl, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'ntr-test-help-system'
                  },
                  body: JSON.stringify(commitData)
                });

                if (commitResponse.ok) {
                  const result = await commitResponse.json();
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ 
                    success: true, 
                    commit: result,
                    path: filePath
                  }));
                } else {
                  const errorText = await commitResponse.text();
                  res.statusCode = commitResponse.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ 
                    success: false, 
                    error: `GitHub commit failed: ${commitResponse.status}`,
                    details: errorText
                  }));
                }
              } catch (parseError) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: false, 
                  error: 'Invalid request body' 
                }));
              }
            });
          } catch (error) {
            console.error('Commit API error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }));
          }
        });
      }
    });

    return {
      base: baseUrl,
      plugins: [react(), serveDocsPlugin(), helpApiPlugin()],
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
