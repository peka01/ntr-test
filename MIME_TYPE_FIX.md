# MIME Type Fix for GitHub Pages

## The Problem

GitHub Pages sometimes serves JavaScript files with the wrong MIME type (`application/octet-stream` instead of `text/javascript`), causing this error:

```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.
```

## The Solution

### 1. Add .nojekyll File

The `.nojekyll` file tells GitHub Pages to skip Jekyll processing, which can interfere with MIME types.

**Files to ensure exist:**
- `public/.nojekyll` (for development)
- `dist/.nojekyll` (for production)

### 2. Use the Custom Build Script

The build process now automatically ensures `.nojekyll` files are created:

```bash
npm run build
```

This runs `scripts/build-with-nojekyll.js` which:
1. Runs the normal Vite build
2. Creates `.nojekyll` files in both `public/` and `dist/` folders

### 3. Deploy to GitHub Pages

```bash
npm run deploy
```

This will:
1. Build the project with `.nojekyll` files
2. Deploy the `dist/` folder to the `gh-pages` branch

## Testing the Fix

1. **Check .nojekyll file exists:**
   - Visit: `https://peka01.github.io/ntr-test/.nojekyll`
   - Should return a 200 status (not 404)

2. **Check JavaScript MIME types:**
   - Open browser dev tools → Network tab
   - Load the page
   - Check that `.js` files have `Content-Type: text/javascript`

3. **Use the test file:**
   - Open `test-mime-types.html` in your browser
   - It will automatically test MIME types and .nojekyll file

## Why This Happens

- **Jekyll Processing**: GitHub Pages uses Jekyll by default, which can interfere with file serving
- **MIME Type Detection**: Without proper configuration, GitHub Pages may not detect JavaScript files correctly
- **Module Scripts**: Modern browsers are strict about MIME types for ES modules

## Prevention

- Always use the custom build script: `npm run build`
- Ensure `.nojekyll` files are present in both `public/` and `dist/`
- Test the deployment before pushing to main branch

## Troubleshooting

If the issue persists:

1. **Clear browser cache** (Ctrl+Shift+R)
2. **Check .nojekyll file** is accessible at the root URL
3. **Verify build output** includes `.nojekyll` in `dist/` folder
4. **Check GitHub Pages settings** - ensure it's serving from `gh-pages` branch
5. **Wait a few minutes** - GitHub Pages can take time to update

## Alternative Solutions

If the `.nojekyll` approach doesn't work:

1. **Use a different base path** in `vite.config.ts`
2. **Add explicit MIME type headers** in a custom server
3. **Use a different hosting service** (Netlify, Vercel, etc.)

The `.nojekyll` file approach should resolve the MIME type issue in most cases.
