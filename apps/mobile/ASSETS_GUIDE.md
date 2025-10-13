# App Assets Guide

## 📱 Required Assets for Android Production

### Current Assets
Your app currently has these assets in the `assets/` directory:
- `icon.png` - App icon
- `adaptive-icon.png` - Android adaptive icon foreground
- `splash-icon.png` - Splash screen image
- `favicon.png` - Web favicon

### Additional Required Assets

#### 1. Notification Icon
**File:** `assets/notification-icon.png`

**Requirements:**
- Size: 96x96 pixels (will be scaled automatically)
- Format: PNG with transparency
- Style: Simple, flat, white icon on transparent background
- Use: Shown in notification tray

**How to create:**
1. Create a simple white icon (96x96px)
2. Use transparent background
3. Keep it simple - it will be small in notifications
4. Save as `notification-icon.png` in `assets/` folder

**Quick solution:** You can use your app icon temporarily:
```bash
# Copy existing icon as notification icon
cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\assets
copy icon.png notification-icon.png
```

### Asset Specifications

#### App Icon (`icon.png`)
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Use:** iOS App Store, Expo Go
- **Current:** ✓ Already exists

#### Adaptive Icon (`adaptive-icon.png`)
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Safe zone:** Keep important content in center 66% (684x684px)
- **Use:** Android home screen (foreground layer)
- **Current:** ✓ Already exists

#### Splash Screen (`splash-icon.png`)
- **Size:** Recommended 1284x2778 pixels (or your current size)
- **Format:** PNG
- **Use:** Shown while app loads
- **Current:** ✓ Already exists

#### Notification Icon (`notification-icon.png`)
- **Size:** 96x96 pixels
- **Format:** PNG with transparency
- **Style:** White icon on transparent background
- **Use:** Android notifications
- **Current:** ⚠️ Needs to be created

### Creating Professional Assets

#### Option 1: Use Existing Icon
If you don't have custom assets yet:
```bash
cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\assets
copy icon.png notification-icon.png
```

#### Option 2: Design Custom Assets
Use tools like:
- **Figma** (free, web-based)
- **Adobe Illustrator** (professional)
- **Canva** (easy, templates available)
- **GIMP** (free, open-source)

#### Option 3: Hire a Designer
- **Fiverr** - $5-50 for app icon sets
- **99designs** - Professional design contests
- **Upwork** - Hire freelance designers

### Asset Checklist

Before production release:
- [ ] App icon is professional and recognizable
- [ ] Adaptive icon looks good on different Android launchers
- [ ] Splash screen matches your brand
- [ ] Notification icon is created (white on transparent)
- [ ] All assets are high resolution
- [ ] Assets are optimized (not too large file size)

### Testing Assets

#### Test App Icon
1. Build and install app on phone
2. Check home screen icon
3. Try different launchers (if available)
4. Check icon in app drawer

#### Test Adaptive Icon
1. On Android, long-press home screen
2. Try different icon shapes in launcher settings
3. Verify icon looks good in all shapes (circle, square, rounded)

#### Test Splash Screen
1. Close app completely
2. Open app
3. Verify splash screen appears correctly
4. Check on different screen sizes

#### Test Notification Icon
1. Send a test notification
2. Check notification tray
3. Verify icon is visible and clear

### Asset Optimization

#### Reduce File Size
```bash
# Using ImageMagick (if installed)
magick convert icon.png -quality 85 icon-optimized.png

# Or use online tools:
# - TinyPNG (https://tinypng.com/)
# - Squoosh (https://squoosh.app/)
```

#### Verify Asset Sizes
```bash
# Check file sizes
cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\assets
dir
```

Recommended max sizes:
- App icon: < 500 KB
- Adaptive icon: < 500 KB
- Splash screen: < 1 MB
- Notification icon: < 50 KB

### Google Play Store Assets

When submitting to Play Store, you'll also need:

#### Feature Graphic (Required)
- **Size:** 1024x500 pixels
- **Format:** PNG or JPEG
- **Use:** Play Store listing header
- **Note:** Create this later when ready for Play Store

#### Screenshots (Required)
- **Minimum:** 2 screenshots
- **Recommended:** 4-8 screenshots
- **Size:** 
  - Phone: 1080x1920 to 1080x2340 pixels
  - Tablet: 1200x1920 to 1600x2560 pixels
- **Format:** PNG or JPEG
- **Note:** Take these from your running app

#### Promo Video (Optional)
- **Format:** YouTube video link
- **Length:** 30 seconds to 2 minutes
- **Use:** Play Store listing

### Quick Setup Script

Create `notification-icon.png` from existing icon:

```powershell
# Run this in PowerShell
cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\assets

# Check if notification icon exists
if (!(Test-Path "notification-icon.png")) {
    Write-Host "Creating notification-icon.png from icon.png..." -ForegroundColor Yellow
    Copy-Item "icon.png" "notification-icon.png"
    Write-Host "✓ notification-icon.png created" -ForegroundColor Green
} else {
    Write-Host "✓ notification-icon.png already exists" -ForegroundColor Green
}

# List all assets
Write-Host "`nCurrent assets:" -ForegroundColor Cyan
Get-ChildItem -Filter "*.png" | Format-Table Name, Length
```

### Next Steps

1. **Create notification icon** (if not done):
   ```bash
   cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\assets
   copy icon.png notification-icon.png
   ```

2. **Verify all assets exist**:
   - icon.png ✓
   - adaptive-icon.png ✓
   - splash-icon.png ✓
   - notification-icon.png ⚠️ (create this)
   - favicon.png ✓

3. **Test assets** by building and installing app

4. **Plan for Play Store assets** (screenshots, feature graphic)

---

**Need Help?**
- [Expo App Icons](https://docs.expo.dev/develop/user-interface/app-icons/)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
- [Notification Icons](https://developer.android.com/develop/ui/views/notifications/badges)