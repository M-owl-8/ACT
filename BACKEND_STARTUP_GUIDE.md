# 🚀 Backend Startup Guide

## Quick Start - RUN BACKEND IN 2 MINUTES

### Option 1: Using PowerShell Script (Recommended - Windows)
```powershell
# Navigate to project root
cd c:\work\act-gen1

# Run the startup script
.\RUN_BACKEND.ps1
```

The script will:
- ✅ Navigate to API directory
- ✅ Create virtual environment (if needed)
- ✅ Activate virtual environment
- ✅ Install dependencies
- ✅ Start the server

### Option 2: Manual Command Line

#### Step 1: Navigate to API Directory
```powershell
cd c:\work\act-gen1\apps\api
```

#### Step 2: Create/Activate Virtual Environment
```powershell
# Create venv (first time only)
python -m venv venv

# Activate venv
.\venv\Scripts\activate
```

**On macOS/Linux:**
```bash
# Create venv (first time only)
python3 -m venv venv

# Activate venv
source venv/bin/activate
```

#### Step 3: Install Dependencies
```powershell
pip install -r requirements.txt
```

#### Step 4: Start the Server
```powershell
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📍 Access Points

Once the server is running:

| Endpoint | URL | Purpose |
|----------|-----|---------|
| **API Docs** | http://localhost:8000/docs | Interactive API documentation (Swagger) |
| **ReDoc** | http://localhost:8000/redoc | Alternative API documentation |
| **Health Check** | http://localhost:8000/health | API health status |
| **API Base** | http://localhost:8000 | Base API endpoint |

---

## 🔧 Development Configuration

### Environment Variables (.env)
The backend reads from `.env` file in `apps/api/` directory.

Current defaults:
```env
DATABASE_URL=sqlite+aiosqlite:///./dev.db
JWT_SECRET=CHANGE_ME_SUPER_SECRET
JWT_ALG=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=14
```

### For Production
Create `.env.production`:
```env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
JWT_SECRET=your-very-long-secret-key-change-this
FIREBASE_CREDENTIALS_JSON=base64-encoded-json
```

---

## 📝 Useful Commands

### Check Python Version
```powershell
python --version
```
Expected: Python 3.11 or higher

### List Installed Dependencies
```powershell
pip list
```

### Update Dependencies
```powershell
pip install --upgrade -r requirements.txt
```

### Run Without Reload (Production)
```powershell
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Run Tests (when available)
```powershell
pytest
```

### Create Database Backups
```powershell
python backup_service.py
```

---

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'fastapi'"
**Solution**: Make sure venv is activated
```powershell
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: "Port 8000 already in use"
**Solution**: Either close the app using port 8000 or use a different port
```powershell
python -m uvicorn main:app --port 8001
```

### Issue: Database locked error
**Solution**: SQLite lock issue, usually resolves itself. If persistent:
```powershell
# Delete dev.db to start fresh
Remove-Item dev.db
# Restart server (will recreate db)
```

### Issue: CORS errors when connecting from mobile
**Solution**: Check that mobile API_BASE_URL matches your machine IP
```
Mobile .env:
EXPO_PUBLIC_API_BASE_URL=http://YOUR_MACHINE_IP:8000
```

Get your machine IP:
```powershell
ipconfig | findstr "IPv4"
```

---

## 📊 API Endpoints Overview

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/revoke` - Logout

### Users & Profile
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update profile
- `POST /users/me/settings` - Update settings

### Financial Data
- `GET /entries` - Get all transactions
- `POST /entries` - Create transaction
- `PUT /entries/{id}` - Update transaction
- `DELETE /entries/{id}` - Delete transaction

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create category
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Reports & Analytics
- `GET /dashboard` - Get dashboard summary
- `GET /reports/monthly` - Get monthly report
- `GET /reports/categories` - Get category breakdown

### Additional Features
- `GET /books` - Get available books
- `GET /motivation` - Get motivation data
- `GET /reminders` - Get upcoming reminders
- `POST /push-notifications/register` - Register device for notifications

See full documentation at: http://localhost:8000/docs

---

## 🔐 Security Notes

⚠️ **WARNING**: The default `JWT_SECRET` is insecure!

For development:
- Current setup is fine for local development
- SQLite database is temporary

For production:
- Generate a strong JWT_SECRET: 
  ```powershell
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- Use PostgreSQL instead of SQLite
- Enable HTTPS
- Set environment variables securely
- Use strong authentication keys

---

## 📱 Connecting Mobile App

Once backend is running:

1. Find your machine IP:
   ```powershell
   ipconfig | findstr "IPv4"
   ```

2. Update mobile app `.env`:
   ```
   EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8000
   ```
   (Replace 192.168.x.x with your actual IP)

3. Restart mobile app
   - Press `r` in terminal
   - Or kill and restart: `npm start`

4. Try logging in or registering

---

## ✅ Verification Checklist

After starting the server, verify:

- [ ] Terminal shows "Uvicorn running on http://0.0.0.0:8000"
- [ ] Can access http://localhost:8000/docs (Swagger UI)
- [ ] Can access http://localhost:8000/health (returns `{"status": "ok", ...}`)
- [ ] Database tables created (check dev.db exists)
- [ ] Can see "✓ Database tables ready" in console
- [ ] Can see "✓ Default data seeded" in console

---

## 📚 Next Steps

1. **Test in Postman/Insomnia**
   - Download and test API endpoints
   - Create test requests

2. **Connect Mobile App**
   - Update mobile .env with backend IP
   - Run mobile app
   - Test login/register flow

3. **Explore API Docs**
   - Visit http://localhost:8000/docs
   - Try out endpoints in Swagger UI
   - Read endpoint descriptions

4. **Check Backend Code**
   - Review routers/ directory
   - Understand database schema (db.py)
   - Check authentication flow (security.py)

---

## 🆘 Need Help?

Check these files for more info:
- `README.md` - Project overview
- `apps/api/main.py` - Server entry point
- `apps/api/config.py` - Configuration management
- `apps/api/routers/` - API endpoint implementations

---

**Happy coding! 🚀**