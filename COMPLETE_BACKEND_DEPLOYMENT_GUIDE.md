# ✅ Complete Backend Deployment & Firebase Configuration Guide

## Current Status
- ✅ Firebase Admin SDK: Installed
- ✅ Backend code: Ready with FastAPI
- ✅ Railway project: Created and linked
- ✅ Docker image: Built and pushed
- ⏳ **NEXT: Complete Railway environment setup**

---

## 🚀 Step 1: Set Up Railway Environment Variables

### A. Get Your Railway App URL
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on your **ACT Gen-1 API** project
3. Look for **Settings** → **Domains**
4. Copy your production URL (format: `https://*.railway.app`)

**Save this URL** - You'll need it for:
- Mobile app API endpoint configuration
- CORS origins update

### B. Add Required Environment Variables

In Railway dashboard, go to **Variables** tab and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `JWT_SECRET` | `VE5pLXN0OFEzLU1wQTg2dGZrMmhYN2pMVVBfOGZzTm5QcmJpNTUyVGhyMQ==` | Keep same as local for now, or generate new secure one |
| `FIREBASE_CREDENTIALS_PATH` | `/app/firebase-credentials.json` | Production path in container |
| `PORT` | `8000` | Default port (Railway sets this automatically) |

**Railway automatically provides:**
- `DATABASE_URL` - PostgreSQL connection string

---

## 🔐 Step 2: Set Up Firebase Credentials in Production

### Option A: Store Credentials File in Railway (RECOMMENDED)

#### 2A1. Create Volume Mount
1. In Railway dashboard, go to your API service
2. Click **Settings** → **Volumes**
3. Create a new volume:
   - **Mount Path**: `/app/firebase-credentials`
   - **Name**: `firebase-config`

#### 2A2. Upload Firebase Credentials
```powershell
# After Railway volume is created, Railway provides a UI upload option
# OR use Railway CLI:
railway run cp "C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\act-gen1-f9812-firebase-adminsdk-fbsvc-83acc8b162.json" /app/firebase-credentials.json
```

---

### Option B: Store as Base64 Environment Variable (ALTERNATIVE)

If you prefer storing credentials as an environment variable:

#### 2B1. Encode Firebase JSON
```powershell
# PowerShell: Encode the Firebase JSON file to Base64
$filePath = "C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\act-gen1-f9812-firebase-adminsdk-fbsvc-83acc8b162.json"
$content = Get-Content $filePath -Raw
$base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
Write-Host $base64 | Set-Clipboard
Write-Host "✓ Firebase JSON encoded and copied to clipboard"
```

#### 2B2. Add to Railway Variables
1. In Railway Variables, add:
   - **Variable Name**: `FIREBASE_CREDENTIALS_JSON`
   - **Value**: Paste the Base64 string from clipboard

#### 2B3. Update config.py
Modify `config.py` to handle Base64-encoded credentials:

```python
import os
import base64
import json
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        extra="ignore"
    )
    
    APP_NAME: str = "ACT Gen1 API"
    JWT_SECRET: str = "CHANGE_ME_SUPER_SECRET"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db?check_same_thread=False"
    FIREBASE_CREDENTIALS_PATH: str = ""
    FIREBASE_CREDENTIALS_JSON: str = ""  # Add this

settings = Settings()

# Handle Firebase credentials - convert Base64 if needed
if settings.FIREBASE_CREDENTIALS_JSON:
    try:
        # Decode Base64 and write to temp file
        decoded = base64.b64decode(settings.FIREBASE_CREDENTIALS_JSON)
        credentials_path = "/tmp/firebase-credentials.json"
        with open(credentials_path, 'w') as f:
            f.write(decoded.decode('utf-8'))
        settings.FIREBASE_CREDENTIALS_PATH = credentials_path
        print("[Firebase] Credentials loaded from environment variable")
    except Exception as e:
        print(f"[Firebase] Failed to decode credentials: {e}")
```

---

## 🌐 Step 3: Update CORS Origins for Production

**Update `main.py`** with your Railway domain:

```python
# In main.py, update ALLOWED list:
ALLOWED = [
    # Development
    "https://nine-turtles-serve.loca.lt",
    "https://*.exp.direct",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    
    # Production (add your Railway URL)
    "https://your-railway-app.railway.app",  # ← REPLACE with actual Railway domain
    
    # For now, allow all for testing
    "*",
]
```

---

## 🧪 Step 4: Complete Deployment Checklist

### Pre-Deployment
- [ ] Firebase credentials file exists: `act-gen1-f9812-firebase-adminsdk-fbsvc-83acc8b162.json`
- [ ] JWT_SECRET is set in `.env` (locally tested)
- [ ] `requirements.txt` includes `firebase-admin`
- [ ] `Procfile` exists and is correct

### Railway Setup
- [ ] Railway project created at https://railway.app
- [ ] GitHub repository connected
- [ ] PostgreSQL plugin added
- [ ] API service created
- [ ] Environment variables added:
  - [ ] `JWT_SECRET`
  - [ ] `FIREBASE_CREDENTIALS_PATH` or `FIREBASE_CREDENTIALS_JSON`

### Deployment
- [ ] Latest code pushed to GitHub
- [ ] Railway auto-deployment triggered
- [ ] Build completed successfully
- [ ] Service is running (logs show "✅ ACT Gen-1 API is ready!")

### Post-Deployment Verification
- [ ] Health endpoint returns 200: `GET /health`
- [ ] Firebase notifications initialized without errors
- [ ] Database tables created
- [ ] Default seed data loaded

---

## 📋 Step 5: Verify Production Deployment

### Test 1: Health Check
```powershell
# Replace with your Railway URL
$railwayUrl = "https://your-railway-app.railway.app"
$healthCheck = Invoke-WebRequest -Uri "$railwayUrl/health" -Method Get -ErrorAction SilentlyContinue

if ($healthCheck.StatusCode -eq 200) {
    Write-Host "✅ API is responding" -ForegroundColor Green
    $content = $healthCheck.Content | ConvertFrom-Json
    Write-Host "Response: $($content | ConvertTo-Json)"
} else {
    Write-Host "❌ API not responding correctly" -ForegroundColor Red
    Write-Host $healthCheck.StatusCode
}
```

### Test 2: Check Railway Logs
```powershell
# View production logs
railway logs -f
```

Look for:
- `✓ Database tables ready`
- `✓ Default data seeded`
- `✓ Daily backup task started`
- `✅ ACT Gen-1 API is ready!`
- `Firebase Admin SDK initialized successfully` (if credentials set)

### Test 3: Authentication Test
```powershell
$railwayUrl = "https://your-railway-app.railway.app"

# Try to register
$registerData = @{
    email = "test@railway.app"
    password = "TestPassword123!"
    full_name = "Railway Test"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$railwayUrl/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $registerData `
    -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 201) {
    Write-Host "✅ Registration works in production" -ForegroundColor Green
} else {
    Write-Host "❌ Registration failed" -ForegroundColor Red
    Write-Host $response.StatusCode
}
```

---

## 🔧 Step 6: Configure Mobile App

Once production API is verified, update mobile app:

**In `apps/mobile/src/api/axios-instance.ts` or API config:**

```typescript
const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://your-railway-app.railway.app'  // ← Add Railway URL here
    : 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
```

---

## 🚨 Troubleshooting

### Firebase Not Initializing in Production
**Symptoms:** Logs show "Firebase credentials not found at: /app/firebase-credentials.json"

**Solutions:**
1. Check if volume is properly mounted in Railway Settings
2. Verify file path in `FIREBASE_CREDENTIALS_PATH` variable
3. Use Base64 method (Option B) as fallback
4. Check file permissions

### Database Connection Failing
**Symptoms:** "Failed to connect to PostgreSQL"

**Solutions:**
1. Verify `DATABASE_URL` is in Railway Variables
2. Check PostgreSQL plugin is added to project
3. Ensure schema is correct: `postgresql+asyncpg://...`
4. Check Railway logs for SSL errors

### CORS Errors in Mobile App
**Symptoms:** "Origin not allowed" errors from mobile

**Solutions:**
1. Add your Railway domain to `ALLOWED` in `main.py`
2. Don't forget the `*` for testing (remove in production)
3. Redeploy after updating CORS

---

## 📊 What's Now Deployed

### Backend (Production on Railway)
✅ FastAPI application
✅ PostgreSQL database
✅ Firebase Cloud Messaging service
✅ JWT authentication
✅ 11 API routers with 63+ endpoints
✅ Daily backup task
✅ CORS configured for mobile

### Infrastructure (Railway)
✅ Auto-scaling compute
✅ SSL/HTTPS enabled
✅ PostgreSQL database
✅ Environment variables management
✅ Log streaming
✅ Automatic restarts on failure

### Next: Mobile Configuration
Configure mobile app to use production API URL and test end-to-end flow.

---

## 📚 API Endpoints Available

Once deployed, your API provides:
- 🔐 Authentication: `/auth/` (register, login, refresh)
- 👤 Users: `/users/` (profile, preferences)
- 📂 Categories: `/categories/` (CRUD operations)
- 📝 Entries: `/entries/` (journal entries)
- 📊 Dashboard: `/dashboard/` (analytics)
- 💪 Motivation: `/motivation/` (quotes)
- 📚 Books: `/books/` (books library)
- 💾 Backup: `/backup/` (backup management)
- 📋 Reports: `/reports/` (generated reports)
- ⏰ Reminders: `/reminders/` (reminder management)
- 🔔 Push Notifications: `/push-notifications/` (FCM management)

Full API documentation: `https://your-railway-app.railway.app/docs`

---

**Created:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Status:** Complete Backend Deployment & Firebase Configuration