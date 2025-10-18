import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateEntry, Entry } from "../api/entries";
import { getCategories, Category, ExpenseType } from "../api/categories";
import { SAMURAI_COLORS, SAMURAI_PATTERNS } from "../theme/SAMURAI_COLORS";

const LAST_CATEGORY_KEY = "@last_expense_category";

export default function EditExpenseScreen({ navigation, route }: any) {
  const { entry, onSave } = route.params || {};

  const [amount, setAmount] = useState(entry?.amount?.toString() || "");
  const [note, setNote] = useState(entry?.note || "");
  const [date, setDate] = useState(
    entry?.booked_at ? new Date(entry.booked_at) : new Date()
  );
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    entry?.category || null
  );
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories({ type: "expense" });
      setCategories(data);

      // Set current category if exists
      if (entry?.category_id) {
        const currentCategory = data.find(
          (cat) => cat.id === entry.category_id
        );
        if (currentCategory) {
          setSelectedCategory(currentCategory);
        }
      }
    } catch (error: any) {
      console.error("Failed to load categories:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Failed to load categories"
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSave = async () => {
    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive amount");
      return;
    }

    // Validate category
    if (!selectedCategory) {
      Alert.alert("Category Required", "Please select a category");
      return;
    }

    setLoading(true);
    try {
      await updateEntry(entry.id, {
        category_id: selectedCategory.id,
        amount: amountNum,
        note: note.trim() || null,
        booked_at: date.toISOString(),
      });

      // Save last used category
      await AsyncStorage.setItem(
        LAST_CATEGORY_KEY,
        selectedCategory.id.toString()
      );

      Alert.alert("Success", "Expense updated successfully", [
        {
          text: "OK",
          onPress: () => {
            if (onSave) onSave();
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Failed to update expense:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Failed to update expense"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const adjustDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
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

  const groupedCategories = categories.reduce((acc, category) => {
    const type = category.expense_type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  const renderCategoryPicker = () => {
    if (loadingCategories) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#F44336" />
        </View>
      );
    }

    return (
      <View style={styles.categoryGrid}>
        {["mandatory", "neutral", "excess", "other"].map((type) => {
          const typedType = type as ExpenseType | "other";
          const cats = groupedCategories[typedType] || [];
          if (cats.length === 0) return null;

          return (
            <View key={type} style={styles.categoryGroup}>
              <View style={styles.categoryGroupHeader}>
                <View
                  style={[
                    styles.typeIndicator,
                    {
                      backgroundColor: getExpenseTypeBadgeColor(
                        type === "other" ? null : (type as ExpenseType)
                      ),
                    },
                  ]}
                />
                <Text style={styles.categoryGroupTitle}>
                  {getExpenseTypeLabel(
                    type === "other" ? null : (type as ExpenseType)
                  )}
                </Text>
              </View>
              <View style={styles.categoryRow}>
                {cats.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory?.id === category.id &&
                        styles.categoryButtonSelected,
                      {
                        borderColor:
                          selectedCategory?.id === category.id
                            ? category.color || "#F44336"
                            : "#ddd",
                      },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <View
                      style={[
                        styles.categoryIconSmall,
                        { backgroundColor: category.color || "#F44336" },
                      ]}
                    >
                      <Text style={styles.categoryEmojiSmall}>
                        {category.icon || "💸"}
                      </Text>
                    </View>
                    <Text
                      style={styles.categoryButtonText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Expense</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount ($)</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
        </View>

        {/* Category Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          {renderCategoryPicker()}
        </View>

        {/* Date Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              onPress={() => adjustDate(-1)}
              style={styles.dateButton}
            >
              <Ionicons name="chevron-back" size={24} color="#F44336" />
            </TouchableOpacity>
            <Text style={styles.dateText}>{formatDateForDisplay(date)}</Text>
            <TouchableOpacity
              onPress={() => adjustDate(1)}
              style={styles.dateButton}
              disabled={date >= new Date()}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={date >= new Date() ? "#ccc" : "#F44336"}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.quickDateButtons}>
            <TouchableOpacity
              onPress={() => setDate(new Date())}
              style={styles.quickDateButton}
            >
              <Text style={styles.quickDateText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setDate(yesterday);
              }}
              style={styles.quickDateButton}
            >
              <Text style={styles.quickDateText}>Yesterday</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Update Expense</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SAMURAI_COLORS.background.primary,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    marginTop: Platform.OS === "ios" ? 40 : 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: SAMURAI_COLORS.text.primary,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 12,
    padding: 16,
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "bold",
    color: SAMURAI_COLORS.semantic.expense,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "bold",
    color: SAMURAI_COLORS.text.primary,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  categoryGrid: {
    gap: 16,
  },
  categoryGroup: {
    marginBottom: 8,
  },
  categoryGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryGroupTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: SAMURAI_COLORS.text.secondary,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: SAMURAI_COLORS.border.primary,
    width: "31%",
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  categoryButtonSelected: {
    borderWidth: 3,
    borderColor: SAMURAI_COLORS.accent,
  },
  categoryIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryEmojiSmall: {
    fontSize: 18,
  },
  categoryButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: SAMURAI_COLORS.text.primary,
    textAlign: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 12,
    padding: 16,
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  dateButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: SAMURAI_COLORS.text.primary,
  },
  quickDateButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.semantic.expense,
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: "600",
    color: SAMURAI_COLORS.semantic.expense,
  },
  noteInput: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: SAMURAI_COLORS.text.primary,
    minHeight: 100,
    textAlignVertical: "top",
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  saveButton: {
    backgroundColor: SAMURAI_COLORS.semantic.expense,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    ...SAMURAI_PATTERNS.shadowMedium,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
});