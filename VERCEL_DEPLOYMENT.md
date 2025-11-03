# Deploying to Vercel - Complete Guide

## 🚀 One-Time Setup

### 1. Install Vercel CLI (Optional - for local deployments)
```bash
npm install -g vercel
```

### 2. Connect GitHub Repository to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "**Add New...**" → "**Project**"
3. Import your GitHub repository: `peka01/ntr-test`
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
5. Click "**Deploy**" (first deployment will fail - need to add env variables)

**Option B: Via Vercel CLI**
```bash
vercel login
vercel link
vercel --prod
```

### 3. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_GEMINI_API_KEY` | Your Gemini API key | Production, Preview, Development |
| `VITE_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `VITE_GITHUB_TOKEN` | Your GitHub personal access token | Production, Preview, Development |

**Note**: Copy these values from your `.env` file. Do NOT commit the `.env` file to Git!

**Important**: Check all three environment checkboxes for each variable!

### 4. Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click "**Redeploy**"

Or push a new commit to trigger automatic deployment.

## 🔄 Automatic Deployments

Once set up, Vercel will **automatically deploy** on every push to GitHub:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

## 📡 API Routes

Your serverless API routes are automatically deployed:

- `GET /api/help/content?section=<id>&lang=<sv|en>&source=<github|local>`
- `POST /api/help/commit` (body: `{ sectionId, language, content, commitMessage, token }`)

## 🌐 Your Deployment URLs

After deployment:
- **Production**: `https://ntr-test.vercel.app` (or custom domain)
- **Preview**: `https://ntr-test-<branch>-<user>.vercel.app`

## ✅ Verify Deployment

1. Visit your production URL
2. Open Help System
3. Check browser console for API calls
4. Edit a help topic and commit
5. Refresh to see changes from GitHub

## 🔧 Local Development

Continue using the dev server for local development:
```bash
npm run dev
```

Local dev server includes API route emulation - no changes needed!

## 📊 Monitor Deployments

In Vercel Dashboard you can:
- View deployment logs
- Check build times
- Monitor function execution
- View analytics
- Set up custom domains
- Configure deployment protection

## 🚨 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Run `npm run build` locally to test

### API Routes Not Working
- Check function logs in Vercel dashboard
- Verify CORS headers in browser console
- Test API routes directly: `https://your-app.vercel.app/api/help/content?section=overview&lang=sv&source=github`

### Environment Variables Not Working
- Make sure you checked all three environment checkboxes (Production, Preview, Development)
- Redeploy after adding/changing variables
- Variables are only available at build time for `VITE_*` prefixed vars

### GitHub API Errors
- Verify `VITE_GITHUB_TOKEN` is set correctly
- Check token hasn't expired
- Verify token has `repo` scope permissions

## 🎯 Deployment Checklist

- [x] GitHub repository connected to Vercel
- [x] Environment variables configured
- [x] First successful deployment
- [x] API routes working
- [x] Help content loading from GitHub
- [x] Help editor can commit to GitHub
- [ ] Custom domain configured (optional)
- [ ] Team access configured (optional)

## 💡 Pro Tips

1. **Branch Previews**: Create feature branches to test changes before merging to main
2. **Deployment Protection**: Enable password protection for preview deployments
3. **Analytics**: Enable Vercel Analytics for visitor insights
4. **Custom Domain**: Add your own domain in Project Settings
5. **Function Logs**: Monitor serverless function logs in real-time

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Your Project Settings](https://vercel.com/peka01/ntr-test/settings)
