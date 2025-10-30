# Fix: AsyncPG Missing + SSL Configuration Error

## 🔴 ROOT CAUSE FOUND

The PostgreSQL logs showed repeated errors:
- `invalid length of startup packet`
- `could not accept SSL connection: version too low`
- `received direct SSL connection request without ALPN protocol negotiation extension`

**Why this happened:**

1. **Missing asyncpg driver**: Your `requirements.txt` was missing `asyncpg==0.29.0`
   - Code was using `postgresql+asyncpg://` connection string
   - But asyncpg wasn't installed
   - SQLAlchemy fell back to an incompatible driver
   - This caused malformed connection packets

2. **Improper SSL configuration**: The old code tried to use `ssl: False` in connect_args
   - This parameter doesn't work correctly with asyncpg
   - PostgreSQL 15+ requires proper SSL/ALPN negotiation
   - Result: Connection rejected before auth could even happen

3. **API returns 502**: When registration was attempted:
   - API starts OK (no DB connection needed on startup)
   - Request arrives → tries to query database
   - Database connection fails due to above issues
   - API crashes → returns 502 Bad Gateway

## ✅ FIXES APPLIED

### 1. Added asyncpg to requirements.txt
```
asyncpg==0.29.0
```

### 2. Updated config.py
Added proper SSL disable via connection string parameters:
```python
if "sslmode" not in settings.DATABASE_URL.lower():
    if "?" in settings.DATABASE_URL:
        settings.DATABASE_URL = settings.DATABASE_URL + "&sslmode=disable"
    else:
        settings.DATABASE_URL = settings.DATABASE_URL + "?sslmode=disable"
```

### 3. Cleaned up db.py
Removed the broken `ssl: False` parameter from connect_args:
```python
pool_config = {
    "poolclass": NullPool,
    "connect_args": {
        "server_settings": {
            "application_name": "act_api"
        }
    }
}
```

## 📝 FILES MODIFIED
- `apps/api/requirements.txt` - Added asyncpg
- `apps/api/config.py` - Added sslmode=disable parameter to connection string
- `apps/api/db.py` - Removed broken ssl parameter

## 🚀 DEPLOYMENT STEPS

### Step 1: Rebuild and Redeploy on Railway

```bash
# In Railway dashboard:
# 1. Go to your API service
# 2. Click "Settings" → "Build & Deploy"
# 3. Click "Redeploy"
# OR manually trigger via:

# In local terminal (if using Railway CLI):
railway up
```

### Step 2: Verify the Fix

Test registration:
```bash
# Using the mobile app or curl:
curl -X POST https://act-production-8080.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "recovery_keyword": "MyKeyword",
    "currency": "USD"
  }'
```

Should return `access_token` and `refresh_token` instead of 502.

## 🔍 WHY THIS FIXES THE 502 ERROR

**Before:**
- API starts → OK
- Registration request comes in
- API tries to execute: `INSERT INTO users ...`
- Can't connect to database (SSL/ALPN errors in PostgreSQL logs)
- App exception → 502 error

**After:**
- API starts → OK
- Registration request comes in
- API connects to database using `sslmode=disable` with asyncpg driver
- SQL query executes successfully
- Returns token → 200 OK

## ⚠️ IMPORTANT NOTES

- `sslmode=disable` is safe for **internal Railway connections** (service-to-service)
- Railway network is already isolated and secure
- Never disable SSL for external internet-facing connections
- The connection string will now look like:
  ```
  postgresql+asyncpg://user:password@host:port/database?sslmode=disable
  ```

## 🔧 If You See New Errors After Deploy

Check Railway logs for:
- Connection pool errors → Increase max connections
- Authentication errors → Verify DATABASE_URL env variable
- Query errors → Check database migrations were run

Any remaining issues will now show properly with full error messages instead of generic 502.