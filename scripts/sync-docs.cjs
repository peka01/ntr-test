// Sync docs from ./docs/{sv,en} to ./public/docs/{sv,en}
// Ensures local help source works in dev and build (Vite serves public/)
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true }).catch(() => {});
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fsp.copyFile(src, dest);
}

async function copyDir(srcDir, destDir) {
  try {
    const entries = await fsp.readdir(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else if (entry.isFile()) {
        await copyFile(srcPath, destPath);
      }
    }
  } catch (e) {
    // No-op if source doesn't exist
  }
}

async function main() {
  const projectRoot = process.cwd();
  const srcRoot = path.join(projectRoot, 'docs');
  const destRoot = path.join(projectRoot, 'public', 'docs');

  // Copy Swedish and English folders (and any others present)
  await copyDir(path.join(srcRoot, 'sv'), path.join(destRoot, 'sv'));
  await copyDir(path.join(srcRoot, 'en'), path.join(destRoot, 'en'));
}

main().catch(err => {
  console.error('Failed to sync docs:', err);
  process.exit(1);
});


