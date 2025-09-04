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
  
  // Ensure structure-map.json exists in public/docs/ (needed for help system)
  const structureMapSource = path.join(process.cwd(), 'docs', 'structure-map.json');
  const structureMapDest = path.join(process.cwd(), 'public', 'docs', 'structure-map.json');
  
  if (fs.existsSync(structureMapSource)) {
    console.log('📋 Copying structure-map.json to public/docs/...');
    fs.copyFileSync(structureMapSource, structureMapDest);
  } else {
    console.warn('⚠️ structure-map.json not found in docs/ folder');
  }
  
  // Docs are served directly from public/docs/ - structure-map.json copied above
  
  console.log('✅ Build completed with .nojekyll files!');
  console.log('📁 Files created:');
  console.log('   - dist/.nojekyll');
  console.log('   - public/.nojekyll');
  console.log('   - public/docs/structure-map.json');
  console.log('📚 Docs served directly from public/docs/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}