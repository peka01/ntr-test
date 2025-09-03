# GitHub Pages Deployment Guide

This guide explains how to deploy your Training Management System to GitHub Pages.

## Prerequisites

1. Your code is pushed to a GitHub repository
2. You have admin access to the repository
3. GitHub Pages is enabled in your repository settings

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **gh-pages** branch
6. Click **Save**

### 2. Install Dependencies

```bash
npm install
```

### 3. Update Configuration

**Important**: Update the `homepage` field in `package.json` with your actual GitHub username:

```json
"homepage": "https://YOUR_USERNAME.github.io/ntr-test"
```

### 4. Deployment

The recommended way to deploy is using the script configured in `package.json`. This script handles both the build process and the deployment to the `gh-pages` branch.

```bash
# First, install the new gh-pages dependency
npm install

# Then, run the deploy script
npm run deploy
```

This single command will:
1. Run `npm run build` to create a production-ready `dist` folder.
2. Use the `gh-pages` tool to push the contents of the `dist` folder to your `gh-pages` branch.

### 5. Automatic Deployment (Via GitHub Actions)

If you have a GitHub Actions workflow set up, ensure it now runs `npm run deploy`. This will automate the process on every push to your main branch.

## How It Works

1. **Build Process**: The app is built using Vite with the correct base path for GitHub Pages
2. **Deployment**: Built files are pushed to the `gh-pages` branch
3. **Routing**: SPA routing is handled by the 404.html redirect script
4. **Updates**: Every push to main/master triggers a new deployment

## File Structure After Deployment

```
gh-pages branch:
├── index.html
├── 404.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
└── other static files...
```

## Troubleshooting

### Common Issues

1. **404 Errors on Refresh**: Make sure the 404.html file is properly configured
2. **Assets Not Loading**: Check that the base path in vite.config.ts matches your repository name
3. **Build Failures**: Ensure all environment variables are properly set in GitHub Actions

### Environment Variables

For the build to work properly, you may need to add these as GitHub repository secrets:
- `GEMINI_API_KEY` (if required)
- `SUPABASE_URL` (if different from hardcoded value)
- `SUPABASE_ANON_KEY` (if different from hardcoded value)

## Local Testing

To test the production build locally:

```bash
npm run build
npm run preview
```

## Notes

- Your Docker setup remains unchanged for local development
- GitHub Pages deployment is completely separate from your Docker environment
- The app will be available at: `https://YOUR_USERNAME.github.io/ntr-test`
- Updates are automatic when you push to the main branch
