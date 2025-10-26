import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Line, Circle, G, Text as SvgText, Polyline } from "react-native-svg";
import { Entry } from "../api/entries";

interface LineGraphProps {
  entries: Entry[];
  height?: number;
  width?: number;
}

const COLORS = {
  mandatory: "#2196F3", // Blue
  neutral: "#9E9E9E", // Grey
  excess: "#F44336", // Red
};

export function LineGraph({
  entries,
  height = 250,
  width = 340,
}: LineGraphProps) {
  const graphData = useMemo(() => {
    // Get last 10 days
    const now = new Date();
    const days: { [key: string]: { mandatory: number; neutral: number; excess: number } } = {};

    // Initialize last 10 days
    for (let i = 9; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split("T")[0];
      days[dateKey] = { mandatory: 0, neutral: 0, excess: 0 };
    }

    // Aggregate expenses by day and type
    entries.forEach((entry) => {
      if (entry.type === "expense") {
        const dateKey = entry.booked_at.split("T")[0];
        if (dateKey in days) {
          const expenseType = entry.category?.expense_type || "neutral";
          days[dateKey][expenseType as keyof typeof days[string]] += entry.amount;
        }
      }
    });

    const sortedDays = Object.keys(days).sort();
    return { days: sortedDays, data: days };
  }, [entries]);

  if (graphData.days.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No expense data available</Text>
      </View>
    );
  }

  const padding = 50;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 1.5;
  const maxAmount = Math.max(
    ...graphData.days.map((day) => {
      const dayData = graphData.data[day];
      return dayData.mandatory + dayData.neutral + dayData.excess;
    }),
    100
  );

  // Calculate points for each line
  const points = {
    mandatory: graphData.days.map((day, idx) => {
      const x = padding + (idx / (graphData.days.length - 1)) * graphWidth;
      const y =
        height -
        padding / 2 -
        (graphData.data[day].mandatory / maxAmount) * graphHeight;
      return `${x},${y}`;
    }).join(" "),
    neutral: graphData.days.map((day, idx) => {
      const x = padding + (idx / (graphData.days.length - 1)) * graphWidth;
      const y =
        height -
        padding / 2 -
        (graphData.data[day].neutral / maxAmount) * graphHeight;
      return `${x},${y}`;
    }).join(" "),
    excess: graphData.days.map((day, idx) => {
      const x = padding + (idx / (graphData.days.length - 1)) * graphWidth;
      const y =
        height -
        padding / 2 -
        (graphData.data[day].excess / maxAmount) * graphHeight;
      return `${x},${y}`;
    }).join(" "),
  };

  // Calculate circle points
  const circlePoints = {
    mandatory: graphData.days.map((day, idx) => ({
      x: padding + (idx / (graphData.days.length - 1)) * graphWidth,
      y:
        height -
        padding / 2 -
        (graphData.data[day].mandatory / maxAmount) * graphHeight,
      value: graphData.data[day].mandatory,
    })),
    neutral: graphData.days.map((day, idx) => ({
      x: padding + (idx / (graphData.days.length - 1)) * graphWidth,
      y:
        height -
        padding / 2 -
        (graphData.data[day].neutral / maxAmount) * graphHeight,
      value: graphData.data[day].neutral,
    })),
    excess: graphData.days.map((day, idx) => ({
      x: padding + (idx / (graphData.days.length - 1)) * graphWidth,
      y:
        height -
        padding / 2 -
        (graphData.data[day].excess / maxAmount) * graphHeight,
      value: graphData.data[day].excess,
    })),
  };

  const yAxisLabels = [0, Math.round(maxAmount / 2), Math.round(maxAmount)];

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {yAxisLabels.map((label, idx) => {
          const y =
            height -
            padding / 2 -
            (label / maxAmount) * graphHeight;
          return (
            <Line
              key={`grid-${idx}`}
              x1={padding}
              y1={y}
              x2={width - padding / 2}
              y2={y}
              stroke="#e0e0e0"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          );
        })}

        {/* Y-axis */}
        <Line
          x1={padding}
          y1={padding / 2}
          x2={padding}
          y2={height - padding / 2}
          stroke="#333"
          strokeWidth="2"
        />

        {/* X-axis */}
        <Line
          x1={padding}
          y1={height - padding / 2}
          x2={width - padding / 2}
          y2={height - padding / 2}
          stroke="#333"
          strokeWidth="2"
        />

        {/* Y-axis labels */}
        {yAxisLabels.map((label, idx) => {
          const y =
            height -
            padding / 2 -
            (label / maxAmount) * graphHeight;
          return (
            <SvgText
              key={`ylabel-${idx}`}
              x={padding - 35}
              y={y + 5}
              fontSize="11"
              fill="#666"
              textAnchor="end"
            >
              ${label.toFixed(0)}
            </SvgText>
          );
        })}

        {/* X-axis labels (every 2 days to avoid crowding) */}
        {graphData.days.map((day, idx) => {
          if (idx % 2 === 0 || idx === graphData.days.length - 1) {
            const x =
              padding +
              (idx / (graphData.days.length - 1)) * graphWidth;
            const dayNum = day.split("-")[2];
            return (
              <SvgText
                key={`xlabel-${idx}`}
                x={x}
                y={height - padding / 2 + 18}
                fontSize="11"
                fill="#666"
                textAnchor="middle"
              >
                {dayNum}
              </SvgText>
            );
          }
        })}

        {/* Lines */}
        <Polyline
          points={points.mandatory}
          fill="none"
          stroke={COLORS.mandatory}
          strokeWidth="2.5"
        />
        <Polyline
          points={points.neutral}
          fill="none"
          stroke={COLORS.neutral}
          strokeWidth="2.5"
        />
        <Polyline
          points={points.excess}
          fill="none"
          stroke={COLORS.excess}
          strokeWidth="2.5"
        />

        {/* Data points */}
        {circlePoints.mandatory.map((point, idx) => (
          <Circle
            key={`mandatory-${idx}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={COLORS.mandatory}
          />
        ))}
        {circlePoints.neutral.map((point, idx) => (
          <Circle
            key={`neutral-${idx}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={COLORS.neutral}
          />
        ))}
        {circlePoints.excess.map((point, idx) => (
          <Circle
            key={`excess-${idx}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={COLORS.excess}
          />
        ))}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: COLORS.mandatory }]}
          />
          <Text style={styles.legendLabel}>Mandatory</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: COLORS.neutral }]}
          />
          <Text style={styles.legendLabel}>Neutral</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: COLORS.excess }]}
          />
          <Text style={styles.legendLabel}>Excess</Text>
        </View>
      </View>

      {/* Daily breakdown */}
      <View style={styles.dailyBreakdown}>
        <Text style={styles.breakdownTitle}>Last 10 Days Summary</Text>
        <View style={styles.breakdownGrid}>
          {graphData.days.map((day, idx) => {
            const dayData = graphData.data[day];
            const dayNum = day.split("-")[2];
            const total = dayData.mandatory + dayData.neutral + dayData.excess;
            return (
              <View key={day} style={styles.dayCard}>
                <Text style={styles.dayLabel}>Day {dayNum}</Text>
                {dayData.mandatory > 0 && (
                  <Text style={styles.dayAmount}>
                    <Text style={{ color: COLORS.mandatory }}>●</Text> $
                    {dayData.mandatory.toFixed(0)}
                  </Text>
                )}
                {dayData.neutral > 0 && (
                  <Text style={styles.dayAmount}>
                    <Text style={{ color: COLORS.neutral }}>●</Text> $
                    {dayData.neutral.toFixed(0)}
                  </Text>
                )}
                {dayData.excess > 0 && (
                  <Text style={styles.dayAmount}>
                    <Text style={{ color: COLORS.excess }}>●</Text> $
                    {dayData.excess.toFixed(0)}
                  </Text>
                )}
                {total === 0 && <Text style={styles.noData}>No expenses</Text>}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 12,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
  dailyBreakdown: {
    width: "100%",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  breakdownGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#eee",
    minWidth: 80,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  dayAmount: {
    fontSize: 11,
    color: "#333",
    marginBottom: 2,
  },
  noData: {
    fontSize: 11,
    color: "#ccc",
  },
});