# Japanese Theme Quick Reference

## 🎨 Import Theme

```tsx
import { useTheme } from '../theme';

const { theme, mode, setMode } = useTheme();
```

## 📏 Spacing (8px Grid)

```tsx
theme.spacing(0.5)  // 4px
theme.spacing(1)    // 8px
theme.spacing(2)    // 16px
theme.spacing(3)    // 24px
theme.spacing(4)    // 32px
theme.spacing(5)    // 40px
```

## 🔤 Typography

```tsx
theme.typography.xs     // { fontSize: 12, lineHeight: 16 }
theme.typography.sm     // { fontSize: 14, lineHeight: 20 }
theme.typography.base   // { fontSize: 16, lineHeight: 24 }
theme.typography.lg     // { fontSize: 18, lineHeight: 26 }
theme.typography.xl     // { fontSize: 20, lineHeight: 28 }
theme.typography.title  // { fontSize: 24, lineHeight: 32, fontWeight: "700" }
theme.typography.h1     // { fontSize: 28, lineHeight: 36, fontWeight: "700" }
```

## 🎨 Colors

### Light Mode
```tsx
theme.colors.background    // "#FFFBF7" - warm paper
theme.colors.surface       // "#FFFFFF" - card surface
theme.colors.textPrimary   // "#0B0B0B" - main text
theme.colors.textSecondary // "#5E5E5E" - secondary text
theme.colors.sumi          // "#1B1B1B" - deep sumi ink
theme.colors.accent        // "#B71C1C" - aka red
theme.colors.accentSoft    // "#FBEAEA" - soft red
theme.colors.matcha        // "#2E7D32" - matcha green
theme.colors.border        // "#EDE7E3" - borders
theme.colors.shadow        // "rgba(11,11,11,0.08)"
```

### Dark Mode
```tsx
theme.colors.background    // "#0B0B0E"
theme.colors.surface       // "#111217"
theme.colors.textPrimary   // "#F4F4F5"
theme.colors.textSecondary // "#BDBDBD"
theme.colors.sumi          // "#ECECEC"
theme.colors.accent        // "#FF6B6B"
theme.colors.accentSoft    // "#3A0E0E"
theme.colors.matcha        // "#66BB6A"
theme.colors.border        // "#1A1A1F"
theme.colors.shadow        // "rgba(0,0,0,0.7)"
```

## 🔘 Border Radius

```tsx
theme.roundness  // 12
```

## 📱 Components

### Import Components
```tsx
import {
  // Existing themed components
  ThemedView,
  ThemedText,
  ThemedCard,
  ThemedButton,
  ThemedInput,
  
  // New Japanese components
  Header,
  Card,
  PrimaryButton,
  FAB,
  StreakFlame,
} from '../components/themed';
```

### ThemedText
```tsx
<ThemedText 
  variant="primary"    // primary | secondary | accent | inverse
  size="base"          // xs | sm | base | lg | xl | title | h1
  weight="regular"     // regular | medium | bold
>
  Text
</ThemedText>
```

### ThemedView
```tsx
<ThemedView variant="background">  // background | surface | transparent
  {children}
</ThemedView>
```

### ThemedCard
```tsx
<ThemedCard style={{ padding: theme.spacing(2) }}>
  {children}
</ThemedCard>
```

### ThemedButton
```tsx
<ThemedButton 
  onPress={() => {}}
  loading={false}
  disabled={false}
>
  Button Text
</ThemedButton>
```

### ThemedInput
```tsx
<ThemedInput
  label="Email"
  placeholder="Enter email"
  value={value}
  onChangeText={setValue}
  error="Error message"
  secureTextEntry={false}
/>
```

### Header (New)
```tsx
<Header title="Page Title" />
```

### Card (New)
```tsx
<Card style={{ margin: theme.spacing(2) }}>
  {children}
</Card>
```

### PrimaryButton (New)
```tsx
<PrimaryButton 
  label="Click Me" 
  onPress={() => {}}
  style={{ marginTop: theme.spacing(2) }}
/>
```

### FAB (New)
```tsx
<FAB onPress={() => {}} />
```

### StreakFlame (New)
```tsx
<StreakFlame days={7} />
```

## 🌓 Theme Switching

```tsx
// Get current mode
const { mode } = useTheme();  // "light" | "dark"

// Set mode
setMode("light");
setMode("dark");
```

## 🔤 Fonts

The theme uses **Noto Sans JP** with three weights:
- `NotoSansJP_400Regular` - Regular (400)
- `NotoSansJP_500Medium` - Medium (500)
- `NotoSansJP_700Bold` - Bold (700)

Fonts are automatically loaded in `App.tsx`.

## 💡 Common Patterns

### Card with Content
```tsx
<Card style={{ margin: theme.spacing(2) }}>
  <ThemedText size="xl" weight="bold" style={{ marginBottom: theme.spacing(1) }}>
    Title
  </ThemedText>
  <ThemedText variant="secondary">
    Description text
  </ThemedText>
</Card>
```

### Form Input
```tsx
<ThemedInput
  label="Email"
  placeholder="user@example.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={errors.email}
/>
```

### Action Button
```tsx
<PrimaryButton 
  label="Submit" 
  onPress={handleSubmit}
  style={{ marginTop: theme.spacing(2) }}
/>
```

### Screen Layout
```tsx
<ThemedView variant="background" style={{ flex: 1 }}>
  <SafeAreaView style={{ flex: 1 }}>
    <Header title="Screen Title" />
    <ScrollView>
      {/* Content */}
    </ScrollView>
    <FAB onPress={handleAdd} />
  </SafeAreaView>
</ThemedView>
```

## 🎯 Design Principles

1. **Use 8px grid** - All spacing should be multiples of 8px
2. **Minimal colors** - Stick to sumi, aka, and matcha
3. **Generous spacing** - Embrace negative space (Ma)
4. **Consistent typography** - Use defined scale
5. **Subtle shadows** - Keep elevation minimal

## 📝 Style Examples

### Container with Padding
```tsx
<View style={{ padding: theme.spacing(2) }}>
  {/* 16px padding */}
</View>
```

### Text with Theme Colors
```tsx
<Text style={{ 
  color: theme.colors.textPrimary,
  fontSize: theme.typography.base.fontSize,
  lineHeight: theme.typography.base.lineHeight,
}}>
  Content
</Text>
```

### Card with Shadow
```tsx
<View style={{
  backgroundColor: theme.colors.surface,
  borderRadius: theme.roundness,
  padding: theme.spacing(2),
  shadowColor: theme.colors.sumi,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
  borderWidth: 1,
  borderColor: theme.colors.border,
}}>
  {children}
</View>
```

### Button with Accent Color
```tsx
<TouchableOpacity style={{
  backgroundColor: theme.colors.accent,
  paddingVertical: theme.spacing(1.5),
  paddingHorizontal: theme.spacing(3),
  borderRadius: 10,
  alignItems: 'center',
}}>
  <Text style={{ 
    color: '#fff',
    fontFamily: 'NotoSansJP_700Bold',
    fontSize: theme.typography.base.fontSize,
  }}>
    Button
  </Text>
</TouchableOpacity>
```

---

**Quick Tip**: Use the ThemeShowcaseScreen to see all components in action!