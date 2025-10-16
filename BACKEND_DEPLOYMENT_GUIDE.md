# 🚀 Backend Deployment Guide

This guide will help you deploy your ACT Gen-1 backend to production with HTTPS.

---

## 🎯 Deployment Options

### Option 1: Railway.app (Recommended - Easiest)
**Pros**: Free tier, automatic HTTPS, easy Python deployment, PostgreSQL included  
**Cons**: $5/month after free tier expires  
**Time**: 15-20 minutes

### Option 2: Render.com
**Pros**: Free tier available, automatic HTTPS, good for Python  
**Cons**: Free tier sleeps after inactivity  
**Time**: 20-30 minutes

### Option 3: DigitalOcean App Platform
**Pros**: Reliable, good performance, $5/month  
**Cons**: No free tier, requires payment  
**Time**: 30-40 minutes

### Option 4: Your Own VPS (Advanced)
**Pros**: Full control, can use your domain  
**Cons**: Requires server management skills  
**Time**: 1-2 hours

---

## 🚂 OPTION 1: Deploy to Railway.app (RECOMMENDED)

### Step 1: Prepare Your Backend

1. **Create a `Procfile`** in `apps/api/`:
```bash
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. **Create `railway.json`** in `apps/api/`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

3. **Update `requirements.txt`** to include production dependencies:
```txt
fastapi==0.118.0
uvicorn[standard]==0.37.0
sqlalchemy==2.0.43
sqlmodel==0.0.25
pydantic==2.11.10
pydantic-settings==2.7.0
pyjwt==2.10.1
passlib[argon2]==1.7.4
argon2-cffi==23.1.0
aiosqlite==0.20.0
python-multipart==0.0.20
psycopg2-binary==2.9.10
```

4. **Create `.env.production`** in `apps/api/`:
```bash
# Will be set in Railway dashboard
DATABASE_URL=postgresql://user:pass@host:5432/railway
JWT_SECRET=your-super-secret-key-here-change-this
CORS_ORIGINS=*
```

### Step 2: Deploy to Railway

1. **Sign up for Railway**:
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create a new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository

3. **Configure the service**:
   - Railway will auto-detect Python
   - Set root directory to `apps/api`
   - Click "Deploy"

4. **Add PostgreSQL database**:
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

5. **Set environment variables**:
   - Go to your service → "Variables"
   - Add:
     ```
     JWT_SECRET=<generate-strong-secret>
     CORS_ORIGINS=*
     ```
   - To generate JWT secret:
     ```powershell
     python -c "import secrets; print(secrets.token_urlsafe(32))"
     ```

6. **Get your production URL**:
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - You'll get something like: `https://act-api-production.up.railway.app`

7. **Test your deployment**:
   ```powershell
   Invoke-RestMethod -Uri "https://your-app.up.railway.app/health"
   ```

### Step 3: Update Mobile App

1. **Update `.env`** in `apps/mobile/`:
```bash
EXPO_PUBLIC_API_BASE_URL=https://your-app.up.railway.app
```

2. **Test from mobile app**:
   - Restart Expo dev server
   - Try logging in

---

## 🎨 OPTION 2: Deploy to Render.com

### Step 1: Prepare Your Backend

1. **Create `render.yaml`** in project root:
```yaml
services:
  - type: web
    name: act-api
    env: python
    region: oregon
    buildCommand: pip install -r apps/api/requirements.txt
    startCommand: cd apps/api && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: actdb
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: CORS_ORIGINS
        value: "*"

databases:
  - name: actdb
    databaseName: actgen1
    user: actuser
```

### Step 2: Deploy

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Blueprint"
4. Connect your repository
5. Render will detect `render.yaml` and deploy automatically

---

## 🌊 OPTION 3: DigitalOcean App Platform

### Step 1: Prepare

1. **Create `.do/app.yaml`**:
```yaml
name: act-api
services:
- name: api
  github:
    repo: your-username/act-gen1
    branch: main
    deploy_on_push: true
  source_dir: /apps/api
  run_command: uvicorn main:app --host 0.0.0.0 --port 8080
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DATABASE_URL
    scope: RUN_TIME
    value: ${db.DATABASE_URL}
  - key: JWT_SECRET
    scope: RUN_TIME
    type: SECRET
    value: your-secret-here

databases:
- name: db
  engine: PG
  production: false
```

### Step 2: Deploy

1. Go to https://cloud.digitalocean.com
2. Create new App
3. Connect GitHub
4. Select repository
5. Configure as above
6. Deploy

---

## 🔧 OPTION 4: Your Own VPS (Advanced)

### Requirements
- Ubuntu 22.04 server
- Domain name (e.g., api.act-bitway.uz)
- SSH access

### Step 1: Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Python and dependencies
apt install python3.11 python3.11-venv python3-pip nginx certbot python3-certbot-nginx -y

# Create app user
adduser actapi
su - actapi

# Clone your repository
git clone https://github.com/your-username/act-gen1.git
cd act-gen1/apps/api

# Create virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Create database
sudo -u postgres psql
CREATE DATABASE actgen1;
CREATE USER actuser WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE actgen1 TO actuser;
\q
```

### Step 2: Configure Systemd Service

Create `/etc/systemd/system/actapi.service`:
```ini
[Unit]
Description=ACT Gen-1 API
After=network.target

[Service]
User=actapi
WorkingDirectory=/home/actapi/act-gen1/apps/api
Environment="PATH=/home/actapi/act-gen1/apps/api/.venv/bin"
Environment="DATABASE_URL=postgresql://actuser:your-password@localhost/actgen1"
Environment="JWT_SECRET=your-super-secret-key"
ExecStart=/home/actapi/act-gen1/apps/api/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable actapi
sudo systemctl start actapi
sudo systemctl status actapi
```

### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/actapi`:
```nginx
server {
    listen 80;
    server_name api.act-bitway.uz;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/actapi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Setup SSL with Let's Encrypt

```bash
sudo certbot --nginx -d api.act-bitway.uz
```

---

## ✅ Post-Deployment Checklist

After deploying to any platform:

1. **Test health endpoint**:
```powershell
Invoke-RestMethod -Uri "https://your-production-url/health"
```

2. **Test registration**:
```powershell
$body = @{
    email = "test@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-production-url/auth/register" -Method Post -Body $body -ContentType "application/json"
```

3. **Test login**:
```powershell
$body = @{
    email = "test@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-production-url/auth/login" -Method Post -Body $body -ContentType "application/json"
```

4. **Update mobile app `.env`**:
```bash
EXPO_PUBLIC_API_BASE_URL=https://your-production-url
```

5. **Test from mobile app**

6. **Set up monitoring** (optional but recommended):
   - Railway: Built-in metrics
   - Render: Built-in metrics
   - VPS: Install Prometheus + Grafana

---

## 🔒 Security Hardening

1. **Change JWT secret**:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

2. **Update CORS origins** (after testing):
```python
CORS_ORIGINS=https://your-app-domain.com,https://www.your-app-domain.com
```

3. **Enable rate limiting** (add to `main.py`):
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(...):
    ...
```

4. **Set up database backups**:
   - Railway: Automatic backups
   - Render: Manual backups via dashboard
   - VPS: Set up cron job for pg_dump

---

## 🆘 Troubleshooting

### Issue: "Connection refused"
- Check if service is running
- Check firewall rules
- Verify port is correct

### Issue: "Database connection failed"
- Verify DATABASE_URL is correct
- Check database is running
- Test connection manually

### Issue: "CORS errors"
- Add your domain to CORS_ORIGINS
- Temporarily use "*" for testing

### Issue: "502 Bad Gateway"
- Check if backend service is running
- Check logs for errors
- Verify port configuration

---

## 📊 Monitoring

### Railway
- View logs: Dashboard → Logs
- View metrics: Dashboard → Metrics

### Render
- View logs: Dashboard → Logs
- View metrics: Dashboard → Metrics

### VPS
```bash
# View logs
sudo journalctl -u actapi -f

# Check status
sudo systemctl status actapi

# Restart service
sudo systemctl restart actapi
```

---

## 🎉 Success!

Once deployed:
1. ✅ Backend is on HTTPS
2. ✅ Database is in production
3. ✅ Mobile app can connect
4. ✅ Ready for Play Store submission

**Next**: Follow `FIREBASE_SETUP_GUIDE.md` to configure push notifications.