# 🔐 Authentication Flow Diagram

## Overview

Your app uses **JWT (JSON Web Token)** authentication with **persistent storage** for seamless user experience.

## 🎯 Key Components

1. **Mobile App** (React Native + Expo)
2. **Secure Storage** (Expo SecureStore - encrypted)
3. **Backend API** (FastAPI + SQLite)
4. **Auth Store** (Zustand state management)

---

## 📱 First Time: Sign Up Flow

```
┌─────────────┐
│   User      │
│  Opens App  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Login Screen   │
│  Tap "Sign Up"  │
└──────┬──────────┘
       │
       ▼
┌──────────────────────┐
│  Register Screen     │
│  Enter:              │
│  - Email             │
│  - Password          │
│  - Confirm Password  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│  POST /auth/register         │
│  {                           │
│    email: "user@example.com" │
│    password: "password123"   │
│  }                           │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Backend:                    │
│  1. Check email unique       │
│  2. Hash password (Argon2)   │
│  3. Create user in DB        │
│  4. Generate tokens:         │
│     - Access Token (30 min)  │
│     - Refresh Token (7 days) │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Response:                   │
│  {                           │
│    access_token: "eyJ..."    │
│    refresh_token: "eyJ..."   │
│  }                           │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Mobile App:                 │
│  1. Save tokens to           │
│     SecureStore (encrypted)  │
│  2. Set tokens in state      │
│  3. Fetch user profile       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  GET /users/me               │
│  Headers:                    │
│    Authorization: Bearer ... │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Response:                   │
│  {                           │
│    id: 1,                    │
│    email: "user@example.com" │
│    name: "...",              │
│    ...                       │
│  }                           │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  ✅ User Logged In!          │
│  Navigate to Main App        │
└──────────────────────────────┘
```

---

## 🔄 Subsequent Opens: Auto-Login Flow

```
┌─────────────┐
│   User      │
│  Opens App  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────┐
│  App.tsx:                    │
│  useEffect(() => {           │
│    initializeAuth()          │
│  }, [])                      │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Auth Store:                 │
│  initializeAuth()            │
│  1. Check SecureStore        │
│     for saved tokens         │
└──────┬───────────────────────┘
       │
       ├─── Tokens Found ────────┐
       │                         │
       │                         ▼
       │              ┌──────────────────────┐
       │              │  Set tokens in state │
       │              │  accessToken = "..." │
       │              │  refreshToken = "..." │
       │              └──────┬───────────────┘
       │                     │
       │                     ▼
       │              ┌──────────────────────┐
       │              │  GET /users/me       │
       │              │  (with Bearer token) │
       │              └──────┬───────────────┘
       │                     │
       │                     ├─── Success ────┐
       │                     │                │
       │                     │                ▼
       │                     │     ┌──────────────────┐
       │                     │     │  Set user in     │
       │                     │     │  state           │
       │                     │     └──────┬───────────┘
       │                     │            │
       │                     │            ▼
       │                     │     ┌──────────────────┐
       │                     │     │  ✅ Auto-Login!  │
       │                     │     │  Show Main App   │
       │                     │     └──────────────────┘
       │                     │
       │                     └─── 401 Error ──┐
       │                                      │
       │                                      ▼
       │                           ┌──────────────────┐
       │                           │  Token expired   │
       │                           │  Clear tokens    │
       │                           │  Show Login      │
       │                           └──────────────────┘
       │
       └─── No Tokens ──────┐
                            │
                            ▼
                 ┌──────────────────┐
                 │  Show Login      │
                 │  Screen          │
                 └──────────────────┘
```

---

## 🔑 Login Flow (Returning User)

```
┌─────────────────┐
│  Login Screen   │
│  Enter:         │
│  - Email        │
│  - Password     │
│  Tap "Login"    │
└──────┬──────────┘
       │
       ▼
┌──────────────────────────────┐
│  POST /auth/login            │
│  {                           │
│    email: "user@example.com" │
│    password: "password123"   │
│  }                           │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Backend:                    │
│  1. Find user by email       │
│  2. Verify password          │
│  3. Generate new tokens      │
└──────┬───────────────────────┘
       │
       ├─── Valid ────────────┐
       │                      │
       │                      ▼
       │           ┌──────────────────────┐
       │           │  Return tokens       │
       │           │  Save to SecureStore │
       │           │  Fetch profile       │
       │           │  ✅ Logged In!       │
       │           └──────────────────────┘
       │
       └─── Invalid ──────────┐
                              │
                              ▼
                   ┌──────────────────────┐
                   │  Show error:         │
                   │  "Invalid email or   │
                   │   password"          │
                   └──────────────────────┘
```

---

## 🔄 Token Refresh Flow (Automatic)

```
┌──────────────────────────────┐
│  User makes API call         │
│  (e.g., GET /entries)        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Axios Interceptor:          │
│  Add Authorization header    │
│  Bearer <access_token>       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Backend validates token     │
└──────┬───────────────────────┘
       │
       ├─── Valid ────────────┐
       │                      │
       │                      ▼
       │           ┌──────────────────────┐
       │           │  ✅ Return data      │
       │           └──────────────────────┘
       │
       └─── 401 Expired ──────┐
                              │
                              ▼
                   ┌──────────────────────────────┐
                   │  Axios Response Interceptor: │
                   │  Detect 401 error            │
                   └──────┬───────────────────────┘
                          │
                          ▼
                   ┌──────────────────────────────┐
                   │  POST /auth/refresh          │
                   │  {                           │
                   │    refresh_token: "..."      │
                   │  }                           │
                   └──────┬───────────────────────┘
                          │
                          ▼
                   ┌──────────────────────────────┐
                   │  Backend:                    │
                   │  1. Validate refresh token   │
                   │  2. Generate new tokens      │
                   │  3. Revoke old refresh token │
                   └──────┬───────────────────────┘
                          │
                          ▼
                   ┌──────────────────────────────┐
                   │  Save new tokens             │
                   │  Retry original request      │
                   │  ✅ Success!                 │
                   └──────────────────────────────┘
```

---

## 🚪 Logout Flow

```
┌─────────────────┐
│  User taps      │
│  "Logout"       │
└──────┬──────────┘
       │
       ▼
┌──────────────────────────────┐
│  Auth Store: logout()        │
│  1. Get refresh token        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  POST /auth/logout           │
│  {                           │
│    refresh_token: "..."      │
│  }                           │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Backend:                    │
│  Revoke refresh token        │
│  (add to blacklist)          │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Mobile App:                 │
│  1. Delete tokens from       │
│     SecureStore              │
│  2. Clear state              │
│     (accessToken = null)     │
│     (refreshToken = null)    │
│     (user = null)            │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Navigation:                 │
│  Detect user = null          │
│  Show Login Screen           │
└──────────────────────────────┘
```

---

## 🔒 Security Features

### 1. **Secure Storage**
- Tokens stored in **Expo SecureStore**
- Encrypted at rest
- OS-level security (Keychain on iOS, KeyStore on Android)

### 2. **Token Expiration**
- **Access Token**: 30 minutes
- **Refresh Token**: 7 days
- Automatic refresh when access token expires

### 3. **Token Rotation**
- Each refresh generates NEW tokens
- Old refresh token is revoked
- Prevents token reuse attacks

### 4. **Password Security**
- Hashed with **Argon2** (winner of Password Hashing Competition)
- Never stored in plain text
- Never sent in responses

### 5. **HTTPS Ready**
- All endpoints support HTTPS
- Use ngrok or proper SSL in production

---

## 📊 State Management

### Auth Store (Zustand)

```typescript
{
  // State
  accessToken: string | null,
  refreshToken: string | null,
  user: User | null,
  isLoading: boolean,

  // Actions
  setTokens: (access, refresh) => Promise<void>,
  logout: () => Promise<void>,
  fetchProfile: () => Promise<void>,
  initializeAuth: () => Promise<void>,
}
```

### Navigation Logic

```typescript
// In AppNavigator.tsx
const user = useAuthStore((s) => s.user);

return (
  <NavigationContainer>
    {user ? (
      // Show main app tabs
      <MainTabs />
    ) : (
      // Show auth screens
      <AuthStack />
    )}
  </NavigationContainer>
);
```

---

## 🎯 Key Takeaways

1. **Tokens are saved** to encrypted storage after login/signup
2. **Auto-login works** by restoring tokens on app start
3. **Tokens refresh automatically** when expired
4. **Logout clears everything** from storage and state
5. **Navigation reacts** to user state (logged in vs logged out)

---

## 🐛 Debugging Tips

### Check Console Logs

Look for these emoji prefixes:
- 🔐 = Authentication action
- ✅ = Success
- ❌ = Error
- 📡 = Network request
- 🔄 = Token refresh

### Common Issues

1. **Login screen after restart**
   - Check: Are tokens being saved? (look for "✅ Tokens saved")
   - Check: Any errors during profile fetch?

2. **Network errors**
   - Check: Is API server running?
   - Check: Correct IP in `.env`?
   - Check: Same WiFi network?

3. **Token expired errors**
   - Check: Backend database reset?
   - Solution: Logout and login again

---

## 📚 Related Files

- **Auth Store**: `apps/mobile/src/store/auth.ts`
- **API Client**: `apps/mobile/src/api/client.ts`
- **Navigation**: `apps/mobile/src/navigation/AppNavigator.tsx`
- **Login Screen**: `apps/mobile/src/screens/LoginScreen.tsx`
- **Register Screen**: `apps/mobile/src/screens/RegisterScreen.tsx`
- **Backend Auth**: `apps/api/routers/auth.py`
- **Security**: `apps/api/security.py`

---

**Your authentication system is production-ready!** 🎉