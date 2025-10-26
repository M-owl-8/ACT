import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LineGraph } from "../components/LineGraph";
import {
  getEntries,
  deleteEntry,
  getExpenseTypeStats,
  getEntryTotals,
  Entry,
  ExpenseTypeStats,
  EntryTotals,
} from "../api/entries";
export default function ExpensesScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<ExpenseTypeStats | null>(null);
  const [totals, setTotals] = useState<EntryTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [languageChangeKey, setLanguageChangeKey] = useState(0);

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

  // Date range for "last 10 days"
  const getLast10DaysRange = () => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const end = new Date(now);
    const start = new Date(now);
    start.setDate(start.getDate() - 10);
    start.setHours(0, 0, 0, 0);
    return {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    };
  };

  const loadData = async (reset: boolean = false) => {
    try {
      setError(null);
      const monthRange = getThisMonthRange();
      const last10DaysRange = getLast10DaysRange();

      // Load entries for last 10 days (expense only) - for graph
      const entriesData = await getEntries({
        type: "expense",
        ...last10DaysRange,
        limit: 1000,
      });

      // Load stats for this month - for overview
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
      const errorMsg = error.response?.data?.detail || error.message || t('failedToDeleteEntry');
      console.error("Failed to load expense data:", error);
      setError(errorMsg);
      
      // Only show alert on initial load
      if (reset && !refreshing) {
        Alert.alert(t('error'), errorMsg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  // Listen for language changes and force re-render
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageChangeKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, []);

  const handleDelete = (entry: Entry) => {
    Alert.alert(
      t('deleteExpense'),
      `${t('areYouSureDeleteExpense')}$${entry.amount}?`,
      [
        { text: t('cancel'), style: "cancel" },
        {
          text: t('delete'),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEntry(entry.id);
              Alert.alert(t('success'), t('expenseDeleted'));
              loadData(true);
            } catch (error: any) {
              Alert.alert(
                t('error'),
                error.response?.data?.detail || t('failedToDeleteEntry')
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



  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>{t('loadingDashboard')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      key={languageChangeKey}
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
      {/* Quote Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.quoteText}>Being rich is not just about having money - it is about controlling it</Text>
          <Text style={styles.attributionText}>M. SH.</Text>
        </View>

        {/* Last 10 Days Expense Trend */}
        <View style={styles.chartContainer}>
          {entries.length > 0 ? (
            <LineGraph
              entries={entries}
              width={340}
              height={250}
            />
          ) : (
            <Text style={styles.noDataText}>{t('noExpenseData')}</Text>
          )}
        </View>

        {/* Budget Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('totalIncome')}</Text>
            <Text style={styles.statValue}>${totals?.total.toFixed(2) || "0"}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('totalExpenses')}</Text>
            <Text style={styles.statValue}>${stats?.total.toFixed(2) || "0"}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('remainingBudget')}</Text>
            {(() => {
              const remaining = (totals?.total || 0) - (stats?.total || 0);
              let style = styles.remainingPositive; // green
              if (remaining < 0) {
                style = styles.remainingNegative; // red
              } else if (remaining === 0) {
                style = styles.remainingZero; // grey
              }
              return (
                <Text style={[styles.statValue, style]}>
                  ${remaining.toFixed(2)}
                </Text>
              );
            })()}
          </View>
        </View>



        {/* Add New Entry Button */}
        <TouchableOpacity
          style={styles.addNewEntryButton}
          onPress={() =>
            navigation.navigate("AddExpense", { onSave: () => loadData(true) })
          }
        >
          <Text style={styles.addNewEntryText}>{t('addNewEntry')}</Text>
        </TouchableOpacity>
      </View>


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
  quoteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 24,
  },
  attributionText: {
    fontSize: 10,
    fontWeight: "400",
    color: "#999",
    textAlign: "right",
    marginTop: 8,
  },
  filterDropdown: {
    fontSize: 12,
    color: "#999",
    marginVertical: 4,
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
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    paddingVertical: 8,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 12,
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 40,
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
  remainingNegative: {
    color: "#F44336",
  },
  remainingZero: {
    color: "#999999",
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
});