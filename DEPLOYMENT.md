# 🚀 Vercel Deployment Guide

## Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **Git Repository**: Push your code to GitHub/GitLab/Bitbucket

## 📋 Step-by-Step Deployment

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Set Environment Variables
In your Vercel dashboard or via CLI:
```bash
vercel env add GROQ_API_KEY
# Enter your API key when prompted: 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
```

### 4. Deploy to Vercel
```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

## 🔧 Alternative: GitHub Integration

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/sql-testcases-generator.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variable: `GROQ_API_KEY`
5. Deploy!

## 🌐 Features After Deployment

### ✅ Global Stats System
- **Real-time tracking** of all users across the globe
- **Persistent storage** using Vercel's serverless functions
- **User identification** with unique IDs stored in localStorage
- **Admin controls** to clear global stats with passcode

### ✅ Secure API Proxy
- **Hidden API keys** - never exposed to frontend
- **CORS enabled** for cross-origin requests
- **Error handling** with proper HTTP status codes

### ✅ Automatic Scaling
- **Serverless functions** scale automatically
- **Global CDN** for fast loading worldwide
- **Zero maintenance** required

## 📊 Global Stats API Endpoints

### GET `/api/stats`
Returns global statistics:
```json
{
  "totalGenerated": 1250,
  "goodFeedback": 890,
  "badFeedback": 45,
  "totalUsers": 156,
  "lastUpdated": "2025-01-08T10:30:00.000Z"
}
```

### POST `/api/stats`
Update statistics:
```json
{
  "action": "generated|good_feedback|bad_feedback|clear_all",
  "userId": "user-abc123",
  "count": 5,
  "passcode": "1072025" // Only for clear_all
}
```

## 🔒 Security Features

1. **API Key Protection**: Never exposed to frontend
2. **User Privacy**: Only anonymous user IDs stored
3. **Admin Protection**: Passcode required for clearing stats
4. **CORS Security**: Proper headers for cross-origin requests

## 📈 Monitoring

After deployment, you can monitor:
- **Function logs** in Vercel dashboard
- **Usage statistics** via the stats API
- **Performance metrics** in Vercel analytics

## 🛠️ Local Development

For local testing with global stats:
```bash
# Install dependencies
npm install

# Start Vercel dev server
vercel dev

# Or use the build script
npm run build
```

## 🎯 Production URL Structure

After deployment, your app will be available at:
- **Main App**: `https://your-app-name.vercel.app/`
- **Stats API**: `https://your-app-name.vercel.app/api/stats`
- **Groq Proxy**: `https://your-app-name.vercel.app/api/groq`

## 🔄 Updates

To update your deployed app:
```bash
# Make changes to your code
git add .
git commit -m "Update features"
git push

# Or deploy directly
vercel --prod
```

Your app will automatically redeploy with the latest changes!