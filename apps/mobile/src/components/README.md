# JapaneseNightBackdrop Component

A beautiful, customizable Japanese-inspired night scene backdrop component for React Native/Expo applications.

## 🎨 Features

- **Warm Orange Sky Gradient** - Creates an authentic Japanese sunset/night atmosphere
- **Huge Glowing Moon with Halo** - Multiple layers for realistic depth
- **Layered Pagoda Silhouettes** - Parallax-like depth effect with multiple pagodas
- **Mist Bands Across Horizon** - Adds atmospheric depth and mystery
- **Fully Customizable** - Control intensity and vignette opacity
- **Performance Optimized** - Uses SVG for crisp rendering at any size
- **Responsive** - Adapts to any screen size

## 📦 Installation

The component requires two dependencies:

```bash
npm install react-native-svg expo-linear-gradient
```

Or with Expo:

```bash
npx expo install react-native-svg expo-linear-gradient
```

## 🚀 Usage

### Basic Usage

```tsx
import React from "react";
import { View, Text } from "react-native";
import JapaneseNightBackdrop from "../components/JapaneseNightBackdrop";

export default function MyScreen() {
  return (
    <View style={{ flex: 1 }}>
      <JapaneseNightBackdrop />
      
      {/* Your content here */}
      <Text style={{ color: "white", fontSize: 24 }}>
        Hello World
      </Text>
    </View>
  );
}
```

### With Custom Settings

```tsx
<JapaneseNightBackdrop 
  intensity={0.85}        // 0 = subtle, 1 = dramatic
  vignetteOpacity={0.25}  // Darkness overlay for readability
/>
```

### Full Example with SafeAreaView

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import JapaneseNightBackdrop from "../components/JapaneseNightBackdrop";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      {/* Background */}
      <JapaneseNightBackdrop intensity={0.9} vignetteOpacity={0.3} />
      
      {/* Content */}
      <SafeAreaView style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        {/* Your form fields here */}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
});
```

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `number` | `0.85` | Controls the warm glow intensity. Range: 0-1. Lower values create a subtle effect, higher values create a dramatic effect. |
| `vignetteOpacity` | `number` | `0.25` | Controls the darkness overlay at the bottom for better text readability. Range: 0-1. |

## 🎭 Presets

Here are some recommended preset combinations:

### Subtle
```tsx
<JapaneseNightBackdrop intensity={0.3} vignetteOpacity={0.1} />
```
Perfect for: Informational screens, reading content

### Default (Balanced)
```tsx
<JapaneseNightBackdrop intensity={0.85} vignetteOpacity={0.25} />
```
Perfect for: Login screens, welcome screens, general use

### Dramatic
```tsx
<JapaneseNightBackdrop intensity={1.0} vignetteOpacity={0.4} />
```
Perfect for: Splash screens, hero sections, dramatic presentations

## 🎨 Design Details

The component creates a layered scene with:

1. **Sky Gradient** - Three-color gradient from dark blue-black at top to warm orange at bottom
2. **Moon** - Large glowing moon at 28% from top with multiple halo layers
3. **Far Silhouettes** - Distant city/mountain line at ~50% height
4. **Mist Layers** - Two overlapping mist bands for atmospheric depth
5. **Mid-ground Pagodas** - Three pagodas at different scales and positions
6. **Near-ground Ridge** - Foreground landscape element
7. **Near Pagoda** - Large foreground pagoda for depth
8. **Vignette** - Bottom gradient overlay for content readability

## 💡 Tips

### Text Readability
For best text readability over the backdrop:

```tsx
const textStyle = {
  color: "#fff",
  textShadowColor: "rgba(0, 0, 0, 0.75)",
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 10,
};
```

### Button Styling
For buttons that work well with the backdrop:

```tsx
const buttonStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.3)",
  padding: 16,
};
```

### Input Fields
For input fields:

```tsx
const inputStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.3)",
  color: "#fff",
  padding: 12,
};
```

## 🔧 Customization

To customize the colors, edit the component file and modify these constants:

```tsx
const skyTop = "#0B0E13";        // Top of sky
const skyMid = "#311a12";        // Middle of sky
const skyWarm = "#8e3f1b";       // Bottom of sky (warm orange)
const moonCore = "#ffd06b";      // Moon center
const moonEdge = "#ffad33";      // Moon edge/glow
const mist = "#ffcf8a";          // Mist color
const farSilhouette = "#2a1b17"; // Far buildings
const midSilhouette = "#1f1512"; // Mid pagodas
const nearSilhouette = "#140f0d"; // Near elements
```

## 📱 Demo Screen

A demo screen is included at `src/screens/BackdropDemoScreen.tsx` that allows you to:
- Adjust intensity in real-time
- Adjust vignette opacity in real-time
- Try different presets
- See all features listed

To use the demo screen, add it to your navigation:

```tsx
<Stack.Screen 
  name="BackdropDemo" 
  component={BackdropDemoScreen}
  options={{ headerShown: false }}
/>
```

## 🎯 Use Cases

Perfect for:
- ✅ Login/Register screens
- ✅ Welcome/Onboarding screens
- ✅ Profile screens
- ✅ Settings screens
- ✅ Splash screens
- ✅ About screens
- ✅ Any screen needing an elegant background

## 🐛 Troubleshooting

### Component not displaying
- Ensure `react-native-svg` and `expo-linear-gradient` are installed
- Check that the parent View has `flex: 1` or explicit dimensions
- Verify no other absolute positioned elements are covering it

### Colors look different
- SVG rendering may vary slightly between platforms
- Test on actual devices for accurate colors
- Adjust intensity/vignette for your specific needs

### Performance issues
- The component is optimized, but if you experience issues:
  - Reduce the number of backdrop instances (use only one per screen)
  - Avoid animating the backdrop props frequently
  - Consider using a static image for very low-end devices

## 📄 License

This component is part of the ACT Gen-1 project.

## 🤝 Contributing

To improve this component:
1. Test on multiple devices
2. Suggest color palette improvements
3. Add animation capabilities
4. Create additional backdrop variants

---

**Created with ❤️ for beautiful mobile experiences**