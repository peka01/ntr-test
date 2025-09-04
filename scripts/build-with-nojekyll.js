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
  
  console.log('✅ Build completed with .nojekyll files!');
  console.log('📁 Files created:');
  console.log('   - dist/.nojekyll');
  console.log('   - public/.nojekyll');
  console.log('   - dist/docs/ (copied from docs/)');
  console.log('📚 Docs available at production URL: /docs/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}