# 🚀 Deploy CartSync Backend to Render.com (FREE)

## Prerequisites
- GitHub account
- Your code pushed to GitHub (already done ✅)

## Step-by-Step Deployment

### 1. Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub

### 2. Deploy from GitHub

#### Option A: Using Blueprint (Automatic - Recommended)
1. Click "New +" → "Blueprint"
2. Connect your GitHub repository: `Khatakhat/khatakhat-cart-app`
3. Render will detect `backend/render.yaml`
4. Review and click "Apply"
5. Set `ADMIN_PASSWORD` environment variable
6. Wait 5-10 minutes for deployment

#### Option B: Manual Setup
If blueprint doesn't work:

**2.1 Create PostgreSQL Database**
1. Dashboard → "New +" → "PostgreSQL"
2. Settings:
   - Name: `cartsync-db`
   - Database: `cartsync_db`
   - User: `cartsync`
   - Region: Choose closest to you
   - Plan: **Free**
3. Click "Create Database"
4. **Copy** the "Internal Database URL" (you'll need this)

**2.2 Create Web Service**
1. Dashboard → "New +" → "Web Service"
2. Connect your repository
3. Settings:
   - Name: `cartsync-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

**2.3 Add Environment Variables**
Click "Advanced" → Add these variables:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=<click "Generate" button>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here

# From PostgreSQL database (copy from database page)
DB_HOST=<from database internal URL>
DB_PORT=5432
DB_USER=cartsync
DB_PASSWORD=<from database>
DB_NAME=cartsync_db

# Or use single DATABASE_URL
DATABASE_URL=<internal database URL>

CORS_ORIGIN=*
```

4. Click "Create Web Service"

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
2. Use TablePlus/pgAdmin to connect
3. Run SQL from `backend/src/database/schema.sql`

### 4. Get Your Backend URL

Your backend will be available at:
```
https://cartsync-backend.onrender.com
```

**Important:** Note this URL - you'll need it for dashboard and mobile app!

### 5. Test Your Backend

```bash
curl https://cartsync-backend.onrender.com
```

You should see the API welcome message.

### 6. Update Frontend Apps

**Dashboard** (`dashboard/.env`):
```env
VITE_API_URL=https://cartsync-backend.onrender.com
VITE_SOCKET_URL=https://cartsync-backend.onrender.com
```

**Mobile App** (`cartSync/src/config/constants.js`):
```javascript
export const API_URL = 'https://cartsync-backend.onrender.com';
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
- Verify DATABASE_URL or individual DB_* variables are set
- Check database is running (should be always on)
- Verify internal database URL (not external) is used

### CORS Errors
- Set `CORS_ORIGIN=*` for testing
- For production, set to your dashboard URL

### Service Keeps Sleeping
- Use cron-job.org to ping every 14 minutes (free)
- Or upgrade to paid plan ($7/month)

## 💰 Cost Comparison

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Render** | ✅ Free forever | $7/month for always-on |
| **Railway** | $5 credit/month | $5-20/month |
| **Heroku** | ❌ No free tier | $7/month |
| **DigitalOcean** | ❌ No free tier | $6/month |
| **AWS** | 12 months free | Complex pricing |

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
