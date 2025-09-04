#!/usr/bin/env node

// Build script that ensures .nojekyll file is copied to dist folder
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  
  console.log('✅ Build completed with .nojekyll files!');
  console.log('📁 Files created:');
  console.log('   - dist/.nojekyll');
  console.log('   - public/.nojekyll');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
