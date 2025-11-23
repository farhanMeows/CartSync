# 🚀 Deploy CartSync Backend to Render.com (FREE) using Docker

## Prerequisites

- GitHub account
- Your code pushed to GitHub (already done ✅)
- Repository: `farhanMeows/khatakhat-cart-app-deployed`

## Step-by-Step Deployment

### 1. Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub

### 2. Create PostgreSQL Database

1. Dashboard → Click "New +" → "PostgreSQL"
2. Settings:
   - Name: `cartsync-db`
   - Database: `cartsync`
   - User: `cartsync`
   - Region: Choose closest to you (e.g., Oregon, Frankfurt, Singapore)
   - Plan: **Free** (512 MB RAM, expires after 90 days)
3. Click "Create Database"
4. Wait 1-2 minutes
5. **Copy the "Internal Database URL"** - looks like:
   ```
   postgresql://cartsync:abc123...@dpg-xxx-a/cartsync
   ```
   ⚠️ Save this - you'll need it in the next step!

### 3. Deploy Backend Web Service with Docker

1. Dashboard → Click "New +" → "Web Service"
2. Click "Connect a repository" → Select: `farhanMeows/khatakhat-cart-app-deployed`
3. Configure Basic Settings:
   - **Name**: `cartsync-backend`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: **Docker** (IMPORTANT!)
   - **Plan**: **Free**

4. Click "Advanced" → Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5001
   DATABASE_URL=<paste your Internal Database URL from step 2.5>
   ADMIN_PASSWORD=YourSecurePassword123!
   CORS_ORIGIN=*
   ```
   
   Example:
   ```
   DATABASE_URL=postgresql://cartsync:abc123xyz@dpg-crqj8n8gph6c738u9abc-a/cartsync
   ```

5. Click "Create Web Service"
6. Wait 10-15 minutes ☕ (Docker build + deployment)
   - First build takes longer
   - You'll see build logs in real-time

### 3. Run Database Migrations

After deployment:

1. Go to your web service
2. Click "Shell" tab
3. Run:

```bash
npm run migrate
```

Or connect manually:

1. Get database connection string
### 4. Monitor Deployment

Watch the build logs in Render dashboard:
1. You'll see Docker building the image
2. Installing dependencies
3. Starting the server
4. "✅ Connected to PostgreSQL successfully"
5. "🚀 CartSync Backend Server running on port 5001"

### 5. Get Your Backend URL

After successful deployment, your backend will be available at:

```
https://cartsync-backend.onrender.com
```

**Important:** Note this URL - you'll need it for dashboard and mobile app!

### 6. Test Your Backend

```bash
curl https://cartsync-backend.onrender.com
```

You should see:
```json
{"message":"CartSync API is running"}
```

### 7. Update CORS for Dashboard

After you deploy the dashboard (next step), come back and add:

1. Go to Render → cartsync-backend → Environment
2. Update `CORS_ORIGIN` from `*` to your dashboard URL:
   ```
   CORS_ORIGIN=https://cartsync-dashboard.vercel.app
   ```

### 8. Update Frontend Apps

**Dashboard** (`dashboard/.env`):

```env
VITE_API_URL=https://cartsync-backend.onrender.com
VITE_SOCKET_URL=https://cartsync-backend.onrender.com
```

**Mobile App** (`cartSync/src/config/constants.js`):

```javascript
export const API_URL = "https://cartsync-backend.onrender.com";
export const SOCKET_URL = API_URL;
```

## 🎯 Free Tier Limitations

### Render.com Free Tier:

- ✅ 750 hours/month (enough for 24/7)
- ✅ Free PostgreSQL (1GB storage)
- ⚠️ Service sleeps after 15 minutes of inactivity
- ⚠️ Takes ~30 seconds to wake up on first request
- ✅ 100GB bandwidth/month

### How to Handle Sleep Mode:

The backend sleeps after 15 min of inactivity but wakes up automatically when accessed.

**Solutions:**

1. **Accept it** - For testing/development, 30s wake-up is fine
2. **Ping service** - Use a free cron job to ping every 14 minutes:
   - Use https://cron-job.org (free)
   - Set up: `GET https://cartsync-backend.onrender.com` every 14 minutes
3. **Upgrade to paid** - $7/month for always-on

## 🔄 Auto-Deploy (CI/CD)

Once connected, Render auto-deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys! 🎉
```

## 📊 Monitoring

In Render dashboard:

- View logs in real-time
- Monitor CPU/Memory usage
- See request metrics
- Set up alerts

## 🐛 Troubleshooting

### Build Failed

- Check logs in Render dashboard
- Verify `package.json` has all dependencies
- Ensure `npm install` works locally

### Database Connection Failed

- Verify DATABASE*URL or individual DB*\* variables are set
- Check database is running (should be always on)
- Verify internal database URL (not external) is used

### CORS Errors

- Set `CORS_ORIGIN=*` for testing
- For production, set to your dashboard URL

### Service Keeps Sleeping

- Use cron-job.org to ping every 14 minutes (free)
- Or upgrade to paid plan ($7/month)

## 💰 Cost Comparison

| Service          | Free Tier       | Paid                   |
| ---------------- | --------------- | ---------------------- |
| **Render**       | ✅ Free forever | $7/month for always-on |
| **Railway**      | $5 credit/month | $5-20/month            |
| **Heroku**       | ❌ No free tier | $7/month               |
| **DigitalOcean** | ❌ No free tier | $6/month               |
| **AWS**          | 12 months free  | Complex pricing        |

## 🎉 Alternative: Railway.app

If Render doesn't work:

1. Go to https://railway.app
2. "Start a New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Add PostgreSQL service
5. Set environment variables
6. Deploy!

Railway gives you $5/month credit (enough for small app).

## 📝 Production Checklist

Before going live:

- [ ] Set strong `JWT_SECRET`
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Set specific `CORS_ORIGIN` (your dashboard URL)
- [ ] Enable SSL (Render does this automatically)
- [ ] Set up monitoring/alerts
- [ ] Test all API endpoints
- [ ] Run database migrations
- [ ] Test Socket.IO connections
- [ ] Update mobile app API URL
- [ ] Update dashboard API URL
- [ ] Test real device with production backend

## 🆘 Need Help?

1. Check Render documentation: https://render.com/docs
2. Check build logs in Render dashboard
3. Test locally first: `npm start`
4. Verify environment variables are set correctly

---

**Your backend will be live at: `https://cartsync-backend.onrender.com`** 🚀
