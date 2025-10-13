# Japanese Theme - ACT Gen-1

## Overview
The Japanese theme for ACT Gen-1 is inspired by traditional Japanese design principles, emphasizing minimalism, clean lines, and a focused color palette.

## Design Principles

### 1. **引き算の美学 (Hikizan no Bigaku) - Beauty of Subtraction**
- Remove unnecessary elements
- Focus on essential functionality
- Clean, uncluttered interfaces

### 2. **間 (Ma) - Negative Space**
- Generous spacing between elements
- Breathing room for content
- Vertical rhythm based on 4px grid

### 3. **色 (Iro) - Color Harmony**
- Primary: Red (#D32F2F) - Energy and action
- Neutral: Black/White - Clarity and focus
- Minimal use of additional colors

## Color Palette

### Light Mode
```
Primary Red:    #D32F2F
Black:          #212121
White:          #FFFFFF
Background:     #FAFAFA
Gray Scale:     #757575, #BDBDBD, #E0E0E0
```

### Dark Mode
```
Primary Red:    #EF5350
Black:          #FAFAFA (inverted)
White:          #121212 (inverted)
Background:     #121212
Gray Scale:     Inverted from light mode
```

## Typography

### Font Sizes (4px grid)
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px
- 2xl: 24px
- 3xl: 28px
- 4xl: 32px
- 5xl: 40px

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Spacing System
Based on 4px grid for vertical rhythm:
- xs: 4px
- sm: 8px
- md: 12px
- base: 16px
- lg: 20px
- xl: 24px
- 2xl: 32px
- 3xl: 40px
- 4xl: 48px
- 5xl: 64px

## Components

### ThemedView
Container component with theme-aware background colors.

```tsx
<ThemedView variant="primary">
  {/* Content */}
</ThemedView>
```

Variants: `primary`, `secondary`, `tertiary`, `transparent`

### ThemedText
Text component with theme-aware colors and typography.

```tsx
<ThemedText 
  variant="primary" 
  size="lg" 
  weight="bold"
>
  Hello World
</ThemedText>
```

Variants: `primary`, `secondary`, `disabled`, `inverse`, `error`, `success`
Sizes: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`
Weights: `light`, `regular`, `medium`, `semibold`, `bold`

### ThemedCard
Card component with elevation and padding.

```tsx
<ThemedCard elevation="base" padding="lg">
  {/* Content */}
</ThemedCard>
```

Elevations: `sm`, `base`, `md`, `lg`
Padding: Any spacing key

### ThemedButton
Button component with variants and loading states.

```tsx
<ThemedButton 
  variant="primary" 
  size="base"
  loading={false}
  onPress={handlePress}
>
  Click Me
</ThemedButton>
```

Variants: `primary`, `secondary`, `ghost`
Sizes: `sm`, `base`, `lg`

### ThemedInput
Input component with label and error states.

```tsx
<ThemedInput
  label="Email"
  error="Invalid email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
/>
```

## Usage

### 1. Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. Use the theme hook

```tsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { colors, isDark, theme, setThemeMode } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>
        Hello World
      </Text>
    </View>
  );
}
```

### 3. Use themed components

```tsx
import { ThemedView, ThemedText, ThemedButton } from './components/themed';

function MyScreen() {
  return (
    <ThemedView variant="primary">
      <ThemedText size="2xl" weight="bold">
        Welcome
      </ThemedText>
      <ThemedButton variant="primary" onPress={handlePress}>
        Get Started
      </ThemedButton>
    </ThemedView>
  );
}
```

## Theme Modes

The app supports three theme modes:
- **Light**: Always use light theme
- **Dark**: Always use dark theme
- **Auto**: Follow system preference

Users can change the theme mode in Settings.

## Accessibility

- Minimum touch target size: 44x44 points
- Sufficient color contrast ratios
- Clear visual hierarchy
- Readable font sizes

## Best Practices

1. **Use themed components** instead of raw React Native components when possible
2. **Access colors through the theme** instead of hardcoding
3. **Follow the spacing system** for consistent vertical rhythm
4. **Use semantic color names** (e.g., `colors.text.primary` instead of `colors.neutral.black`)
5. **Test in both light and dark modes**
6. **Maintain visual hierarchy** with font sizes and weights

## Migration Guide

To migrate existing screens to use the Japanese theme:

1. Import themed components:
```tsx
import { ThemedView, ThemedText, ThemedCard } from '../components/themed';
import { useTheme } from '../contexts/ThemeContext';
```

2. Replace View with ThemedView:
```tsx
// Before
<View style={{ backgroundColor: '#FFFFFF' }}>

// After
<ThemedView variant="secondary">
```

3. Replace Text with ThemedText:
```tsx
// Before
<Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>

// After
<ThemedText size="2xl" weight="bold">
```

4. Use theme colors for custom styles:
```tsx
const { colors } = useTheme();

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderColor: colors.border.light,
  },
});
```

## Future Enhancements

- [ ] Add subtle washi paper texture to backgrounds
- [ ] Implement custom Japanese-inspired icons
- [ ] Add animation presets following Japanese aesthetics
- [ ] Create seasonal color variations
- [ ] Add haptic feedback patterns
- [ ] Implement gesture-based interactions

## References

- Japanese Design Principles
- Material Design (for technical implementation)
- iOS Human Interface Guidelines (for accessibility)