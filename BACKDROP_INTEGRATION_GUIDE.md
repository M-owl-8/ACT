# JapaneseNightBackdrop Integration Guide

This guide shows you how to integrate the JapaneseNightBackdrop component into your existing ACT Gen-1 mobile app screens.

## ✅ What's Been Done

1. ✅ **Component Created**: `apps/mobile/src/components/JapaneseNightBackdrop.tsx`
2. ✅ **Dependencies Added**: `react-native-svg` and `expo-linear-gradient` added to package.json
3. ✅ **Demo Screen Created**: `apps/mobile/src/screens/BackdropDemoScreen.tsx`
4. ✅ **Documentation**: Complete README in `apps/mobile/src/components/README.md`

## 🚀 Quick Start

### Step 1: Install Dependencies (if needed)

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm install
```

### Step 2: Test the Demo Screen

Add the demo screen to your navigation in `App.tsx`:

```tsx
import BackdropDemoScreen from './src/screens/BackdropDemoScreen';

// In your Stack.Navigator:
<Stack.Screen 
  name="BackdropDemo" 
  component={BackdropDemoScreen}
  options={{ headerShown: false }}
/>
```

Then navigate to it to see the backdrop in action!

## 📝 Integration Examples

### Example 1: Add to LoginScreen

**File**: `apps/mobile/src/screens/LoginScreen.tsx`

```tsx
// Add import at the top
import JapaneseNightBackdrop from '../components/JapaneseNightBackdrop';

// Replace the existing container View:
export default function LoginScreen({ navigation }: Props) {
  // ... existing code ...

  return (
    <View style={styles.container}>
      {/* Add backdrop */}
      <JapaneseNightBackdrop intensity={0.85} vignetteOpacity={0.25} />
      
      {/* Existing content */}
      <SafeAreaView style={styles.content}>
        {/* ... rest of your existing code ... */}
      </SafeAreaView>
    </View>
  );
}

// Update styles to ensure proper layering:
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // ... rest of your styles ...
});
```

### Example 2: Add to RegisterScreen

**File**: `apps/mobile/src/screens/RegisterScreen.tsx`

```tsx
// Add import at the top
import JapaneseNightBackdrop from '../components/JapaneseNightBackdrop';

// Wrap your existing content:
export default function RegisterScreen({ navigation }: Props) {
  // ... existing code ...

  return (
    <View style={styles.container}>
      {/* Add backdrop */}
      <JapaneseNightBackdrop intensity={0.9} vignetteOpacity={0.3} />
      
      {/* Existing content */}
      <SafeAreaView style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* ... rest of your existing code ... */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Ensure container has flex: 1
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ... rest of your styles ...
});
```

### Example 3: Add to ProfileScreen

**File**: `apps/mobile/src/screens/ProfileScreen.tsx`

```tsx
// Add import at the top
import JapaneseNightBackdrop from '../components/JapaneseNightBackdrop';

// Wrap your existing content:
export default function ProfileScreen() {
  // ... existing code ...

  return (
    <View style={styles.container}>
      {/* Add backdrop with subtle intensity */}
      <JapaneseNightBackdrop intensity={0.7} vignetteOpacity={0.2} />
      
      {/* Existing content */}
      <SafeAreaView style={styles.content}>
        {/* ... rest of your existing code ... */}
      </SafeAreaView>
    </View>
  );
}
```

## 🎨 Recommended Settings by Screen Type

### Login/Register Screens
```tsx
<JapaneseNightBackdrop intensity={0.85} vignetteOpacity={0.25} />
```
- **Why**: Balanced, welcoming, professional

### Profile/Settings Screens
```tsx
<JapaneseNightBackdrop intensity={0.7} vignetteOpacity={0.2} />
```
- **Why**: Subtle, doesn't distract from content

### Splash/Welcome Screens
```tsx
<JapaneseNightBackdrop intensity={1.0} vignetteOpacity={0.4} />
```
- **Why**: Dramatic, makes a strong first impression

### Content/Reading Screens
```tsx
<JapaneseNightBackdrop intensity={0.5} vignetteOpacity={0.15} />
```
- **Why**: Very subtle, prioritizes readability

## 🎯 Complete Integration Checklist

### For Each Screen:

- [ ] Import the component
- [ ] Wrap content in a container View with `flex: 1`
- [ ] Add `<JapaneseNightBackdrop />` as first child
- [ ] Ensure SafeAreaView is used for content
- [ ] Test text readability (add text shadows if needed)
- [ ] Test on both light and dark system themes
- [ ] Test on different screen sizes

### Text Readability Enhancement:

If text is hard to read, add these styles:

```tsx
const textStyle = {
  color: "#fff",
  textShadowColor: "rgba(0, 0, 0, 0.75)",
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 10,
};
```

### Button Enhancement:

For better button visibility:

```tsx
const buttonStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.3)",
  // Add shadow for depth
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 5,
};
```

## 🔧 Advanced Customization

### Dynamic Intensity Based on Time

```tsx
import { useState, useEffect } from 'react';

function useTimeBasedIntensity() {
  const [intensity, setIntensity] = useState(0.85);

  useEffect(() => {
    const hour = new Date().getHours();
    // More dramatic at night (6 PM - 6 AM)
    if (hour >= 18 || hour < 6) {
      setIntensity(1.0);
    } else {
      setIntensity(0.7);
    }
  }, []);

  return intensity;
}

// Usage:
export default function MyScreen() {
  const intensity = useTimeBasedIntensity();
  
  return (
    <View style={styles.container}>
      <JapaneseNightBackdrop intensity={intensity} />
      {/* ... */}
    </View>
  );
}
```

### Animated Intensity

```tsx
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function MyScreen() {
  const intensityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Pulse effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(intensityAnim, {
          toValue: 1.0,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(intensityAnim, {
          toValue: 0.5,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <JapaneseNightBackdrop 
        intensity={intensityAnim} 
        vignetteOpacity={0.25}
      />
      {/* ... */}
    </View>
  );
}
```

## 🧪 Testing

### Manual Testing Checklist:

1. **Visual Testing**
   - [ ] Backdrop displays correctly
   - [ ] Moon is visible and glowing
   - [ ] Pagodas are visible
   - [ ] Gradient is smooth
   - [ ] No visual glitches

2. **Interaction Testing**
   - [ ] Content is readable
   - [ ] Buttons are clickable
   - [ ] Forms work correctly
   - [ ] Scrolling is smooth

3. **Device Testing**
   - [ ] Test on iOS simulator
   - [ ] Test on Android emulator
   - [ ] Test on real iOS device
   - [ ] Test on real Android device
   - [ ] Test on different screen sizes

4. **Performance Testing**
   - [ ] No lag when rendering
   - [ ] Smooth animations (if any)
   - [ ] No memory leaks
   - [ ] Fast screen transitions

## 🐛 Common Issues & Solutions

### Issue: Backdrop not visible
**Solution**: Ensure parent View has `flex: 1` or explicit dimensions

```tsx
<View style={{ flex: 1 }}>
  <JapaneseNightBackdrop />
  {/* content */}
</View>
```

### Issue: Content not visible over backdrop
**Solution**: Ensure content has proper z-index and SafeAreaView

```tsx
<View style={{ flex: 1 }}>
  <JapaneseNightBackdrop />
  <SafeAreaView style={{ flex: 1, zIndex: 1 }}>
    {/* content */}
  </SafeAreaView>
</View>
```

### Issue: Text hard to read
**Solution**: Add text shadows and increase vignette opacity

```tsx
<JapaneseNightBackdrop vignetteOpacity={0.4} />

// And for text:
<Text style={{
  color: "#fff",
  textShadowColor: "rgba(0, 0, 0, 0.75)",
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 10,
}}>
  Your text
</Text>
```

### Issue: Performance lag
**Solution**: Use only one backdrop per screen, avoid frequent prop changes

```tsx
// ❌ Don't do this:
{screens.map(screen => (
  <View key={screen}>
    <JapaneseNightBackdrop />
  </View>
))}

// ✅ Do this:
<View style={{ flex: 1 }}>
  <JapaneseNightBackdrop />
  {/* All your screens/content */}
</View>
```

## 📱 Example: Complete Screen Integration

Here's a complete example of a well-integrated screen:

```tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import JapaneseNightBackdrop from "../components/JapaneseNightBackdrop";

export default function MyScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Your logic here
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <JapaneseNightBackdrop intensity={0.85} vignetteOpacity={0.25} />

      {/* Content */}
      <SafeAreaView style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Enter your details</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
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
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    padding: 16,
    fontSize: 16,
    color: "#fff",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
```

## 🎉 Next Steps

1. **Test the demo screen** to see the backdrop in action
2. **Choose which screens** you want to add the backdrop to
3. **Follow the integration examples** above
4. **Customize intensity and vignette** to your preference
5. **Test on real devices** for best results

## 📚 Additional Resources

- Component README: `apps/mobile/src/components/README.md`
- Demo Screen: `apps/mobile/src/screens/BackdropDemoScreen.tsx`
- Component Source: `apps/mobile/src/components/JapaneseNightBackdrop.tsx`

---

**Happy coding! 🚀**