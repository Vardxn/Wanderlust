# Wanderlust Deployment Guide

## Deploy to Render.com (Free)

### Prerequisites:
1. GitHub account
2. MongoDB Atlas account (free tier)
3. Render.com account (free)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Set Up MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist IP: 0.0.0.0/0 (allow from anywhere)
5. Get your connection string

### Step 3: Deploy on Render
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your Wanderlust repository
5. Configure:
   - **Name**: wanderlust
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`
   - **Add Environment Variables**:
     - `MONGODB_URI`: your MongoDB Atlas connection string
     - `SESSION_SECRET`: random string (e.g., `your-secret-key-12345`)
     - `CLOUDINARY_CLOUD_NAME`: your cloudinary name
     - `CLOUDINARY_API_KEY`: your cloudinary key
     - `CLOUDINARY_API_SECRET`: your cloudinary secret
     - `NODE_ENV`: production

6. Click "Create Web Service"

### Your app will be live at:
`https://wanderlust-xxxx.onrender.com`

---

## Alternative: Railway.app

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select Wanderlust
5. Add environment variables (same as above)
6. Deploy!

---

## Alternative: Vercel + MongoDB Atlas

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Add environment variables in Vercel dashboard

---

## Free MongoDB Database:
**MongoDB Atlas** (500MB free)
- https://www.mongodb.com/cloud/atlas
- Best option for production

## Free Image Hosting:
**Cloudinary** (25GB free)
- https://cloudinary.com
- Already integrated in your app
