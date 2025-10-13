import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import JapaneseNightBackdrop from "../components/JapaneseNightBackdrop";

export default function BackdropDemoScreen() {
  const [intensity, setIntensity] = useState(0.85);
  const [vignetteOpacity, setVignetteOpacity] = useState(0.25);

  return (
    <View style={styles.container}>
      {/* Background */}
      <JapaneseNightBackdrop
        intensity={intensity}
        vignetteOpacity={vignetteOpacity}
      />

      {/* Content */}
      <SafeAreaView style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Japanese Night Backdrop</Text>
          <Text style={styles.subtitle}>
            A beautiful Japanese-inspired night scene with warm orange sky,
            glowing moon, and pagoda silhouettes
          </Text>

          {/* Intensity Control */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>
              Intensity: {intensity.toFixed(2)}
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIntensity(Math.max(0, intensity - 0.1))}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIntensity(Math.min(1, intensity + 0.1))}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vignette Control */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>
              Vignette: {vignetteOpacity.toFixed(2)}
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  setVignetteOpacity(Math.max(0, vignetteOpacity - 0.05))
                }
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  setVignetteOpacity(Math.min(1, vignetteOpacity + 0.05))
                }
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Presets */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>Presets</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => {
                  setIntensity(0.3);
                  setVignetteOpacity(0.1);
                }}
              >
                <Text style={styles.presetText}>Subtle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => {
                  setIntensity(0.85);
                  setVignetteOpacity(0.25);
                }}
              >
                <Text style={styles.presetText}>Default</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => {
                  setIntensity(1.0);
                  setVignetteOpacity(0.4);
                }}
              >
                <Text style={styles.presetText}>Dramatic</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featureSection}>
            <Text style={styles.featureTitle}>Features:</Text>
            <Text style={styles.featureText}>✨ Warm orange sky gradient</Text>
            <Text style={styles.featureText}>🌕 Huge glowing moon with halo</Text>
            <Text style={styles.featureText}>🏯 Layered pagoda silhouettes</Text>
            <Text style={styles.featureText}>🌫️ Mist bands across horizon</Text>
            <Text style={styles.featureText}>🎨 Customizable intensity</Text>
          </View>
        </ScrollView>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  controlSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  controlLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  presetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  presetButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  presetText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featureSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featureText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});