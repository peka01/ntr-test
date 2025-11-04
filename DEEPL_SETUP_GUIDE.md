# DeepL Translation Integration - Setup Guide

## ✨ What's New?

The Help Editor now includes **automatic translation** between Swedish and English using DeepL API!

When you click the copy buttons (`SV → EN` or `EN → SV`), the content is automatically translated using professional AI translation, not just copied.

## 🔑 How to Get Your DeepL API Key

### Step 1: Sign Up for DeepL API (FREE)

1. Go to **https://www.deepl.com/pro-api**
2. Click "Sign up for free"
3. Choose the **"DeepL API Free"** plan:
   - ✅ **500,000 characters/month** - FREE
   - ✅ Perfect for help documentation
   - ✅ No credit card required

### Step 2: Get Your API Key

1. After signing up, log in to **https://www.deepl.com/account/summary**
2. Go to the **"Authentication Key"** section
3. Copy your API key (starts with something like `abc123-...:fx`)

### Step 3: Add to Your .env File

Open your `.env` file and add the DeepL API key:

```properties
# DeepL Translation API (Optional - for Help Editor translation feature)
# Get a free API key at: https://www.deepl.com/pro-api
# Free tier: 500,000 characters/month
VITE_DEEPL_API_KEY=your-api-key-here
```

Replace `your-api-key-here` with your actual API key from DeepL.

### Step 4: Restart Dev Server

```bash
# Stop the dev server (Ctrl+C) and restart:
npm run dev
```

## 🚀 Production Deployment (Vercel)

### Add API Key to Vercel:

1. Go to your Vercel project: **https://vercel.com/dashboard**
2. Select your project (ntr-test)
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   - **Name**: `VITE_DEEPL_API_KEY`
   - **Value**: Your DeepL API key
   - **Environments**: Check ✅ Production, Preview, Development
6. Click **"Save"**
7. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **"Redeploy"**

### Important Notes:

- Without the API key in Vercel, translation will **fall back** to copy-without-translation in production
- Users will see a prompt explaining DeepL is not configured
- The app works fine without it, but translation won't be automatic
- You can add it later without breaking anything

## 🎯 How to Use

### With DeepL Configured:

1. Open the Help Editor
2. Edit content in Swedish (SV tab)
3. Click **"🌐 SV → EN"** button
4. ✨ Content is **automatically translated** to English!
5. Review and adjust the translation if needed
6. Commit both versions

### Without DeepL (Fallback):

If no API key is configured:
- You'll see a prompt explaining how to set up DeepL
- Option to copy **without translation** (direct copy)
- Works but requires manual translation

## 🎨 Visual Features

- **🌐 Globe icon** on copy buttons = Translation enabled
- **⏳ Hourglass icon** = Translation in progress
- **Progress bar** shows translation status
- **Blue banner** displays "Translating content..." with percentage
- Buttons disabled during translation

## 💡 Benefits

1. **Professional Quality**: DeepL is considered the best AI translation
2. **Markdown Safe**: Preserves all markdown formatting
3. **Fast**: Translates instantly (usually < 2 seconds)
4. **Free**: 500,000 characters/month is more than enough
5. **Consistent**: Both language versions stay in sync

## 📊 Usage Tracking

The free tier gives you **500,000 characters per month**. 

To check your usage:
- Log in to https://www.deepl.com/account/usage
- See how many characters you've used

A typical help document is ~2,000 characters, so you can translate **~250 documents per month** on the free tier!

## 🔒 Security

- API key is stored in `.env` (not committed to git)
- Only used client-side for translation requests
- DeepL API is GDPR compliant

## ⚠️ Important Notes

1. **Free vs Paid API**:
   - Default configuration uses `api-free.deepl.com`
   - If you upgrade to paid, change URL in `translationService.ts`

2. **Translation Takes Time**:
   - Large documents may take a few seconds
   - Progress bar shows real-time status
   - Don't close the editor during translation

3. **Always Review**:
   - AI translation is very good but not perfect
   - Review and adjust translated content
   - Especially for technical terms or brand names

## 🎉 Ready to Use!

Once configured, translation is seamless:
- Click copy button → Content automatically translated
- No manual copying between windows
- Professional quality every time

Enjoy your new translation superpower! 🚀
