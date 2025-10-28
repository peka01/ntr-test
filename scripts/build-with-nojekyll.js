#!/usr/bin/env node

// Build script that ensures .nojekyll file is copied to dist folder
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple build script - no copying needed since docs are served directly from public/

console.log('🔧 Building with .nojekyll file...');

try {
  // Run the normal build
  console.log('📦 Running Vite build...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Ensure .nojekyll file exists in dist
  const nojekyllPath = path.join(process.cwd(), 'dist', '.nojekyll');
  if (!fs.existsSync(nojekyllPath)) {
    console.log('📄 Creating .nojekyll file in dist...');
    fs.writeFileSync(nojekyllPath, '');
  }
  
  // Also ensure it exists in public (for development)
  const publicNojekyllPath = path.join(process.cwd(), 'public', '.nojekyll');
  if (!fs.existsSync(publicNojekyllPath)) {
    console.log('📄 Creating .nojekyll file in public...');
    fs.writeFileSync(publicNojekyllPath, '');
  }
  
  // Copy docs folder to dist for production serving
  console.log('📚 Copying docs folder to dist...');
  const docsSource = path.join(process.cwd(), 'docs');
  const docsDest = path.join(process.cwd(), 'dist', 'docs');
  
  if (fs.existsSync(docsSource)) {
    // Remove existing docs folder in dist if it exists
    if (fs.existsSync(docsDest)) {
      fs.rmSync(docsDest, { recursive: true, force: true });
    }
    
    // Copy docs folder to dist
    fs.cpSync(docsSource, docsDest, { recursive: true });
    console.log('✅ Docs folder copied to dist/docs/');
  } else {
    console.warn('⚠️ Docs folder not found at source location');
  }
  
  // Create a simple index.html redirect for GitHub Pages compatibility
  console.log('🔧 Creating GitHub Pages compatibility files...');
  const redirectHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
        // Redirect to the main application
        window.location.href = '/ntr-test/';
    </script>
</head>
<body>
    <p>Redirecting to the application...</p>
</body>
</html>`;
  
  // Write redirect file at root level for GitHub Pages
  const rootRedirectPath = path.join(process.cwd(), 'dist', 'index.html');
  if (fs.existsSync(rootRedirectPath)) {
    console.log('✅ Main index.html already exists');
  }
  
  // Fix GitHub Pages MIME type issues by ensuring proper file extensions
  console.log('🔧 Fixing GitHub Pages MIME type issues...');
  const assetsDir = path.join(process.cwd(), 'dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    files.forEach(file => {
      const filePath = path.join(assetsDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        // Check if this is a JavaScript file without .js extension
        const isJavaScript = file.includes('index-') || file.includes('main-') || file.includes('chunk-');
        if (isJavaScript && !file.endsWith('.js')) {
          const newFileName = file + '.js';
          const newFilePath = path.join(assetsDir, newFileName);
          fs.renameSync(filePath, newFilePath);
          console.log(`📝 Renamed ${file} to ${newFileName}`);
          
          // Update index.html to reference the new filename
          const indexPath = path.join(process.cwd(), 'dist', 'index.html');
          if (fs.existsSync(indexPath)) {
            let htmlContent = fs.readFileSync(indexPath, 'utf-8');
            htmlContent = htmlContent.replace(file, newFileName);
            fs.writeFileSync(indexPath, htmlContent);
            console.log(`📝 Updated index.html to reference ${newFileName}`);
          }
        }
      }
    });
  }
  
  // Create a .htaccess file for Apache servers (GitHub Pages uses Apache)
  console.log('🔧 Creating .htaccess file for proper MIME types...');
  const htaccessContent = `# GitHub Pages MIME type fixes
AddType application/javascript .js
AddType text/css .css
AddType application/json .json
AddType text/markdown .md

# Ensure proper module type for ES modules
<FilesMatch "\\.js$">
    Header set Content-Type "application/javascript; charset=utf-8"
</FilesMatch>

# Cache control for assets
<FilesMatch "\\.(js|css)$">
    Header set Cache-Control "public, max-age=31536000"
</FilesMatch>
`;
  
  const htaccessPath = path.join(process.cwd(), 'dist', '.htaccess');
  fs.writeFileSync(htaccessPath, htaccessContent);
  console.log('📝 Created .htaccess file for MIME type fixes');
  
  console.log('✅ Build completed with .nojekyll files and MIME type fixes!');
  console.log('📁 Files created:');
  console.log('   - dist/.nojekyll');
  console.log('   - public/.nojekyll');
  console.log('   - dist/.htaccess (MIME type fixes)');
  console.log('   - dist/docs/ (copied from docs/)');
  console.log('   - Fixed JavaScript file extensions for GitHub Pages');
  console.log('📚 Docs available at production URL: /docs/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}