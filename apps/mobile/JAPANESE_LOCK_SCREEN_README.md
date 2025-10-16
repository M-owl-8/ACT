# 🌸 Japanese Lock Screen

A beautiful, animated lock screen with Japanese aesthetic design for the ACT Gen-1 mobile app.

## ✨ Features

- **Animated Sakura Petals** - 7 floating cherry blossom emojis with smooth animations
- **Glassmorphism Design** - Frosted glass effect with backdrop blur
- **Live Clock** - Real-time display of current time and date
- **Gradient Background** - Soft pink to lavender gradient
- **Japanese Aesthetic** - Minimalist design with cultural elements
- **Form Validation** - Email and password validation with error messages
- **Password Toggle** - Show/hide password functionality
- **Responsive Layout** - Works on all screen sizes

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the app
npm start

# Open on device
# Press 'i' for iOS, 'a' for Android, or scan QR code
```

## 📸 Preview

### Visual Elements:
- Soft gradient background (pink → lavender)
- Floating sakura petals with animations
- Frosted glass login card
- Live time display (e.g., "3:45 PM")
- Date display (e.g., "Jan 15, 2025")
- Japanese text accent (日本)
- "ACT" branding panel

### Interactive Elements:
- Username/email input field
- Password input with visibility toggle
- "Unlock" button
- "Sign Up" navigation link

## 🎨 Design

### Colors:
- Background: `#FDEDEC` → `#F6F7FF`
- Primary: `#2B6EFB` (blue)
- Accent: `#FF9AA2` (coral)
- Glass: `rgba(255,255,255,0.12)`

### Typography:
- Time: 48px, weight 600
- Date: 14px
- Welcome: 20px, weight 700
- Inputs: 15px

## 🔧 Technical Details

### Component:
`src/screens/JapaneseLockScreen.tsx`

### Dependencies:
- `expo-blur` - Glassmorphism effects
- `expo-linear-gradient` - Background gradient
- `react-hook-form` - Form management
- `@expo/vector-icons` - Icons

### Animations:
- Petal falling (translateY)
- Petal drifting (translateX)
- Petal rotation (rotate)
- Fade in (opacity)
- 60fps performance

## 📱 Usage

### Login:
1. Enter email/username
2. Enter password
3. Toggle password visibility if needed
4. Click "Unlock" button
5. On success, navigate to main app

### Register:
1. Click "Sign Up" link
2. Navigate to registration screen

### Test Credentials:
```
Email: admin@actgen1.com
Password: admin123
```

## 🎯 Customization

### Change Petal Count:
```typescript
// In JapaneseLockScreen.tsx
{[...Array(7)].map((_, i) => ( // Change 7 to desired count
  <SakuraPetal key={i} delay={i * 1000} />
))}
```

### Change Colors:
```typescript
// Background gradient
<LinearGradient
  colors={['#FDEDEC', '#F6F7FF']} // Change these
  ...
/>

// Button color
unlockButton: {
  backgroundColor: '#2B6EFB', // Change this
  ...
}
```

### Adjust Blur:
```typescript
<BlurView intensity={20} tint="light" ...> // Change intensity (0-100)
```

### Change Petal Emoji:
```typescript
<Animated.Text ...>
  🌸 // Change to: 🍃 🌺 ❄️ ⭐
</Animated.Text>
```

## 🧪 Testing

### Visual Test:
- [ ] Gradient background visible
- [ ] Petals animating smoothly
- [ ] Glass blur effect working
- [ ] Time updating every second
- [ ] All text readable

### Functional Test:
- [ ] Email validation works
- [ ] Password validation works
- [ ] Password toggle works
- [ ] Login flow works
- [ ] Navigation to Register works

### Performance Test:
- [ ] Animations smooth (60fps)
- [ ] No lag or stuttering
- [ ] Memory usage acceptable
- [ ] Load time < 1 second

## 📚 Documentation

- **Full Guide**: `../../JAPANESE_LOCK_SCREEN_GUIDE.md`
- **Testing Guide**: `../../TEST_JAPANESE_LOCK_SCREEN.md`
- **Implementation Summary**: `../../IMPLEMENTATION_SUMMARY.md`
- **Conversion Details**: `../../FLUTTER_TO_RN_CONVERSION.md`

## 🐛 Troubleshooting

### Blur not working:
```bash
npm install expo-blur@~14.0.4
npm start -- --clear
```

### Petals not animating:
- Check console for errors
- Ensure animations enabled on device
- Try reloading app

### Login fails:
- Ensure API server is running
- Check API URL in `.env`
- Verify credentials

### Layout broken:
- Check screen orientation (portrait)
- Try different device/simulator
- Verify screen dimensions

## 🔄 Reverting

To use the original login screen:

1. Open `src/navigation/AppNavigator.tsx`
2. Change:
   ```typescript
   component={JapaneseLockScreen}
   ```
   to:
   ```typescript
   component={LoginScreen}
   ```

## 📊 Performance

### Expected Metrics:
- **FPS**: 60fps
- **Load Time**: < 1s
- **Memory**: < 100MB
- **CPU**: < 20%

### Optimization:
- Uses `useNativeDriver: true`
- Proper cleanup of timers
- Efficient re-rendering
- Minimal state updates

## 🌟 Future Enhancements

Potential improvements:
- Biometric authentication
- Theme variants (seasons)
- Parallax effects
- Sound effects
- Customization settings
- Haptic feedback

## 📞 Support

### Issues?
- Check troubleshooting section
- Review console logs
- Verify API connection
- Check documentation

### Questions?
- Read full guide
- Review code comments
- Check React Native docs
- Consult Expo docs

## ✅ Checklist

Before deployment:
- [ ] Dependencies installed
- [ ] App launches successfully
- [ ] All features working
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Tested on target platforms
- [ ] Documentation reviewed

## 🎉 Credits

- **Design**: Inspired by Japanese minimalism and sakura aesthetics
- **Implementation**: Converted from Flutter to React Native
- **Framework**: React Native with Expo
- **Animations**: React Native Animated API
- **Blur**: Expo Blur library

## 📄 License

Part of the ACT Gen-1 project.

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: January 2025

🌸 Enjoy your beautiful Japanese lock screen! ✨