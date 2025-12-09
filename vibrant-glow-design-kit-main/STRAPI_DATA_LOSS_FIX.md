# Strapi Data Loss Issue - Fix Guide

## 🔴 Problem

Your Strapi instance on Render (free tier) is experiencing:
- **Data gets deleted** after some time
- **You get logged out** and need to sign up again
- **Need to re-import all data** using import scripts

## 🔍 Root Cause

**Render Free Tier Limitations:**
1. **Spins down after 15 minutes** of inactivity
2. **Ephemeral storage** - data can be lost when the service restarts
3. **No persistent database** by default on free tier
4. **Cold starts** - takes time to wake up when accessed

## ✅ Solutions

### Solution 1: Keep Strapi Alive (Quick Fix)

Run this script to ping Strapi every 10 minutes and prevent it from spinning down:

```bash
npm run keep-strapi-alive
```

**Keep this running in a separate terminal** while you work. It will:
- Ping Strapi every 10 minutes
- Prevent the service from spinning down
- Keep your data accessible

### Solution 2: Use Persistent Database (Recommended)

**For Staging Strapi (`smarthoster-blogs-1.onrender.com`):**

1. **Add a PostgreSQL database** in Render:
   - Go to Render Dashboard
   - Create a new PostgreSQL database
   - Note the connection string

2. **Update Strapi to use PostgreSQL:**
   - In your Strapi project on Render
   - Add environment variable: `DATABASE_URL` = your PostgreSQL connection string
   - Redeploy Strapi

3. **Benefits:**
   - Data persists even when service spins down
   - No data loss
   - Better performance

### Solution 3: Upgrade Render Plan

**Upgrade to Render Paid Plan ($7/month):**
- Service stays awake 24/7
- No spin-downs
- Better performance
- More reliable

### Solution 4: Use a Different Hosting Service

**Alternatives:**
- **Railway** - Free tier with persistent storage
- **Fly.io** - Free tier with better persistence
- **DigitalOcean App Platform** - $5/month, very reliable
- **Heroku** - Paid plans available

## 🛠️ Quick Fix Steps (Right Now)

1. **Open a new terminal**
2. **Run the keep-alive script:**
   ```bash
   npm run keep-strapi-alive
   ```
3. **Leave it running** while you work
4. **Import your data** while Strapi is awake

## 📝 Long-term Solution

**Best approach:**
1. Add PostgreSQL database to Render
2. Configure Strapi to use PostgreSQL
3. Your data will persist even when service spins down

## 🔐 API Token Setup

To avoid re-authentication, set your API token in `.env`:

```env
NEXT_PUBLIC_STRAPI_URL=https://smarthoster-blogs-1.onrender.com
STRAPI_API_TOKEN=your_api_token_here
```

**To get your API token:**
1. Go to Strapi admin: `https://smarthoster-blogs-1.onrender.com/admin`
2. Settings → API Tokens → Create new token
3. Copy the token to `.env`

## ⚠️ Important Notes

- **Free tier limitations** are expected behavior
- **Data loss** happens because of ephemeral storage
- **Keep-alive script** is a temporary solution
- **Persistent database** is the permanent solution

