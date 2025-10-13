# 🚀 Mission 5 - Deployment Guide

**Feature**: Reports with Excess Alert  
**Version**: 1.0.0  
**Status**: Ready for Production  

---

## 📋 Pre-Deployment Checklist

### Code Review
- [x] Backend code reviewed and approved
- [x] Mobile code reviewed and approved
- [x] No console.log or debug statements
- [x] No hardcoded credentials
- [x] Error handling comprehensive
- [x] Type safety verified

### Testing
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Performance tested
- [ ] Security tested

### Documentation
- [x] API documentation complete
- [x] User guide created
- [x] Testing guide provided
- [x] Deployment guide (this file)
- [x] Code comments adequate

### Dependencies
- [ ] All dependencies installed
- [ ] No security vulnerabilities
- [ ] Versions locked in requirements/package.json
- [ ] Compatible with production environment

---

## 🔧 Backend Deployment

### 1. Environment Setup

#### Production Environment Variables
Create `.env.production` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
SECRET_KEY=your-production-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=production

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

#### Install Dependencies
```bash
cd apps/api
pip install -r requirements.txt
```

### 2. Database Migration

#### Run Migrations
```bash
# If using Alembic
alembic upgrade head

# Or manually ensure tables exist
python -c "from db import init_db; init_db()"
```

#### Verify Database
```bash
# Check tables exist
psql $DATABASE_URL -c "\dt"

# Verify indexes
psql $DATABASE_URL -c "\di"
```

### 3. Backend Deployment Options

#### Option A: Docker Deployment

**Dockerfile** (create if not exists):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and Run**:
```bash
docker build -t act-gen1-api .
docker run -d -p 8000:8000 --env-file .env.production act-gen1-api
```

#### Option B: Systemd Service

**Create service file** `/etc/systemd/system/act-gen1-api.service`:
```ini
[Unit]
Description=ACT Gen-1 API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/act-gen1/apps/api
Environment="PATH=/var/www/act-gen1/venv/bin"
EnvironmentFile=/var/www/act-gen1/apps/api/.env.production
ExecStart=/var/www/act-gen1/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

**Enable and start**:
```bash
sudo systemctl enable act-gen1-api
sudo systemctl start act-gen1-api
sudo systemctl status act-gen1-api
```

#### Option C: Cloud Platform (AWS/GCP/Azure)

**AWS Elastic Beanstalk**:
```bash
eb init -p python-3.11 act-gen1-api
eb create production-env
eb deploy
```

**Google Cloud Run**:
```bash
gcloud run deploy act-gen1-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 4. Nginx Configuration

**Create nginx config** `/etc/nginx/sites-available/act-gen1-api`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable and reload**:
```bash
sudo ln -s /etc/nginx/sites-available/act-gen1-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL Certificate

**Using Let's Encrypt**:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

### 6. Verify Backend Deployment

```bash
# Health check
curl https://api.yourdomain.com/health

# Test reports endpoint
curl https://api.yourdomain.com/reports/summary?range=month \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Mobile Deployment

### 1. Environment Configuration

#### Production API URL
Update `apps/mobile/src/api/client.ts`:

```typescript
const API_URL = __DEV__ 
  ? 'http://localhost:8000'
  : 'https://api.yourdomain.com';
```

Or use environment variables:

**Create `.env.production`**:
```bash
API_URL=https://api.yourdomain.com
```

### 2. Build Configuration

#### Update `app.json`:
```json
{
  "expo": {
    "name": "ACT Gen-1",
    "slug": "act-gen1",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourdomain.actgen1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourdomain.actgen1"
    },
    "extra": {
      "apiUrl": "https://api.yourdomain.com"
    }
  }
}
```

### 3. iOS Deployment

#### Build for iOS
```bash
cd apps/mobile

# Install dependencies
npm install

# Build for iOS
eas build --platform ios --profile production

# Or using Expo
expo build:ios
```

#### Submit to App Store
```bash
eas submit --platform ios
```

#### Manual Submission
1. Download IPA from Expo
2. Open Xcode
3. Open Organizer (Window > Organizer)
4. Upload to App Store Connect
5. Submit for review

### 4. Android Deployment

#### Build for Android
```bash
cd apps/mobile

# Build for Android
eas build --platform android --profile production

# Or using Expo
expo build:android
```

#### Submit to Google Play
```bash
eas submit --platform android
```

#### Manual Submission
1. Download APK/AAB from Expo
2. Go to Google Play Console
3. Create new release
4. Upload APK/AAB
5. Submit for review

### 5. Over-the-Air (OTA) Updates

#### Configure EAS Update
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure updates
eas update:configure

# Publish update
eas update --branch production --message "Mission 5: Reports feature"
```

---

## 🔍 Post-Deployment Verification

### Backend Verification

#### 1. API Health Check
```bash
curl https://api.yourdomain.com/health
# Expected: {"status": "healthy"}
```

#### 2. Reports Endpoint
```bash
# Test all ranges
for range in day week 15d month last3m; do
  echo "Testing range: $range"
  curl "https://api.yourdomain.com/reports/summary?range=$range" \
    -H "Authorization: Bearer $TOKEN"
done
```

#### 3. Database Connection
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM entries;"
```

#### 4. Performance Check
```bash
# Measure response time
time curl "https://api.yourdomain.com/reports/summary?range=month" \
  -H "Authorization: Bearer $TOKEN"
# Expected: < 2 seconds
```

### Mobile Verification

#### 1. App Launch
- [ ] App launches without crashes
- [ ] Login screen appears
- [ ] Can login successfully
- [ ] Main tabs load correctly

#### 2. Reports Feature
- [ ] Reports tab is visible
- [ ] Tapping Reports tab navigates correctly
- [ ] All 5 tabs are present
- [ ] Data loads successfully
- [ ] Charts render correctly
- [ ] Alert banner works (if applicable)

#### 3. API Integration
- [ ] Mobile app connects to production API
- [ ] Authentication works
- [ ] Data fetches successfully
- [ ] Error handling works

#### 4. Performance
- [ ] App is responsive
- [ ] No lag or freezing
- [ ] Smooth animations
- [ ] Fast data loading

---

## 📊 Monitoring Setup

### Backend Monitoring

#### 1. Application Monitoring

**Using Sentry**:
```python
# In main.py
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment="production",
    traces_sample_rate=1.0,
)
```

**Using New Relic**:
```bash
pip install newrelic
newrelic-admin run-program uvicorn main:app
```

#### 2. Log Monitoring

**Configure logging**:
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/act-gen1/api.log'),
        logging.StreamHandler()
    ]
)
```

**Using CloudWatch (AWS)**:
```bash
# Install CloudWatch agent
sudo yum install amazon-cloudwatch-agent

# Configure log streaming
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```

#### 3. Performance Monitoring

**Add metrics endpoint**:
```python
from prometheus_client import Counter, Histogram, generate_latest

request_count = Counter('api_requests_total', 'Total API requests')
request_duration = Histogram('api_request_duration_seconds', 'Request duration')

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Mobile Monitoring

#### 1. Crash Reporting

**Using Sentry**:
```typescript
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'your-sentry-dsn',
  enableInExpoDevelopment: false,
  debug: false,
});
```

#### 2. Analytics

**Using Firebase Analytics**:
```typescript
import analytics from '@react-native-firebase/analytics';

// Track screen view
await analytics().logScreenView({
  screen_name: 'Reports',
  screen_class: 'ReportsScreen',
});

// Track events
await analytics().logEvent('report_viewed', {
  range: 'month',
});
```

---

## 🔐 Security Checklist

### Backend Security
- [ ] HTTPS enabled with valid SSL certificate
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SQL injection protection (using ORM)
- [ ] Authentication required for all endpoints
- [ ] Sensitive data encrypted
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] API keys not exposed

### Mobile Security
- [ ] API URL uses HTTPS
- [ ] Tokens stored securely (AsyncStorage encrypted)
- [ ] No sensitive data in logs
- [ ] Certificate pinning (optional)
- [ ] Biometric authentication (optional)
- [ ] App obfuscation enabled

---

## 🔄 Rollback Plan

### Backend Rollback

#### Option 1: Docker
```bash
# List previous images
docker images act-gen1-api

# Rollback to previous version
docker stop act-gen1-api
docker run -d -p 8000:8000 act-gen1-api:previous-tag
```

#### Option 2: Git
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Redeploy
./deploy.sh
```

#### Option 3: Systemd
```bash
# Stop service
sudo systemctl stop act-gen1-api

# Restore previous version
cd /var/www/act-gen1
git checkout previous-tag

# Restart service
sudo systemctl start act-gen1-api
```

### Mobile Rollback

#### OTA Update Rollback
```bash
# Publish previous version
eas update --branch production --message "Rollback to previous version"
```

#### App Store Rollback
1. Go to App Store Connect
2. Select previous version
3. Submit for expedited review
4. Explain critical bug

---

## 📈 Performance Optimization

### Backend Optimization

#### 1. Database Indexing
```sql
-- Add indexes for reports queries
CREATE INDEX idx_entries_user_booked ON entries(user_id, booked_at);
CREATE INDEX idx_entries_type ON entries(type);
CREATE INDEX idx_categories_expense_type ON categories(expense_type);
```

#### 2. Query Optimization
```python
# Use select_related and prefetch_related
entries = await session.execute(
    select(Entry)
    .options(selectinload(Entry.category))
    .filter(Entry.user_id == user_id)
)
```

#### 3. Caching
```python
from functools import lru_cache
from datetime import datetime, timedelta

@lru_cache(maxsize=128)
def get_cached_report(user_id: int, range: str, cache_key: str):
    # Cache report data for 5 minutes
    pass
```

#### 4. Connection Pooling
```python
# In db.py
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)
```

### Mobile Optimization

#### 1. Data Caching
```typescript
// Cache report data
import AsyncStorage from '@react-native-async-storage/async-storage';

const cacheReport = async (range: string, data: ReportData) => {
  await AsyncStorage.setItem(
    `report_${range}`,
    JSON.stringify({ data, timestamp: Date.now() })
  );
};
```

#### 2. Image Optimization
```typescript
// Use optimized images
<Image 
  source={require('./icon.png')} 
  resizeMode="contain"
  style={{ width: 24, height: 24 }}
/>
```

#### 3. Lazy Loading
```typescript
// Lazy load screens
const ReportsScreen = React.lazy(() => import('./screens/ReportsScreen'));
```

---

## 📞 Support & Maintenance

### Monitoring Alerts

#### Set up alerts for:
- [ ] API response time > 2 seconds
- [ ] Error rate > 1%
- [ ] Database connection failures
- [ ] High memory usage (> 80%)
- [ ] High CPU usage (> 80%)
- [ ] Disk space low (< 20%)

### Regular Maintenance

#### Daily
- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Review crash reports

#### Weekly
- [ ] Review performance metrics
- [ ] Check database size
- [ ] Update dependencies (if needed)

#### Monthly
- [ ] Security audit
- [ ] Performance optimization review
- [ ] User feedback review
- [ ] Feature usage analysis

---

## 🎉 Deployment Complete!

### Post-Deployment Tasks

- [ ] Announce feature to users
- [ ] Update user documentation
- [ ] Monitor for issues
- [ ] Gather user feedback
- [ ] Plan next iteration

### Success Metrics

Track these metrics:
- **Adoption Rate**: % of users accessing Reports
- **Usage Frequency**: How often users check reports
- **Alert Triggers**: How often excess alert is triggered
- **Performance**: Average response time
- **Errors**: Error rate and types

---

**Deployment Guide Complete! 🚀**

*Mission 5 is now live in production!*