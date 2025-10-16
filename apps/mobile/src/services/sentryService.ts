/**
 * Sentry Crash Reporting Service
 * 
 * Captures and reports crashes, errors, and performance issues
 * to Sentry for monitoring and debugging.
 * 
 * NOTE: This service gracefully handles missing @sentry/react-native package.
 * To enable Sentry, install: npm install @sentry/react-native
 */

import Constants from 'expo-constants';

// Try to import Sentry, but don't fail if it's not installed
let Sentry: any = null;
let SENTRY_AVAILABLE = false;

try {
  Sentry = require('@sentry/react-native');
  SENTRY_AVAILABLE = true;
  console.log('✅ Sentry package loaded');
} catch (error) {
  console.warn('⚠️ Sentry package not installed. Crash reporting disabled.');
  console.warn('To enable Sentry, run: npm install @sentry/react-native');
}

// Sentry configuration
const SENTRY_DSN = process.env.SENTRY_DSN || '';
const ENVIRONMENT = __DEV__ ? 'development' : 'production';

/**
 * Initialize Sentry
 * Call this once at app startup
 */
export const initSentry = (): void => {
  if (!SENTRY_AVAILABLE) {
    console.log('Sentry not available. Skipping initialization.');
    return;
  }

  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Crash reporting disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment: ENVIRONMENT,
    
    // Release version
    release: `com.act.app@${Constants.expoConfig?.version || '1.0.0'}`,
    
    // Distribution (build number)
    dist: Constants.expoConfig?.android?.versionCode?.toString() || '1',
    
    // Enable in production only (or always for testing)
    enabled: !__DEV__, // Change to true to test in development
    
    // Performance monitoring
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in prod
    
    // Enable automatic session tracking
    enableAutoSessionTracking: true,
    
    // Session timeout (30 minutes)
    sessionTrackingIntervalMillis: 30000,
    
    // Attach stack traces to messages
    attachStacktrace: true,
    
    // Enable native crash reporting
    enableNative: true,
    
    // Enable auto breadcrumbs
    enableAutoPerformanceTracing: true,
    
    // Integrations
    integrations: [
      new Sentry.ReactNativeTracing({
        // Routing instrumentation for React Navigation
        routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
        
        // Enable automatic tracing
        tracingOrigins: ['localhost', /^\//],
        
        // Enable idle transaction
        idleTimeout: 5000,
      }),
    ],
    
    // Before send hook - filter sensitive data
    beforeSend(event, hint) {
      // Don't send events in development (unless testing)
      if (__DEV__ && !process.env.SENTRY_TEST_MODE) {
        console.log('Sentry event (not sent in dev):', event);
        return null;
      }
      
      // Filter sensitive data from event
      if (event.request) {
        // Remove sensitive headers
        if (event.request.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }
        
        // Remove sensitive query params
        if (event.request.query_string) {
          event.request.query_string = event.request.query_string
            .replace(/password=[^&]*/gi, 'password=[FILTERED]')
            .replace(/token=[^&]*/gi, 'token=[FILTERED]');
        }
      }
      
      // Filter sensitive data from extra context
      if (event.extra) {
        if (event.extra.password) delete event.extra.password;
        if (event.extra.token) delete event.extra.token;
        if (event.extra.apiKey) delete event.extra.apiKey;
      }
      
      return event;
    },
    
    // Before breadcrumb hook - filter sensitive breadcrumbs
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter sensitive data from breadcrumbs
      if (breadcrumb.category === 'console') {
        // Don't log console messages with sensitive data
        if (breadcrumb.message?.includes('password') || 
            breadcrumb.message?.includes('token')) {
          return null;
        }
      }
      
      if (breadcrumb.category === 'http') {
        // Filter sensitive HTTP data
        if (breadcrumb.data?.url) {
          breadcrumb.data.url = breadcrumb.data.url
            .replace(/password=[^&]*/gi, 'password=[FILTERED]')
            .replace(/token=[^&]*/gi, 'token=[FILTERED]');
        }
      }
      
      return breadcrumb;
    },
  });
  
  console.log('✅ Sentry initialized:', ENVIRONMENT);
};

/**
 * Set user context for error tracking
 */
export const setSentryUser = (user: {
  id: string;
  email?: string;
  username?: string;
}): void => {
  if (!SENTRY_AVAILABLE) return;
  
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearSentryUser = (): void => {
  if (!SENTRY_AVAILABLE) return;
  
  Sentry.setUser(null);
};

/**
 * Add custom context to errors
 */
export const setSentryContext = (key: string, value: any): void => {
  if (!SENTRY_AVAILABLE) return;
  
  Sentry.setContext(key, value);
};

/**
 * Add breadcrumb for debugging
 */
export const addSentryBreadcrumb = (
  message: string,
  category: string = 'custom',
  level: any = 'info',
  data?: Record<string, any>
): void => {
  if (!SENTRY_AVAILABLE) return;
  
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Capture exception manually
 */
export const captureException = (
  error: Error,
  context?: Record<string, any>
): void => {
  if (!SENTRY_AVAILABLE) {
    console.error('Exception (Sentry not available):', error, context);
    return;
  }
  
  if (context) {
    Sentry.withScope((scope: any) => {
      Object.keys(context).forEach((key) => {
        scope.setExtra(key, context[key]);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

/**
 * Capture message manually
 */
export const captureMessage = (
  message: string,
  level: any = 'info',
  context?: Record<string, any>
): void => {
  if (!SENTRY_AVAILABLE) {
    console.log(`Message (Sentry not available) [${level}]:`, message, context);
    return;
  }
  
  if (context) {
    Sentry.withScope((scope: any) => {
      Object.keys(context).forEach((key) => {
        scope.setExtra(key, context[key]);
      });
      Sentry.captureMessage(message, level);
    });
  } else {
    Sentry.captureMessage(message, level);
  }
};

/**
 * Start a performance transaction
 */
export const startTransaction = (
  name: string,
  op: string = 'custom'
): any => {
  if (!SENTRY_AVAILABLE) {
    // Return a mock transaction object
    return {
      finish: () => {},
      setStatus: () => {},
      setData: () => {},
    };
  }
  
  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Wrap React Navigation for automatic screen tracking
 */
export const wrapNavigationContainer = (
  NavigationContainer: any
): any => {
  if (!SENTRY_AVAILABLE) {
    return NavigationContainer;
  }
  
  return Sentry.wrap(NavigationContainer);
};

/**
 * Test Sentry integration
 * Call this to verify Sentry is working
 */
export const testSentry = (): void => {
  if (!SENTRY_AVAILABLE) {
    console.log('❌ Sentry not available. Cannot test integration.');
    return;
  }
  
  console.log('Testing Sentry integration...');
  
  // Add breadcrumb
  addSentryBreadcrumb('Sentry test initiated', 'test', 'info');
  
  // Capture test message
  captureMessage('Sentry test message', 'info', {
    test: true,
    timestamp: new Date().toISOString(),
  });
  
  console.log('✅ Sentry test event sent. Check Sentry dashboard in 1-2 minutes.');
};

/**
 * Error boundary fallback component
 */
export const SentryErrorBoundary = SENTRY_AVAILABLE && Sentry?.ErrorBoundary 
  ? Sentry.ErrorBoundary 
  : ({ children }: any) => children;

/**
 * HOC to wrap components with error boundary
 */
export const withSentryErrorBoundary = (
  Component: React.ComponentType<any>,
  options?: any
) => {
  if (!SENTRY_AVAILABLE) {
    return Component;
  }
  
  return Sentry.withErrorBoundary(Component, options);
};

// Export Sentry instance for advanced usage (may be null)
export { Sentry };

export default {
  initSentry,
  setSentryUser,
  clearSentryUser,
  setSentryContext,
  addSentryBreadcrumb,
  captureException,
  captureMessage,
  startTransaction,
  wrapNavigationContainer,
  testSentry,
  SentryErrorBoundary,
  withSentryErrorBoundary,
};