import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path, G, Text as SvgText } from "react-native-svg";

interface PieChartProps {
  mandatory: number;
  neutral: number;
  excess: number;
  size?: number;
}

const COLORS = {
  mandatory: "#2196F3", // Blue
  neutral: "#9E9E9E", // Grey
  excess: "#F44336", // Red
};

export function PieChart({
  mandatory,
  neutral,
  excess,
  size = 200,
}: PieChartProps) {
  const total = mandatory + neutral + excess;

  if (total === 0) {
    return (
      <View style={styles.container}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle cx={size / 2} cy={size / 2} r={size / 2 - 10} fill="#f0f0f0" />
        </Svg>
        <Text style={styles.emptyText}>No expenses yet</Text>
      </View>
    );
  }

  const radius = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;

  // Calculate angles (in degrees)
  const mandatoryPercent = mandatory / total;
  const neutralPercent = neutral / total;
  const excessPercent = excess / total;

  // Convert to angles (0-360)
  const mandatoryAngle = mandatoryPercent * 360;
  const neutralAngle = neutralPercent * 360;
  const excessAngle = excessPercent * 360;

  // Convert angles to radians
  const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

  // Calculate path for each segment
  const getSlicePath = (
    startAngle: number,
    endAngle: number,
    radius: number
  ) => {
    const start = degreesToRadians(startAngle);
    const end = degreesToRadians(endAngle);

    const x1 = cx + radius * Math.cos(start - Math.PI / 2);
    const y1 = cy + radius * Math.sin(start - Math.PI / 2);
    const x2 = cx + radius * Math.cos(end - Math.PI / 2);
    const y2 = cy + radius * Math.sin(end - Math.PI / 2);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Calculate label positions
  const getLabelPosition = (startAngle: number, sliceAngle: number) => {
    const midAngle = startAngle + sliceAngle / 2;
    const angle = degreesToRadians(midAngle);
    const labelRadius = radius * 0.65;

    return {
      x: cx + labelRadius * Math.cos(angle - Math.PI / 2),
      y: cy + labelRadius * Math.sin(angle - Math.PI / 2),
    };
  };

  // Calculate paths
  const mandatoryPath = getSlicePath(0, mandatoryAngle, radius);
  const neutralPath = getSlicePath(mandatoryAngle, mandatoryAngle + neutralAngle, radius);
  const excessPath = getSlicePath(
    mandatoryAngle + neutralAngle,
    360,
    radius
  );

  // Label positions
  const mandatoryLabel = getLabelPosition(0, mandatoryAngle);
  const neutralLabel = getLabelPosition(mandatoryAngle, neutralAngle);
  const excessLabel = getLabelPosition(mandatoryAngle + neutralAngle, excessAngle);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {/* Mandatory segment */}
          <Path d={mandatoryPath} fill={COLORS.mandatory} />
          
          {/* Neutral segment */}
          <Path d={neutralPath} fill={COLORS.neutral} />
          
          {/* Excess segment */}
          <Path d={excessPath} fill={COLORS.excess} />

          {/* Mandatory label */}
          {mandatoryPercent > 0.05 && (
            <SvgText
              x={mandatoryLabel.x}
              y={mandatoryLabel.y}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="white"
            >
              {Math.round(mandatoryPercent * 100)}%
            </SvgText>
          )}

          {/* Neutral label */}
          {neutralPercent > 0.05 && (
            <SvgText
              x={neutralLabel.x}
              y={neutralLabel.y}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="white"
            >
              {Math.round(neutralPercent * 100)}%
            </SvgText>
          )}

          {/* Excess label */}
          {excessPercent > 0.05 && (
            <SvgText
              x={excessLabel.x}
              y={excessLabel.y}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="white"
            >
              {Math.round(excessPercent * 100)}%
            </SvgText>
          )}
        </G>
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: COLORS.mandatory }]}
          />
          <Text style={styles.legendLabel}>Mandatory</Text>
          <Text style={styles.legendAmount}>${mandatory.toFixed(2)}</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: COLORS.neutral }]}
          />
          <Text style={styles.legendLabel}>Neutral</Text>
          <Text style={styles.legendAmount}>${neutral.toFixed(2)}</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: COLORS.excess }]}
          />
          <Text style={styles.legendLabel}>Excess</Text>
          <Text style={styles.legendAmount}>${excess.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  legend: {
    marginTop: 16,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
    flex: 1,
  },
  legendAmount: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
});