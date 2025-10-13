/**
 * Theme Showcase Screen
 * 
 * This screen demonstrates all themed components and the Japanese theme design system.
 * Use this as a reference when building new screens.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { 
  ThemedView, 
  ThemedText, 
  ThemedCard, 
  ThemedButton, 
  ThemedInput,
  Header,
  Card,
  PrimaryButton,
  FAB,
  StreakFlame,
} from '../components/themed';

export default function ThemeShowcaseScreen() {
  const { theme, mode, setMode } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ThemedView variant="background" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* New Header Component */}
          <Header title="Japanese Theme Showcase" />

          {/* Typography Section */}
          <Card style={styles.section}>
            <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
              Typography Scale (8px Grid)
            </ThemedText>
            
            <View style={styles.subsection}>
              <ThemedText size="h1" weight="bold">H1 - 28px Bold</ThemedText>
              <ThemedText size="title" weight="bold">Title - 24px Bold</ThemedText>
              <ThemedText size="xl" weight="medium">XL - 20px Medium</ThemedText>
              <ThemedText size="lg" weight="regular">LG - 18px Regular</ThemedText>
              <ThemedText size="base" weight="regular">Base - 16px Regular</ThemedText>
              <ThemedText size="sm" weight="regular">SM - 14px Regular</ThemedText>
              <ThemedText size="xs" variant="secondary">XS - 12px Secondary</ThemedText>
            </View>
          </Card>

          {/* Colors Section */}
          <Card style={styles.section}>
            <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
              Japanese Color Palette
            </ThemedText>
            
            <View style={styles.subsection}>
              <ThemedText variant="primary">Primary Text (Sumi Black)</ThemedText>
              <ThemedText variant="secondary">Secondary Text</ThemedText>
              <ThemedText variant="accent">Accent Text (Aka Red)</ThemedText>
            </View>

            <View style={styles.colorGrid}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.accent }]}>
                <ThemedText variant="inverse" size="xs">Aka Red</ThemedText>
              </View>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.sumi }]}>
                <ThemedText variant="inverse" size="xs">Sumi</ThemedText>
              </View>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.matcha }]}>
                <ThemedText variant="inverse" size="xs">Matcha</ThemedText>
              </View>
            </View>
          </Card>

          {/* New Components Section */}
          <Card style={styles.section}>
            <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
              New Japanese Components
            </ThemedText>
            
            <View style={styles.subsection}>
              <PrimaryButton label="Primary Button" onPress={() => {}} />
              
              <View style={styles.streakContainer}>
                <StreakFlame days={7} />
              </View>
            </View>
          </Card>

          {/* Existing Themed Buttons */}
          <Card style={styles.section}>
            <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
              Themed Buttons
            </ThemedText>
            
            <View style={styles.subsection}>
              <ThemedButton onPress={() => {}}>
                Default Button
              </ThemedButton>
              
              <ThemedButton 
                loading={loading}
                onPress={handleLoadingDemo}
              >
                Loading Demo
              </ThemedButton>
              
              <ThemedButton disabled onPress={() => {}}>
                Disabled Button
              </ThemedButton>
            </View>
          </Card>

          {/* Inputs Section */}
          <Card style={styles.section}>
            <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
              Inputs
            </ThemedText>
            
            <View style={styles.subsection}>
              <ThemedInput
                label="Email"
                placeholder="Enter your email"
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="email-address"
              />
              
              <ThemedInput
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
              />
              
              <ThemedInput
                label="With Error"
                placeholder="This field has an error"
                error="This field is required"
              />
            </View>
          </Card>

          {/* Cards Section */}
          <Card style={styles.section}>
            <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
              Cards (ThemedCard)
            </ThemedText>
            
            <View style={styles.subsection}>
              <ThemedCard>
                <ThemedText>Default Card with 8px padding</ThemedText>
              </ThemedCard>
              
              <ThemedCard style={{ padding: theme.spacing(2) }}>
                <ThemedText>Card with 16px padding (spacing(2))</ThemedText>
              </ThemedCard>
              
              <ThemedCard style={{ padding: theme.spacing(3) }}>
                <ThemedText>Card with 24px padding (spacing(3))</ThemedText>
              </ThemedCard>
            </View>
          </Card>

          {/* Spacing Section */}
          <Card style={styles.section}>
            <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
              Spacing System (8px Grid)
            </ThemedText>
            
            <View style={styles.subsection}>
              <View style={styles.spacingDemo}>
                <View style={[styles.spacingBox, { height: theme.spacing(0.5) }]} />
                <ThemedText size="xs" variant="secondary">spacing(0.5) = 4px</ThemedText>
              </View>
              
              <View style={styles.spacingDemo}>
                <View style={[styles.spacingBox, { height: theme.spacing(1) }]} />
                <ThemedText size="xs" variant="secondary">spacing(1) = 8px</ThemedText>
              </View>
              
              <View style={styles.spacingDemo}>
                <View style={[styles.spacingBox, { height: theme.spacing(2) }]} />
                <ThemedText size="xs" variant="secondary">spacing(2) = 16px</ThemedText>
              </View>
              
              <View style={styles.spacingDemo}>
                <View style={[styles.spacingBox, { height: theme.spacing(3) }]} />
                <ThemedText size="xs" variant="secondary">spacing(3) = 24px</ThemedText>
              </View>
              
              <View style={styles.spacingDemo}>
                <View style={[styles.spacingBox, { height: theme.spacing(4) }]} />
                <ThemedText size="xs" variant="secondary">spacing(4) = 32px</ThemedText>
              </View>
            </View>
          </Card>

          {/* Theme Controls */}
          <Card style={styles.section}>
            <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
              Theme Controls
            </ThemedText>
            
            <View style={styles.subsection}>
              <ThemedText variant="secondary" style={styles.themeInfo}>
                Current Mode: {mode === 'dark' ? 'Dark' : 'Light'}
              </ThemedText>
              
              <View style={styles.themeButtons}>
                <ThemedButton 
                  onPress={() => setMode('light')}
                  style={styles.themeButton}
                >
                  Light
                </ThemedButton>
                
                <ThemedButton 
                  onPress={() => setMode('dark')}
                  style={styles.themeButton}
                >
                  Dark
                </ThemedButton>
              </View>
            </View>
          </Card>

          {/* Design Principles */}
          <Card style={styles.section}>
            <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
              Design Principles
            </ThemedText>
            
            <View style={styles.subsection}>
              <View style={styles.principleItem}>
                <ThemedText size="base" weight="bold">
                  引き算の美学 (Hikizan no Bigaku)
                </ThemedText>
                <ThemedText size="sm" variant="secondary">
                  Beauty of Subtraction - Remove unnecessary elements
                </ThemedText>
              </View>
              
              <View style={styles.principleItem}>
                <ThemedText size="base" weight="bold">
                  間 (Ma)
                </ThemedText>
                <ThemedText size="sm" variant="secondary">
                  Negative Space - Generous spacing and breathing room
                </ThemedText>
              </View>
              
              <View style={styles.principleItem}>
                <ThemedText size="base" weight="bold">
                  色 (Iro)
                </ThemedText>
                <ThemedText size="sm" variant="secondary">
                  Color Harmony - Sumi black, Aka red, Matcha green
                </ThemedText>
              </View>
            </View>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText size="sm" variant="secondary">
              ACT Gen-1 Japanese Theme
            </ThemedText>
            <ThemedText size="xs" variant="secondary">
              8px Grid System • Noto Sans JP • Minimal Palette
            </ThemedText>
          </View>

          {/* Spacer for FAB */}
          <View style={{ height: theme.spacing(10) }} />
        </ScrollView>

        {/* FAB Demo */}
        <FAB onPress={() => alert('FAB Pressed!')} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  subsection: {
    gap: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  colorBox: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacingDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spacingBox: {
    width: 100,
    backgroundColor: '#B71C1C',
    borderRadius: 4,
  },
  themeInfo: {
    marginBottom: 8,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
  },
  principleItem: {
    gap: 4,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  streakContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});