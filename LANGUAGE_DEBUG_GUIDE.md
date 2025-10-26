# Language Translation Debug Guide

## Current Issue
Settings screen shows "Русский" selected, but UI text remains in English.

## What We Added for Debugging

### 1. **SettingsScreen Debug Panel** (visible at top of screen)
Shows real-time values:
- `i18n.language` - What language i18n thinks it's using
- `store.language` - What language the settings store has
- `changeKey` - How many times component has re-rendered
- `t('settings')` - Actual translation being used
- `t('accountDetails')` - Actual translation being used

### 2. **Console Logs Added**

#### SettingsScreen Logs:
```
📱 SettingsScreen RENDER - languageChangeKey: X, i18n.language: en, language store: ru
  ├─ t('settings'): "Settings"
  ├─ t('accountDetails'): "Account Details"  
  ├─ t('languageAndCurrency'): "Language & Currency"
  └─ t('appPreferences'): "App Preferences"
```

When language is changed:
```
📝 handleFieldChange called with value: ru
✅ handleFieldChange completed
🌐 SettingsScreen detected language change to: ru
✅ i18n.language is now: ru
✅ t('settings') returns: "Настройки"
✅ t('accountDetails') returns: "Данные аккаунта"
🔄 SettingsScreen key changing to force re-render: 1
```

#### App.tsx Logs:
```
✅ App.tsx: Language detection complete. Current language: ru
  ├─ t('settings'): "Настройки"
  ├─ t('accountDetails'): "Данные аккаунта"
  └─ t('login'): "Войти"
```

#### i18n.ts Logs:
```
🌐 i18n Language Detector - Starting detection...
🌐 i18n Language Detector - Saved language from AsyncStorage: ru
✅ 🌐 i18n Language Detector - Calling callback with saved language: ru
```

## How to Test

1. **Open the app and go to Settings**
2. **Look at the debug panel at the top** - Note the initial values
3. **Tap on Language and select Russian (Русский)**
4. **Immediately check:**
   - Does debug panel show `i18n.language: ru`?
   - Does debug panel show `t('settings')` in Russian?
   - Do the actual labels update to Russian?
5. **Check console logs** for the sequence of events

## Diagnostic Questions

**If `i18n.language` stays "en":**
- Language change event is not being triggered
- Problem is in `setLanguage()` function in settings.ts
- `i18n.changeLanguage()` is not being called or is failing silently

**If `i18n.language` becomes "ru" but translations stay English:**
- Russian resources not loaded into i18n
- Translation keys don't exist for Russian
- `t()` function is cached and not picking up new language

**If `changeKey` doesn't increase:**
- Language change event listener not working
- Component not being forced to re-render
- Check if `i18n.on('languageChanged')` is firing

**If `store.language` is different from `i18n.language`:**
- Settings store and i18n are out of sync
- Zustand and i18n are not coordinating properly

## Next Steps

1. Run the app with these debug logs
2. Select a language and report:
   - What does the debug panel show?
   - What do the console logs show?
   - Which value is incorrect?
3. We'll know exactly where to fix

## Notes
- The debug panel will be removed once we fix the issue
- All console logs are timestamped in the Expo logs
- Language should persist across app restarts (saved to AsyncStorage)