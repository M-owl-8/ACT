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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getEntries,
  deleteEntry,
  getExpenseTypeStats,
  getEntryTotals,
  Entry,
  ExpenseTypeStats,
  EntryTotals,
} from "../api/entries";
import { ExpenseType } from "../api/categories";

type FilterType = "all" | ExpenseType;

export default function ExpensesScreen({ navigation }: any) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<ExpenseTypeStats | null>(null);
  const [totals, setTotals] = useState<EntryTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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

  const loadData = async (reset: boolean = false) => {
    try {
      const monthRange = getThisMonthRange();

      // Load entries (expense only)
      const entriesData = await getEntries({
        type: "expense",
        ...monthRange,
        limit: 100,
      });

      // Load stats for this month
      const statsData = await getExpenseTypeStats(monthRange);

      // Load totals for income
      const totalsData = await getEntryTotals({
        type: "income",
        ...monthRange,
      });

      setEntries(entriesData);
      setStats(statsData);
      setTotals(totalsData);
    } catch (error: any) {
      console.error("Failed to load expense data:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Failed to load expense data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, []);

  const handleDelete = (entry: Entry) => {
    Alert.alert(
      "Delete Expense",
      `Are you sure you want to delete this expense of $${entry.amount}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEntry(entry.id);
              Alert.alert("Success", "Expense entry deleted");
              loadData(true);
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
    navigation.navigate("EditExpense", { entry, onSave: () => loadData(true) });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredEntries = entries.filter((entry) => {
    if (selectedFilter === "all") return true;
    return entry.category?.expense_type === selectedFilter;
  });

  const getCategoryTotals = () => {
    const categoryTotals: Record<string, { amount: number; count: number }> = {};
    entries.forEach((entry) => {
      const categoryName = entry.category?.name || "Other";
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { amount: 0, count: 0 };
      }
      categoryTotals[categoryName].amount += entry.amount;
      categoryTotals[categoryName].count += 1;
    });
    return categoryTotals;
  };

  const categoryTotals = getCategoryTotals();

  const renderRecentTransaction = ({ item }: { item: Entry }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionName}>
        {item.category?.name || "Other"}
      </Text>
      <Text style={styles.transactionDate}>{formatDate(item.booked_at)}</Text>
      <Text style={styles.transactionAmount}>${item.amount.toFixed(2)}</Text>
    </View>
  );

  const renderCategoryItem = ({ item: [categoryName, data] }: any) => (
    <View style={styles.categoryRow}>
      <Text style={styles.categoryLabel}>{categoryName}</Text>
      <Text style={styles.categoryTotal}>
        ${data.amount.toFixed(2)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#FF5722"]}
          tintColor="#FF5722"
        />
      }
    >
      {/* Expense Summary Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="folder" size={20} color="#000" />
            <Text style={styles.cardTitle}>Expense Summary</Text>
          </View>
          <TouchableOpacity onPress={() => setShowDateDropdown(!showDateDropdown)}>
            <Text style={styles.filterDropdown}>Filter by Date: Select Date Range</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
            <Text style={styles.filterDropdown}>Filter by Category: Select Category</Text>
          </TouchableOpacity>
        </View>

        {/* Categories List */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={Object.entries(categoryTotals)}
            renderItem={renderCategoryItem}
            keyExtractor={([name]) => name}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No expenses this month</Text>
            }
          />
        </View>

        {/* Add Correction Button (placeholder) */}
        {Object.keys(categoryTotals).length > 0 && (
          <TouchableOpacity style={styles.addCorrectionButton}>
            <Text style={styles.addCorrectionText}>Add Correction</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Budget Overview Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="analytics" size={20} color="#000" />
            <Text style={styles.cardTitle}>Budget Overview</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Chart Placeholder */}
        <View style={styles.chartPlaceholder}>
          <View style={styles.pieChart} />
          <Text style={styles.chartLabel}>Pie Chart</Text>
        </View>

        {/* Budget Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Income</Text>
            <Text style={styles.statValue}>${totals?.total.toFixed(2) || "0"}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Expenses</Text>
            <Text style={styles.statValue}>${stats?.total.toFixed(2) || "0"}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Remaining Budget</Text>
            <Text style={[styles.statValue, styles.remainingPositive]}>
              ${((totals?.total || 0) - (stats?.total || 0)).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentTransactionsContainer}>
          <Text style={styles.recentTitle}>Recent Transactions</Text>
          <FlatList
            data={entries.slice(0, 3)}
            renderItem={renderRecentTransaction}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No recent transactions</Text>
            }
          />
        </View>

        {/* Add New Entry Button */}
        <TouchableOpacity
          style={styles.addNewEntryButton}
          onPress={() =>
            navigation.navigate("AddExpense", { onSave: () => loadData(true) })
          }
        >
          <Text style={styles.addNewEntryText}>Add New Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Add Expense FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("AddExpense", { onSave: () => loadData(true) })
        }
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingVertical: 16,
    paddingHorizontal: 12,
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  filterDropdown: {
    fontSize: 12,
    color: "#999",
    marginVertical: 4,
  },
  settingsButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryLabel: {
    fontSize: 14,
    color: "#333",
  },
  categoryTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  addCorrectionButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
    opacity: 0.5,
  },
  addCorrectionText: {
    fontSize: 14,
    color: "#999",
  },
  chartPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    paddingVertical: 20,
  },
  pieChart: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#f0f0f0",
    borderWidth: 8,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: "#999",
  },
  statsContainer: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  remainingPositive: {
    color: "#4CAF50",
  },
  recentTransactionsContainer: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  transactionName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    color: "#999",
    flex: 1,
    textAlign: "center",
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    flex: 0.5,
    textAlign: "right",
  },
  emptyText: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    paddingVertical: 12,
  },
  addNewEntryButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  addNewEntryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  fab: {
    position: "fixed",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF5722",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});