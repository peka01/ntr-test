# Deploying to Vercel

## Quick Start

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

## Environment Variables

You'll need to set these in Vercel dashboard:

- `VITE_GEMINI_API_KEY` - Your Gemini API key
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_GITHUB_TOKEN` - GitHub personal access token with repo write access

## Setting Environment Variables in Vercel

### Via Dashboard:
1. Go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add each variable for Production, Preview, and Development

### Via CLI:
```bash
vercel env add VITE_GEMINI_API_KEY
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GITHUB_TOKEN
```

## API Routes

The following API routes will be available:

- `GET /api/help/content?section=<id>&lang=<sv|en>&source=<github|local>`
  - Fetches help content from GitHub or local files
  
- `POST /api/help/commit`
  - Commits help content changes to GitHub
  - Body: `{ sectionId, language, content, commitMessage, token }`

## Local Development

For local development, the Vite dev server includes API emulation:

```bash
npm run dev
```

The internal API routes will work both locally and in production.

## Deployment Process

1. Push your code to GitHub
2. Vercel will automatically detect changes and deploy
3. First deployment will need environment variables configured
4. Subsequent deployments are automatic on push

## Vercel Dashboard

After deployment, you can:
- View deployment logs
- Configure custom domains
- Monitor analytics
- Manage environment variables
- View function logs

## Production URL

Your app will be available at:
- `https://your-project.vercel.app`
- Or your custom domain

## Troubleshooting

### API Routes Not Working
- Check Vercel function logs in dashboard
- Verify environment variables are set
- Check CORS headers in browser console

### GitHub API Errors
- Verify VITE_GITHUB_TOKEN has correct permissions
- Check token hasn't expired
- Verify repository name in API functions

### Build Errors
- Run `npm run build` locally first
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
