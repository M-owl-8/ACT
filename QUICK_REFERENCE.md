# ACT Gen-1: Quick Reference Guide

## 🚀 Quick Start

### Using the Theme System

```typescript
// Import theme hook and components
import { useTheme } from './contexts/ThemeContext';
import { ThemedView, ThemedText, ThemedButton } from './components/themed';

// In your component
function MyScreen() {
  const { colors, isDark } = useTheme();
  
  return (
    <ThemedView variant="primary">
      <ThemedText size="2xl" weight="bold">
        Hello World
      </ThemedText>
      <ThemedButton variant="primary" onPress={handlePress}>
        Click Me
      </ThemedButton>
    </ThemedView>
  );
}
```

### Accessing Colors

```typescript
const { colors } = useTheme();

// Primary colors
colors.primary.red        // #D32F2F (light) / #EF5350 (dark)
colors.primary.redLight   // #EF5350 (light) / #FF6F6F (dark)
colors.primary.redDark    // #B71C1C (light) / #D32F2F (dark)

// Backgrounds
colors.background.primary    // #FAFAFA (light) / #121212 (dark)
colors.background.secondary  // #FFFFFF (light) / #1E1E1E (dark)
colors.background.tertiary   // #F5F5F5 (light) / #2C2C2C (dark)

// Text
colors.text.primary     // #212121 (light) / #FAFAFA (dark)
colors.text.secondary   // #757575 (light) / #BDBDBD (dark)
colors.text.disabled    // #BDBDBD (light) / #757575 (dark)

// Semantic
colors.success  // #4CAF50
colors.error    // #D32F2F
colors.warning  // #FF9800
colors.info     // #2196F3
```

### Using Spacing

```typescript
import JapaneseTheme from './theme/japanese';

// In StyleSheet
const styles = StyleSheet.create({
  container: {
    padding: JapaneseTheme.spacing.base,      // 16px
    marginTop: JapaneseTheme.spacing.xl,      // 24px
    gap: JapaneseTheme.spacing.md,            // 12px
  },
});

// Available spacing
JapaneseTheme.spacing.xs    // 4px
JapaneseTheme.spacing.sm    // 8px
JapaneseTheme.spacing.md    // 12px
JapaneseTheme.spacing.base  // 16px
JapaneseTheme.spacing.lg    // 20px
JapaneseTheme.spacing.xl    // 24px
JapaneseTheme.spacing['2xl'] // 32px
JapaneseTheme.spacing['3xl'] // 40px
JapaneseTheme.spacing['4xl'] // 48px
JapaneseTheme.spacing['5xl'] // 64px
```

### Typography

```typescript
// Font sizes
JapaneseTheme.typography.fontSize.xs    // 12px
JapaneseTheme.typography.fontSize.sm    // 14px
JapaneseTheme.typography.fontSize.base  // 16px
JapaneseTheme.typography.fontSize.lg    // 18px
JapaneseTheme.typography.fontSize.xl    // 20px
JapaneseTheme.typography.fontSize['2xl'] // 24px
JapaneseTheme.typography.fontSize['3xl'] // 28px
JapaneseTheme.typography.fontSize['4xl'] // 32px
JapaneseTheme.typography.fontSize['5xl'] // 40px

// Font weights
JapaneseTheme.typography.fontWeight.light     // '300'
JapaneseTheme.typography.fontWeight.regular   // '400'
JapaneseTheme.typography.fontWeight.medium    // '500'
JapaneseTheme.typography.fontWeight.semibold  // '600'
JapaneseTheme.typography.fontWeight.bold      // '700'
```

## 📱 Component Reference

### ThemedView

```typescript
<ThemedView 
  variant="primary"    // primary | secondary | tertiary | transparent
  style={styles.container}
>
  {children}
</ThemedView>
```

### ThemedText

```typescript
<ThemedText 
  variant="primary"    // primary | secondary | disabled | inverse | error | success
  size="base"          // xs | sm | base | lg | xl | 2xl | 3xl | 4xl | 5xl
  weight="regular"     // light | regular | medium | semibold | bold
  style={styles.text}
>
  Text content
</ThemedText>
```

### ThemedCard

```typescript
<ThemedCard 
  elevation="base"     // sm | base | md | lg
  padding="base"       // xs | sm | md | base | lg | xl | 2xl | 3xl | 4xl | 5xl
  style={styles.card}
>
  {children}
</ThemedCard>
```

### ThemedButton

```typescript
<ThemedButton 
  variant="primary"    // primary | secondary | ghost
  size="base"          // sm | base | lg
  loading={false}      // boolean
  disabled={false}     // boolean
  onPress={handlePress}
  style={styles.button}
>
  Button Text
</ThemedButton>
```

### ThemedInput

```typescript
<ThemedInput
  label="Email"
  placeholder="Enter email"
  value={value}
  onChangeText={setValue}
  error="Error message"  // optional
  style={styles.input}
  // All TextInput props supported
/>
```

## 🎨 Common Patterns

### Screen Layout

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText } from './components/themed';
import JapaneseTheme from './theme/japanese';

function MyScreen() {
  const { colors } = useTheme();
  
  return (
    <ThemedView variant="primary" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText size="3xl" weight="bold">
              Screen Title
            </ThemedText>
            <ThemedText size="base" variant="secondary">
              Subtitle
            </ThemedText>
          </View>
          
          {/* Content */}
          <ThemedCard elevation="base" padding="lg" style={styles.section}>
            <ThemedText>Content here</ThemedText>
          </ThemedCard>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  header: {
    padding: JapaneseTheme.spacing.xl,
    gap: JapaneseTheme.spacing.xs,
  },
  section: {
    marginHorizontal: JapaneseTheme.spacing.base,
    marginBottom: JapaneseTheme.spacing.base,
  },
});
```

### Form Layout

```typescript
function FormScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  return (
    <ThemedView variant="primary" style={styles.container}>
      <ThemedCard elevation="md" padding="xl">
        <ThemedInput
          label="Email"
          placeholder="user@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        
        <ThemedInput
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <ThemedButton
          variant="primary"
          size="lg"
          loading={loading}
          onPress={handleSubmit}
        >
          Submit
        </ThemedButton>
      </ThemedCard>
    </ThemedView>
  );
}
```

### List Item

```typescript
function ListItem({ item }) {
  const { colors } = useTheme();
  
  return (
    <ThemedCard elevation="sm" padding="base" style={styles.item}>
      <View style={styles.itemHeader}>
        <ThemedText size="lg" weight="semibold">
          {item.title}
        </ThemedText>
        <ThemedText size="sm" variant="secondary">
          {item.date}
        </ThemedText>
      </View>
      
      <ThemedText variant="secondary">
        {item.description}
      </ThemedText>
      
      <View style={styles.itemFooter}>
        <ThemedText size="xl" weight="bold" style={{ color: colors.primary.red }}>
          ${item.amount}
        </ThemedText>
      </View>
    </ThemedCard>
  );
}
```

## 🔌 API Integration

### Motivation API

```typescript
// Get streak
const response = await api.get('/motivation/streak');
// { current_count: 5, best_count: 10, last_check_date: "2024-01-01" }

// Get goals
const response = await api.get('/motivation/goals');
// [{ id: 1, kind: "spend_under", title: "...", ... }]

// Create goal
const response = await api.post('/motivation/goals', {
  kind: 'spend_under',
  title: 'Spend under $500',
  target_value: 500,
  days: 7,
});

// Delete goal
await api.delete(`/motivation/goals/${goalId}`);
```

### Settings API

```typescript
// Get user settings
const response = await api.get('/users/me');
// { email: "...", language: "en", currency: "USD", theme: "light" }

// Update settings
await api.patch('/users/me', {
  language: 'ru',
  currency: 'UZS',
  theme: 'dark',
});
```

### Export API

```typescript
// Export CSV
const response = await api.get('/export/entries/csv', {
  responseType: 'blob',
});

// Export JSON
const response = await api.get('/export/entries/json');
```

### Reports API

```typescript
// Get report summary
const response = await api.get('/reports/summary?range=month');
// {
//   has_data: true,
//   currency: "USD",
//   income_total: 5000,
//   expense_total: 3500,
//   net: 1500,
//   expense_by_type: {...},
//   top_categories: [...],
//   excess_alert: {...}
// }
```

## 🎯 Common Tasks

### Change Theme Mode

```typescript
const { setThemeMode } = useTheme();

// Set to light
setThemeMode('light');

// Set to dark
setThemeMode('dark');

// Set to auto (follow system)
setThemeMode('auto');
```

### Change Language

```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();

// Change language
await i18n.changeLanguage('ru');  // en | ru | uz

// Also update backend
await api.patch('/users/me', { language: 'ru' });
```

### Show Loading State

```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await api.post('/endpoint', data);
  } catch (error) {
    Alert.alert('Error', 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

return (
  <ThemedButton loading={loading} onPress={handleAction}>
    Submit
  </ThemedButton>
);
```

### Handle Errors

```typescript
try {
  const response = await api.get('/endpoint');
  // Success
} catch (error: any) {
  console.error('Error:', error);
  
  let message = 'Something went wrong';
  
  if (error.response?.data?.detail) {
    message = error.response.data.detail;
  } else if (error.message === 'Network Error') {
    message = 'Network error. Check your connection.';
  }
  
  Alert.alert('Error', message);
}
```

## 📚 File Locations

### Theme System
- Theme config: `apps/mobile/src/theme/japanese.ts`
- Theme context: `apps/mobile/src/contexts/ThemeContext.tsx`
- Themed components: `apps/mobile/src/components/themed/`

### Screens
- Motivation: `apps/mobile/src/screens/MotivationScreen.tsx`
- Settings: `apps/mobile/src/screens/SettingsScreen.tsx`
- Theme showcase: `apps/mobile/src/screens/ThemeShowcaseScreen.tsx`

### Components
- Language switcher: `apps/mobile/src/components/LanguageSwitcher.tsx`

### Documentation
- Theme README: `apps/mobile/src/theme/README.md`
- Mission summary: `MISSIONS_6-10_COMPLETE.md`
- Implementation checklist: `IMPLEMENTATION_CHECKLIST.md`

## 🐛 Troubleshooting

### Theme not applying
```typescript
// Make sure App.tsx is wrapped with ThemeProvider
<ThemeProvider>
  <AppNavigator />
</ThemeProvider>
```

### Colors not updating
```typescript
// Use useTheme hook to get current colors
const { colors } = useTheme();

// Don't hardcode colors
// ❌ Bad
backgroundColor: '#FFFFFF'

// ✅ Good
backgroundColor: colors.background.secondary
```

### Spacing inconsistent
```typescript
// Use theme spacing constants
// ❌ Bad
padding: 16

// ✅ Good
padding: JapaneseTheme.spacing.base
```

## 💡 Tips & Best Practices

1. **Always use themed components** for new screens
2. **Access colors through useTheme()** hook
3. **Use spacing constants** from JapaneseTheme
4. **Test in both light and dark modes**
5. **Follow the 4px grid** for spacing
6. **Use semantic color names** (text.primary vs neutral.black)
7. **Maintain visual hierarchy** with font sizes
8. **Keep touch targets** at least 44x44 points
9. **Handle loading states** for all async operations
10. **Show meaningful error messages** to users

## 🎉 Quick Wins

### Convert existing screen to themed
1. Import themed components
2. Replace View → ThemedView
3. Replace Text → ThemedText
4. Use useTheme() for colors
5. Use spacing constants
6. Test in both themes

### Add new feature
1. Use themed components from start
2. Follow existing patterns
3. Integrate with API
4. Handle errors gracefully
5. Add loading states
6. Test thoroughly

---

**Need more help?**
- Check `apps/mobile/src/theme/README.md` for detailed theme docs
- View `ThemeShowcaseScreen.tsx` for component examples
- Review existing screens for patterns

**ACT Gen-1 - Quick Reference**
*Version 1.0.0*