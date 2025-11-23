# 🚀 Complete Deployment Guide - CartSync

Deploy your entire CartSync application for **100% FREE** using these services.

## 📦 What We're Deploying

1. **Backend** (Node.js + PostgreSQL) → **Render.com**
2. **Dashboard** (React/Vite) → **Vercel.com**
3. **Mobile App** (React Native) → Update config only

## 🎯 Quick Start (30 Minutes Total)

### ✅ Prerequisites

- [x] GitHub account
- [x] Code pushed to GitHub
- [x] 30 minutes of time

---

## 🔴 Step 1: Deploy Backend to Render (15 minutes)

### Create Account

1. Go to https://render.com
2. Sign up with GitHub

### Deploy PostgreSQL Database

1. Click **New +** → **PostgreSQL**
2. Configure:
   - Name: `cartsync-db`
   - Database: `cartsync`
   - User: `cartsync`
   - Region: Choose closest to you
   - Plan: **Free**
3. Click **Create Database**
4. Wait 2 minutes
5. **Copy the Internal Database URL** (starts with `postgresql://`)

### Deploy Backend with Docker

1. Click **New +** → **Web Service**
2. Connect your GitHub repository: `farhanMeows/khatakhat-cart-app-deployed`
3. Configure:
   - Name: `cartsync-backend`
   - Region: Same as database
   - Branch: `main`
   - Root Directory: `backend`
   - Environment: **Docker**
   - Plan: **Free**
4. **Environment Variables** (click Advanced → Add Environment Variable):
   ```
   NODE_ENV=production
   PORT=5001
   DATABASE_URL=<paste your Internal Database URL>
   ADMIN_PASSWORD=your-secure-password-here
   CORS_ORIGIN=*
   ```
5. Click **Create Web Service**
6. Wait 10-15 minutes ☕ (first Docker build takes time)

### Get Your Backend URL

After deployment:

```
https://cartsync-backend.onrender.com
```

**⚠️ SAVE THIS URL - you'll need it for dashboard and mobile app!**

### Test Backend

```bash
curl https://cartsync-backend.onrender.com
# Should return: {"message":"CartSync API is running"}
```

---

## 🔵 Step 2: Deploy Dashboard to Vercel (10 minutes)

### Create Account

1. Go to https://vercel.com
2. Sign up with GitHub

### Deploy Dashboard

1. **New Project** → **Import Repository**
2. Select: `Khatakhat/khatakhat-cart-app`
3. Configure:
   ```
   Project Name: cartsync-dashboard
   Framework: Vite
   Root Directory: dashboard
   ```
4. **Environment Variables**:
   ```
   VITE_API_URL=https://cartsync-backend.onrender.com
   VITE_SOCKET_URL=https://cartsync-backend.onrender.com
   ```
   (Replace with YOUR backend URL from Step 1!)
5. Click **Deploy**
6. Wait 3 minutes ☕

### Get Your Dashboard URL

After deployment:

```
https://cartsync-dashboard.vercel.app
```

### Update Backend CORS

Go back to Render → Backend → Environment Variables → Add:

```
CORS_ORIGIN=https://cartsync-dashboard.vercel.app
```

Click "Save" → Redeploy

---

## 📱 Step 3: Update Mobile App Config (5 minutes)

### Update API URL

Edit `cartSync/src/config/constants.js`:

```javascript
// For Real Device (Production)
export const API_URL = "https://cartsync-backend.onrender.com";
export const SOCKET_URL = API_URL;

// For development, comment out above and use:
// export const API_URL = 'http://192.168.1.XXX:5001';
```

### Rebuild App

```bash
cd cartSync
npx react-native run-android
# or
npx react-native run-ios
```

---

## 🎉 You're Live!

Your complete system:

| Component      | URL                                   | Status  |
| -------------- | ------------------------------------- | ------- |
| **Backend**    | https://cartsync-backend.onrender.com | ✅ Live |
| **Dashboard**  | https://cartsync-dashboard.vercel.app | ✅ Live |
| **Database**   | PostgreSQL on Render                  | ✅ Live |
| **Mobile App** | Connects to production backend        | ✅ Live |

---

## 🔄 Future Updates

### Backend Updates

```bash
cd backend
# Make changes
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys!
```

### Dashboard Updates

```bash
cd dashboard
# Make changes
git add .
git commit -m "Update dashboard"
git push origin main
# Vercel auto-deploys!
```

### Mobile App Updates

```bash
cd cartSync
# Make changes
npx react-native run-android
```

---

## 💰 Cost Breakdown

| Service                 | Free Tier    | Limitations                   |
| ----------------------- | ------------ | ----------------------------- |
| **Render (Backend)**    | FREE forever | Sleeps after 15min inactivity |
| **Render (PostgreSQL)** | FREE forever | 1GB storage                   |
| **Vercel (Dashboard)**  | FREE forever | 100GB bandwidth/month         |
| **Total Cost**          | **$0/month** | Perfect for testing!          |

### Want No Sleep Mode?

- Render Paid: $7/month (always on)
- Or use free cron job to ping every 14 minutes

---

## 🐛 Troubleshooting

### Backend Issues

❌ **Build Failed**

- Check logs in Render dashboard
- Verify `package.json` is correct
- Test `npm install && npm start` locally

❌ **Database Connection Failed**

- Verify `DATABASE_URL` is set in Render
- Check database service is running

❌ **API Not Responding**

- Service might be sleeping (wait 30s)
- Check logs in Render
- Verify PORT is set to 5001

### Dashboard Issues

❌ **Build Failed**

- Test `npm run build` locally
- Check Vercel build logs
- Verify all dependencies in `package.json`

❌ **Can't Connect to Backend**

- Verify `VITE_API_URL` in Vercel environment variables
- Check backend CORS allows dashboard URL
- Open browser console for errors

❌ **Map Not Loading**

- Check browser console
- Verify Leaflet tiles loading
- Check network tab

### Mobile App Issues

❌ **Can't Connect to Backend**

- Verify API_URL is correct in `constants.js`
- Check phone has internet connection
- Try ping backend from browser on phone

❌ **Location Not Updating**

- Check location permissions (Always)
- Verify background service is running
- Check backend logs for location updates

---

## 📊 Monitoring

### Backend (Render)

- View logs: Render Dashboard → Logs
- Monitor CPU/Memory: Render Dashboard → Metrics
- Database size: PostgreSQL Dashboard

### Dashboard (Vercel)

- Analytics: Vercel Dashboard → Analytics
- Logs: Vercel Dashboard → Deployments → Logs
- Performance: Vercel Analytics

---

## 🔐 Security Checklist

Before sharing with users:

- [ ] Set strong `JWT_SECRET` in backend
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Update `CORS_ORIGIN` to dashboard URL (not \*)
- [ ] Enable HTTPS (automatic on Render & Vercel)
- [ ] Review database access permissions
- [ ] Set up error monitoring (Sentry)
- [ ] Create privacy policy
- [ ] Test with multiple devices

---

## 🎯 Next Steps

### For Testing (Current Setup)

✅ You're ready to test!

- Share dashboard URL with team
- Install mobile app on test devices
- Create test carts
- Monitor location tracking

### For Production

- [ ] Add custom domain to dashboard
- [ ] Upgrade Render to paid ($7/month) for no sleep
- [ ] Set up error monitoring
- [ ] Add analytics
- [ ] Create user documentation
- [ ] Submit mobile app to Play Store/App Store

---

## 📚 Detailed Guides

- **Backend Deployment**: See [`backend/DEPLOYMENT.md`](backend/DEPLOYMENT.md)
- **Dashboard Deployment**: See [`dashboard/DEPLOYMENT.md`](dashboard/DEPLOYMENT.md)
- **General Setup**: See [`README.md`](README.md)

---

## 🆘 Need Help?

1. **Backend Issues**: Check `backend/DEPLOYMENT.md`
2. **Dashboard Issues**: Check `dashboard/DEPLOYMENT.md`
3. **Database Issues**: Check Render PostgreSQL logs
4. **Mobile Issues**: Check React Native logs

---

## 🎊 Success!

You've deployed a complete real-time tracking system for FREE!

**Share your links:**

- Dashboard: `https://cartsync-dashboard.vercel.app`
- API: `https://cartsync-backend.onrender.com`

Happy tracking! 🚀📍
