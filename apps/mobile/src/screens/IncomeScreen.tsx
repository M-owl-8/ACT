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
    <View style={styles.entryCard}>
      <View style={styles.entryLeft}>
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: item.category?.color || "#4CAF50" },
          ]}
        >
          <Text style={styles.categoryEmoji}>
            {item.category?.icon || "💰"}
          </Text>
        </View>
        <View style={styles.entryInfo}>
          <Text style={styles.categoryName}>
            {item.category?.name || "Uncategorized"}
          </Text>
          <Text style={styles.entryDate}>{formatDate(item.booked_at)}</Text>
          {item.note && <Text style={styles.entryNote}>{item.note}</Text>}
        </View>
      </View>
      <View style={styles.entryRight}>
        <Text style={styles.entryAmount}>+${item.amount.toFixed(2)}</Text>
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
        <ActivityIndicator size="large" color="#66BB6A" />
        <Text style={styles.loadingText}>Loading income...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Totals */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Income This Month</Text>
        <View style={styles.totalsCard}>
          <Text style={styles.totalAmount}>
            ${totals?.total.toFixed(2) || "0.00"}
          </Text>
          <Text style={styles.totalCount}>
            {totals?.count || 0} {totals?.count === 1 ? "entry" : "entries"}
          </Text>
        </View>
      </View>

      {/* Income List */}
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#EF5350"]}
            tintColor="#EF5350"
          />
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
    backgroundColor: "#0B0B0E",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B0B0E",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#BDBDBD",
  },
  header: {
    backgroundColor: "#111217",
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#EF5350",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F4F4F5",
    marginBottom: 16,
    letterSpacing: 1,
  },
  totalsCard: {
    backgroundColor: "rgba(102, 187, 106, 0.15)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderLeftWidth: 3,
    borderLeftColor: "#66BB6A",
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#66BB6A",
    marginBottom: 4,
  },
  totalCount: {
    fontSize: 14,
    color: "#BDBDBD",
    opacity: 0.9,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  entryCard: {
    backgroundColor: "#111217",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 3,
    borderLeftColor: "#EF5350",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
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
    color: "#F4F4F5",
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 13,
    color: "#BDBDBD",
    marginBottom: 2,
  },
  entryNote: {
    fontSize: 12,
    color: "#757575",
    fontStyle: "italic",
  },
  entryRight: {
    alignItems: "flex-end",
  },
  entryAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#66BB6A",
    marginBottom: 8,
  },
  entryActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#757575",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#424242",
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
    backgroundColor: "#66BB6A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
  },
});