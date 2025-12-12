# Nedim Birthday Quiz 🎂🧮

Interactive birthday quiz with mathematical challenges and a Bosnian barbershop adventure!

## Project Structure

- **client/** - Vue.js frontend (Vite + TypeScript)
- **server/** - Express.js backend (Node.js)

## Deployment Guide

### 1. Push to GitHub

```bash
cd c:\Users\vunja\Desktop\hbday-nembid
git init
git add .
git commit -m "Initial commit - Birthday quiz app"
git branch -M main
git remote add origin https://github.com/HarisBeg26/nedim-bday.git
git push -u origin main
```

### 2. Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `HarisBeg26/nedim-bday`
4. Configure:
   - **Name**: `nedim-bday-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Add Environment Variables:
   - `NODE_ENV` = `production`
6. Click **"Create Web Service"**
7. Wait for deployment (will get URL like: `https://nedim-bday-api.onrender.com`)

### 3. Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import `HarisBeg26/nedim-bday` from GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://nedim-bday-api.onrender.com` (your Render URL)
6. Click **"Deploy"**
7. Your app will be live at: `https://your-project-name.vercel.app`

### 4. Update CORS (Important!)

After deployment, update the backend CORS origins:

1. Edit `server/index.js` line 9:
   ```javascript
   origin: process.env.NODE_ENV === 'production' 
     ? ['https://your-actual-vercel-url.vercel.app'] 
     : '*',
   ```
2. Commit and push changes
3. Render will auto-redeploy

## Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

2. **Run Backend:**
   ```bash
   cd server
   npm start
   # Server runs on http://localhost:3000
   ```

3. **Run Frontend:**
   ```bash
   cd client
   npm run dev
   # App runs on http://localhost:5173
   ```

## Features

- 🧮 **Level 1**: Advanced mathematical assessment (calculus, differential equations, complex analysis)
- 💈 **Level 2**: Bosnian barbershop adventure with Aldin
- ⏱️ Timer with auto-reset
- 🎨 Modern UI with PrimeVue + Tailwind CSS
- 📱 Responsive chat interface

## Tech Stack

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Vite
- PrimeVue
- Tailwind CSS
- Pinia

### Backend
- Node.js
- Express.js
- CORS enabled

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.onrender.com
```

### Backend (Render Environment Variables)
```
NODE_ENV=production
PORT=3000 (auto-set by Render)
```

## License

MIT
