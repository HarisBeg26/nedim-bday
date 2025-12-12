# 🚀 Deployment Checklist

## Step-by-Step Deployment

### ✅ Step 1: Push to GitHub
```powershell
cd c:\Users\vunja\Desktop\hbday-nembid
git init
git add .
git commit -m "Initial commit - Birthday quiz app"
git branch -M main
git remote add origin https://github.com/HarisBeg26/nedim-bday.git
git push -u origin main
```

### ✅ Step 2: Deploy Backend (Render)
1. Visit: https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect GitHub repo: HarisBeg26/nedim-bday
4. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Environment Variables:
   - `NODE_ENV` = `production`
6. Deploy!
7. **COPY YOUR RENDER URL** (e.g., https://nedim-bday-api.onrender.com)

### ✅ Step 3: Deploy Frontend (Vercel)
1. Visit: https://vercel.com/new
2. Import: HarisBeg26/nedim-bday
3. Settings:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL` = [YOUR RENDER URL FROM STEP 2]
5. Deploy!

### ✅ Step 4: Update CORS
After both deployments:
1. Get your Vercel URL (e.g., https://nedim-bday.vercel.app)
2. Edit `server/index.js` line 9-10:
   ```javascript
   origin: process.env.NODE_ENV === 'production' 
     ? ['https://nedim-bday.vercel.app'] // Replace with YOUR Vercel URL
   ```
3. Commit and push:
   ```powershell
   git add .
   git commit -m "Update CORS for production"
   git push
   ```
4. Render will auto-redeploy

### ✅ Step 5: Test
1. Open your Vercel URL
2. Test Level 1 quiz
3. Test Level 2 barbershop adventure
4. Check browser console for any errors

## Troubleshooting

### Backend not connecting?
- Check VITE_API_URL in Vercel environment variables
- Verify CORS origins in server/index.js
- Check Render logs for errors

### Build failing?
- Make sure all dependencies are in package.json
- Check Node version matches (18+)
- Review build logs for specific errors

### CORS errors?
- Update server/index.js with correct Vercel URL
- Redeploy backend on Render
- Clear browser cache

## Quick Links
- Render Dashboard: https://dashboard.render.com/
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: https://github.com/HarisBeg26/nedim-bday
