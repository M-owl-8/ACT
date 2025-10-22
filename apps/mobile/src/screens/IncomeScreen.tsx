import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getEntries,
  deleteEntry,
  getEntryTotals,
  Entry,
  EntryTotals,
} from "../api/entries";

export default function IncomeScreen({ navigation }: any) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [totals, setTotals] = useState<EntryTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("This Month");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Date range for "this month"
  const getThisMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    };
  };

  const loadData = async () => {
    try {
      const monthRange = getThisMonthRange();

      // Load entries (income only)
      const entriesData = await getEntries({
        type: "income",
        ...monthRange,
        limit: 100,
      });

      // Load totals for this month
      const totalsData = await getEntryTotals({
        type: "income",
        ...monthRange,
      });

      setEntries(entriesData);
      setTotals(totalsData);
    } catch (error: any) {
      console.error("Failed to load income data:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Failed to load income data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleDelete = (entry: Entry) => {
    Alert.alert(
      "Delete Income",
      `Are you sure you want to delete this income entry of $${entry.amount}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEntry(entry.id);
              Alert.alert("Success", "Income entry deleted");
              loadData();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.detail || "Failed to delete entry"
              );
            }
          },
        },
      ]
    );
  };

  const handleEdit = (entry: Entry) => {
    navigation.navigate("EditIncome", { entry, onSave: loadData });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderEntry = ({ item }: { item: Entry }) => (
    <View style={styles.entryItem}>
      <View style={styles.entryContent}>
        <Text style={styles.entrySource}>
          {item.note || item.category?.name || "Income"}
        </Text>
        <Text style={styles.entryDate}>{formatDate(item.booked_at)}</Text>
      </View>
      <Text style={styles.entryAmount}>${item.amount.toFixed(2)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading income...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Logo and Title */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Ionicons name="folder" size={24} color="#000" />
          <Text style={styles.headerTitle}>Income</Text>
          <Text style={styles.headerSubtitle}>Summary</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowDateDropdown(!showDateDropdown)}
          >
            <Text style={styles.filterButtonText}>{selectedDateRange}</Text>
            <Ionicons name="chevron-down" size={16} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={styles.filterButtonText}>{selectedCategory}</Text>
            <Ionicons name="chevron-down" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Chart placeholder */}
        <View style={styles.chartContainer}>
          <View style={styles.chart}>
            <Text style={styles.chartLabel}>Income Trend</Text>
            {/* Placeholder for chart - can be replaced with actual chart library */}
            <View style={styles.chartArea} />
          </View>
        </View>
      </View>

      {/* Income Items List */}
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4CAF50"]}
            tintColor="#4CAF50"
          />
        }
        ListHeaderComponent={
          <>
            {totals && (
              <View style={styles.totalsHeader}>
                <Text style={styles.totalsLabel}>Total Income</Text>
                <Text style={styles.totalsAmount}>
                  ${totals?.total.toFixed(2) || "0.00"}
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cash-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No income entries yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first income
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddIncome", { onSave: loadData })}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterButtonText: {
    fontSize: 13,
    color: "#999",
  },
  chartContainer: {
    marginBottom: 0,
  },
  chart: {
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
  },
  chartLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  chartArea: {
    height: 80,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  totalsHeader: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  totalsLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  totalsAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4CAF50",
  },
  entryItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  entryContent: {
    flex: 1,
  },
  entrySource: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 12,
    color: "#999",
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});