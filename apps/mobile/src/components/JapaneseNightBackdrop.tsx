import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
  Use,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  /** 0–1, how much warm glow (0 = subtle, 1 = dramatic) */
  intensity?: number;
  /** Optional overlay darkness for foreground content readability */
  vignetteOpacity?: number;
};

/**
 * Japanese-inspired night scene:
 * - Warm orange sky gradient
 * - Huge glowing moon with halo
 * - Layered pagoda silhouettes (parallax-like depth)
 * - Mist bands across horizon
 */
export default function JapaneseNightBackdrop({
  intensity = 0.85,
  vignetteOpacity = 0.25,
}: Props) {
  // Colors (tuned for Japanese-night vibe)
  const skyTop = "#0B0E13";
  const skyMid = "#311a12";
  const skyWarm = "#8e3f1b";
  const moonCore = "#ffd06b";
  const moonEdge = "#ffad33";
  const mist = "#ffcf8a";
  const farSilhouette = "#2a1b17";
  const midSilhouette = "#1f1512";
  const nearSilhouette = "#140f0d";

  // Normalize intensity
  const I = Math.max(0, Math.min(1, intensity));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Soft vertical warm gradient behind the SVG (bleeds into safe areas) */}
      <LinearGradient
        colors={[skyTop, skyMid, skyWarm]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <Defs>
          {/* Radial gradient for the moon glow */}
          <RadialGradient id="moonGlow" cx="50%" cy="28%" r="35%">
            <Stop offset="0%" stopColor={moonCore} stopOpacity={0.95} />
            <Stop offset="55%" stopColor={moonEdge} stopOpacity={0.55 + 0.25 * I} />
            <Stop offset="100%" stopColor={moonEdge} stopOpacity={0.0} />
          </RadialGradient>

          {/* Subtle vertical sky enhancement */}
          <SvgLinearGradient id="skyTint" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#000" stopOpacity={0.25} />
            <Stop offset="100%" stopColor="#000" stopOpacity={0.05} />
          </SvgLinearGradient>

          {/* Mist bands */}
          <SvgLinearGradient id="mistBand" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={mist} stopOpacity={0.12 + 0.10 * I} />
            <Stop offset="100%" stopColor={mist} stopOpacity={0.0} />
          </SvgLinearGradient>

          {/* Reusable pagoda silhouette path (stylized) */}
          <Path
            id="pagoda"
            d="
              M 0 0
              l 48 0
              l -3 5 l -42 0 z
              m 6 8
              l 36 0 l -2 4 l -32 0 z
              m 6 10
              l 24 0 l -2 4 l -20 0 z
              m 8 10
              l 8 0 l -1 3 l -6 0 z
              m -22 -36
              l 0 46
            "
          />
        </Defs>

        {/* Dark tint to deepen top */}
        <Rect x="0" y="0" width="390" height="844" fill="url(#skyTint)" />

        {/* Massive moon w/ halo */}
        <Circle cx="195" cy="210" r={140} fill="url(#moonGlow)" />
        {/* Extra halos for depth */}
        <Circle cx="195" cy="210" r={170} fill={moonEdge} opacity={0.08 + 0.10 * I} />
        <Circle cx="195" cy="210" r={200} fill={moonEdge} opacity={0.04 + 0.06 * I} />

        {/* Far city silhouette line */}
        <G opacity={0.45}>
          <Path
            d="M -20 420
               C 40 400, 100 430, 150 420
               C 200 410, 260 425, 320 415
               L 420 440 L -20 440 Z"
            fill={farSilhouette}
          />
        </G>

        {/* Mist layers */}
        <G>
          <Rect x="-10" y="430" width="420" height="90" fill="url(#mistBand)" />
          <Rect x="-10" y="500" width="420" height="90" fill="url(#mistBand)" opacity={0.8} />
        </G>

        {/* Mid-ground pagodas */}
        <G fill={midSilhouette} opacity={0.9}>
          <G transform="translate(300,430) scale(1.2)">
            <Use href="#pagoda" />
          </G>
          <G transform="translate(60,445) scale(1.0)">
            <Use href="#pagoda" />
          </G>
          <G transform="translate(200,455) scale(0.9)">
            <Use href="#pagoda" />
          </G>
        </G>

        {/* Near-ground ridge */}
        <Path
          d="M -20 560
             C 60 540, 140 580, 220 560
             C 300 540, 360 575, 420 560
             L 420 860 L -20 860 Z"
          fill={nearSilhouette}
          opacity={0.95}
        />

        {/* Near pagoda (foreground) */}
        <G fill={nearSilhouette}>
          <G transform="translate(275,520) scale(1.5)">
            <Use href="#pagoda" />
          </G>
        </G>
      </Svg>

      {/* Vignette to lift foreground contrast */}
      <LinearGradient
        colors={["rgba(0,0,0,0)", `rgba(0,0,0,${vignetteOpacity})`]}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}