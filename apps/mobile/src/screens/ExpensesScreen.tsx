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
  getExpenseTypeStats,
  Entry,
  ExpenseTypeStats,
} from "../api/entries";
import { ExpenseType } from "../api/categories";

type FilterType = "all" | ExpenseType;

export default function ExpensesScreen({ navigation }: any) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<ExpenseTypeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = 10;

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
      const currentPage = reset ? 0 : page;

      // Load entries (expense only)
      const entriesData = await getEntries({
        type: "expense",
        ...monthRange,
        limit: ITEMS_PER_PAGE,
        offset: currentPage * ITEMS_PER_PAGE,
      });

      // Load stats for this month
      const statsData = await getExpenseTypeStats(monthRange);

      if (reset) {
        setEntries(entriesData);
        setPage(0);
      } else {
        setEntries((prev) => [...prev, ...entriesData]);
      }

      setStats(statsData);
      setHasMore(entriesData.length === ITEMS_PER_PAGE);
    } catch (error: any) {
      console.error("Failed to load expense data:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Failed to load expense data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage((prev) => prev + 1);
      loadData(false);
    }
  };

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

  const getExpenseTypeBadgeColor = (expenseType: ExpenseType | null) => {
    switch (expenseType) {
      case "mandatory":
        return "#F44336";
      case "neutral":
        return "#FF9800";
      case "excess":
        return "#9C27B0";
      default:
        return "#999";
    }
  };

  const getExpenseTypeLabel = (expenseType: ExpenseType | null) => {
    if (!expenseType) return "Other";
    return expenseType.charAt(0).toUpperCase() + expenseType.slice(1);
  };

  const filteredEntries = entries.filter((entry) => {
    if (selectedFilter === "all") return true;
    return entry.category?.expense_type === selectedFilter;
  });

  const renderEntry = ({ item }: { item: Entry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryLeft}>
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: item.category?.color || "#F44336" },
          ]}
        >
          <Text style={styles.categoryEmoji}>
            {item.category?.icon || "💸"}
          </Text>
        </View>
        <View style={styles.entryInfo}>
          <Text style={styles.categoryName}>
            {item.category?.name || "Uncategorized"}
          </Text>
          <Text style={styles.entryDate}>{formatDate(item.booked_at)}</Text>
          {item.category?.expense_type && (
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor: getExpenseTypeBadgeColor(
                    item.category.expense_type
                  ),
                },
              ]}
            >
              <Text style={styles.typeBadgeText}>
                {getExpenseTypeLabel(item.category.expense_type)}
              </Text>
            </View>
          )}
          {item.note && <Text style={styles.entryNote}>{item.note}</Text>}
        </View>
      </View>
      <View style={styles.entryRight}>
        <Text style={styles.entryAmount}>-${item.amount.toFixed(2)}</Text>
        <View style={styles.entryActions}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={18} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={18} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F44336" />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses This Month</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Mandatory</Text>
            <Text style={styles.statAmount}>
              ${stats?.mandatory.total.toFixed(2) || "0.00"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Neutral</Text>
            <Text style={styles.statAmount}>
              ${stats?.neutral.total.toFixed(2) || "0.00"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Excess</Text>
            <Text style={styles.statAmount}>
              ${stats?.excess.total.toFixed(2) || "0.00"}
            </Text>
          </View>
        </View>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            ${stats?.total.toFixed(2) || "0.00"}
          </Text>
          <Text style={styles.totalCount}>
            {stats?.count || 0} {stats?.count === 1 ? "entry" : "entries"}
          </Text>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segment,
            selectedFilter === "all" && styles.segmentActive,
          ]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text
            style={[
              styles.segmentText,
              selectedFilter === "all" && styles.segmentTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            selectedFilter === "mandatory" && styles.segmentActive,
          ]}
          onPress={() => setSelectedFilter("mandatory")}
        >
          <Text
            style={[
              styles.segmentText,
              selectedFilter === "mandatory" && styles.segmentTextActive,
            ]}
          >
            Mandatory
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            selectedFilter === "neutral" && styles.segmentActive,
          ]}
          onPress={() => setSelectedFilter("neutral")}
        >
          <Text
            style={[
              styles.segmentText,
              selectedFilter === "neutral" && styles.segmentTextActive,
            ]}
          >
            Neutral
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            selectedFilter === "excess" && styles.segmentActive,
          ]}
          onPress={() => setSelectedFilter("excess")}
        >
          <Text
            style={[
              styles.segmentText,
              selectedFilter === "excess" && styles.segmentTextActive,
            ]}
          >
            Excess
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expense List */}
      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#F44336"]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#F44336" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No expense entries yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first expense
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("AddExpense", { onSave: () => loadData(true) })
        }
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#F44336",
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  totalCard: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  totalCount: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 8,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: "#F44336",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  segmentTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  entryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  entryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  entryNote: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  entryRight: {
    alignItems: "flex-end",
  },
  entryAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F44336",
    marginBottom: 8,
  },
  entryActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
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
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});