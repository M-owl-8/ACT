# Services

This directory contains service modules for the mobile app.

## Sentry Service

The Sentry service provides crash reporting and error tracking functionality.

### Optional Dependency

The `@sentry/react-native` package is **optional**. The app will work without it installed.

- ✅ **Without Sentry**: The app runs normally, Sentry functions are no-ops
- ✅ **With Sentry**: Full crash reporting and error tracking enabled

### Installing Sentry (Optional)

To enable crash reporting, install the Sentry package:

```bash
npm install @sentry/react-native
```

Then configure your Sentry DSN in your environment variables:

```bash
SENTRY_DSN=your-sentry-dsn-here
```

### Usage

The service is automatically initialized in `App.tsx`. All functions gracefully handle the missing package:

```typescript
import { captureException, captureMessage } from './services/sentryService';

// These work whether or not Sentry is installed
captureException(new Error('Something went wrong'));
captureMessage('User completed action', 'info');
```

## Notification Service

The notification service handles push notifications using Expo Notifications.

This service requires `expo-notifications` which is already installed as a dependency.