# 🧪 Language Switching Comprehensive Test Guide

## Critical Fixes Applied

✅ **App.tsx**: Now waits for i18n 'loaded' event to ensure language is detected from AsyncStorage BEFORE rendering components

✅ **SettingsScreen.tsx**: Added `key={settings-${languageChangeKey}}` to force component unmount/remount on language change

✅ **i18n Configuration**: Proper `bindI18n: 'languageChanged loaded'` to automatically subscribe components to language changes

## Pre-Rebuild Checklist

Run this before building:

```bash
# Clear all caches
npx react-native start --reset-cache

# Or completely clean build
rm -rf node_modules
npm install
npm run android  # or npm run ios
```

## During Build - Check Console Logs

Watch for these exact logs to appear IN ORDER:

```
⏳ Waiting for i18n and language detection...
🌐 i18n Language Detector - Saved language: ru (or whatever was saved)
✅ i18n loaded event fired with language: ru
✅ Language detection complete. Current language: ru
✅ App initialization complete. Current language: ru
```

**If you see** `with language: en` at the end = PROBLEM (language wasn't detected)

## Test 1: App Launch with Saved Language

### Setup
1. Build and run app
2. If you have a saved language preference (should show in console), it should launch with that language

### Expected Behavior
- ✅ ALL text is in saved language
- ✅ Settings shows correct language selected
- ✅ No English text anywhere

### If Failed
- Check console for language detection logs
- Clear app data: `adb shell pm clear com.app.name`
- Rebuild with `--reset-cache`

## Test 2: Change Language to Russian

### Steps
1. Open Settings (tab or menu)
2. Go to "Language & Currency" section
3. Tap Language dropdown
4. Select "Русский (Russian)"
5. **IMMEDIATELY** check if ALL text changes to Russian

### Expected Behavior - INSTANT Change
- ✅ Header "Settings" → "Настройки"
- ✅ "Account Details" → "Данные аккаунта"
- ✅ "Email cannot be changed" → "Email не может быть изменен"
- ✅ "Language & Currency" → "Язык и валюта"
- ✅ "Notification Settings" → "Настройки уведомлений"
- ✅ "Email Notifications" → "Email уведомления"
- ✅ "Push Notifications" → "Push-уведомления"
- ✅ "App Preferences" → "Предпочтения приложения"
- ✅ "Theme" → "Тема"
- ✅ "Font Size" → "Размер шрифта"
- ✅ "UPGRADE PLAN" → "ОБНОВИТЬ ПЛАН"
- ✅ All buttons change (Save→Сохранить, Cancel→Отмена, etc.)

### Console Should Show
```
🌐 Starting language change to: ru
✅ i18n.changeLanguage() completed for ru
✅ Current i18n language: ru
✅ 🌐 i18n Language Changed Event: ru
🌐 SettingsScreen detected language change to: ru
✅ Zustand store updated with language ru
✅ Language saved to AsyncStorage: ru
✅ Language verified in storage: ru
```

## Test 3: Navigate Between Screens

### After Changing Language to Russian

1. **Settings Screen** (if on it)
   - ✅ ALL text is Russian
   
2. **Click Settings Tab** (bottom navigation)
   - ✅ Tab text shows "Настройки"
   - ✅ All Settings page text is Russian
   
3. **Click Home Tab**
   - ✅ Tab text shows "Главная"
   - ✅ Expenses screen shows Russian text
   
4. **Click Add Tab**
   - ✅ Tab text shows "Добавить"
   - ✅ Add screen shows Russian labels
   
5. **Click Reports Tab**
   - ✅ Tab text shows "Отчеты"
   - ✅ Reports screen shows Russian text
   
6. **Click Reminders Tab**
   - ✅ Tab text shows "Напоминания"
   - ✅ Reminders screen shows Russian text
   
7. **Click Books Tab**
   - ✅ Tab text shows "Книги"
   - ✅ Books screen shows Russian text

### If Any Screen Shows English
- That screen is missing language change listener or key
- Report which screen shows English
- Check logs for: `🌐 [ScreenName] detected language change to: ru`

## Test 4: Switch to Other Languages

After Russian, test each language:

### Uzbek (Ўзбек)
- ✅ Select Uzbek in Settings
- ✅ Wait 1 second
- ✅ ALL text should change to Uzbek
- ✅ Settings shows "Ўзбек" selected
- Check console for: `with language: uz`

### Spanish (Español)
- ✅ Select Spanish
- ✅ ALL text should change to Spanish
- ✅ Settings shows "Español" selected
- Check console for: `with language: es`

### English (back to start)
- ✅ Select English
- ✅ ALL text should change back to English
- ✅ Settings shows "English" selected
- Check console for: `with language: en`

## Test 5: App Restart with Saved Language

### Setup - Russian Selected
1. Change to Russian (Русский)
2. Wait for all text to change
3. **FULLY CLOSE THE APP** (not just minimize)
4. Wait 2 seconds
5. Reopen the app

### Expected Behavior
- ✅ App opens with Russian language
- ✅ NO English text at any point during startup
- ✅ Settings shows "Русский" selected

### Console Should Show During Startup
```
✅ i18n Language Detector - Saved language: ru
🌐 Loading and applying saved language to i18n: ru
✅ i18n language ready: ru
✅ Settings loaded from storage with language: ru
✅ i18n.language confirmed: ru
```

**MOST IMPORTANT**: If app opens in English instead of Russian, the language detection from AsyncStorage is failing.

## Test 6: Error Messages

### With Russian Selected, Test Validation

1. **Login Screen** (logout first if needed)
   - Try login with empty email
   - ✅ Error message should be in Russian
   - Should say "Введите имя пользователя или email" (not "Email or Username is required")

2. **Register Screen**
   - Try with empty fields
   - ✅ Validation messages in Russian
   - Try with weak password
   - ✅ "Пароль должен содержать минимум 8 символов"

3. **Any screen with validation**
   - All error messages should be in selected language

## Debugging Console Output

### Watch for These Patterns

**Good** ✅
```
✅ i18n Language Detector - Saved language: ru
✅ i18n loaded event fired with language: ru
✅ Current i18n language: ru
✅ 🌐 i18n Language Changed Event: ru
🌐 SettingsScreen detected language change to: ru
```

**Bad** ❌
```
🌐 i18n Language Detector - Saved language: null
✅ i18n loaded event fired with language: en
❌ Language change detected but text is still in English
```

### If Language Won't Change

**Step 1**: Check console
- Does `i18n.changeLanguage()` log complete?
- Does `Language Changed Event` log appear?

**Step 2**: Verify AsyncStorage
Add this to DevTools console:
```javascript
AsyncStorage.getItem('user-language').then(val => console.log('Saved language:', val))
```

**Step 3**: Check i18n directly
```javascript
import i18n from '../i18n'
console.log('Current i18n language:', i18n.language)
console.log('Has Russian translations:', !!i18n.getResourceBundle('ru', 'translation'))
```

## Acceptance Criteria

✅ App launches with correct saved language
✅ Language dropdown in Settings shows correct selection
✅ Changing language updates ALL visible text IMMEDIATELY
✅ Navigation tab labels update on language change
✅ Error messages appear in selected language
✅ All 4 languages work (en, ru, uz, es)
✅ Language persists after app restart
✅ No hardcoded English strings remain visible
✅ All UI elements (buttons, labels, placeholders) translate
✅ Console shows proper language change sequence

## If Tests Fail

**Scenario: Text doesn't change when language selected**
1. Clear app data: `adb shell pm clear com.act.app`
2. Rebuild: `npm run android -- --reset-cache`
3. Check that SettingsScreen has `key={settings-${languageChangeKey}}`
4. Verify i18n initialized before components render

**Scenario: App opens in English after closing/reopening**
1. Verify AsyncStorage 'user-language' key is being saved
2. Check App.tsx is waiting for language detection
3. Ensure languageDetector is calling callback with saved language

**Scenario: Only some screens don't translate**
1. Check if that screen has useTranslation hook
2. Check if it has language change listener
3. Check if it has key with languageChangeKey
4. Add/fix these if missing

## Quick Reference - What Should Be Translated

All of these should change when language changes:

- Screen titles (Settings, Home, Add, Reports, etc.)
- Section titles (Account Details, Language & Currency, etc.)
- Labels (Email, Password, Full Name, etc.)
- Buttons (Save, Cancel, Logout, Sign In, etc.)
- Placeholders (Enter password, your@email.com, etc.)
- Error messages (Invalid email, Password too short, etc.)
- Navigation tabs (Home, Add, Reports, Reminders, Books, Settings, etc.)
- Toggle labels (Email Notifications, Push Notifications, etc.)
- Helper text (Email cannot be changed, etc.)
- Any hardcoded strings using t('key') function

## Performance Check

Language change should be INSTANT (< 200ms):
- No loading screen
- No blank text
- Smooth transition
- All text changes at once

If there's a delay > 1 second, there's a performance issue.

---

**Status**: Ready for comprehensive testing
**Last Updated**: After i18n initialization fix
**Next Steps**: Run all 6 tests and verify acceptance criteria