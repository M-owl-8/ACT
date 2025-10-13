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
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createEntry } from "../api/entries";
import { getCategories, Category, ExpenseType } from "../api/categories";

const LAST_CATEGORY_KEY = "@last_expense_category";

export default function AddExpenseScreen({ navigation, route }: any) {
  const { onSave } = route.params || {};

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories({ type: "expense" });
      
      if (!data || data.length === 0) {
        Alert.alert(
          "No Categories",
          "No expense categories found. Please create categories first.",
          [{ text: "OK" }]
        );
        setCategories([]);
        return;
      }
      
      setCategories(data);

      // Load last used category
      const lastCategoryId = await AsyncStorage.getItem(LAST_CATEGORY_KEY);
      if (lastCategoryId) {
        const lastCategory = data.find(
          (cat) => cat.id === parseInt(lastCategoryId)
        );
        if (lastCategory) {
          setSelectedCategory(lastCategory);
        }
      }
    } catch (error: any) {
      console.error("Failed to load categories:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to load categories";
      Alert.alert(
        "Error Loading Categories",
        errorMessage + "\n\nPlease check your internet connection and try again.",
        [
          { text: "Retry", onPress: () => loadCategories() },
          { text: "Cancel", onPress: () => navigation.goBack() }
        ]
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
      await createEntry({
        type: "expense",
        category_id: selectedCategory.id,
        amount: amountNum,
        note: note.trim() || null,
        booked_at: date.toISOString(),
        currency: "USD",
      });

      // Save last used category
      await AsyncStorage.setItem(
        LAST_CATEGORY_KEY,
        selectedCategory.id.toString()
      );

      Alert.alert("Success", "Expense added successfully", [
        {
          text: "OK",
          onPress: () => {
            if (onSave) onSave();
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Failed to create expense:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Failed to add expense"
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
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
          <Text style={styles.headerTitle}>Add Expense</Text>
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
          
          {/* Calendar Picker Button */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Ionicons name="calendar-outline" size={24} color="#F44336" />
            <Text style={styles.datePickerText}>{formatDateForDisplay(date)}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Navigation Buttons */}
          <View style={styles.dateNavigation}>
            <TouchableOpacity
              onPress={() => adjustDate(-1)}
              style={styles.dateNavButton}
            >
              <Ionicons name="chevron-back" size={20} color="#F44336" />
              <Text style={styles.dateNavText}>Previous Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => adjustDate(1)}
              style={[styles.dateNavButton, date >= new Date() && { opacity: 0.5 }]}
              disabled={date >= new Date()}
            >
              <Text style={styles.dateNavText}>Next Day</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={date >= new Date() ? "#ccc" : "#F44336"}
              />
            </TouchableOpacity>
          </View>

          {/* Quick Date Buttons */}
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
              <Text style={styles.saveButtonText}>Save Expense</Text>
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
    backgroundColor: "#f5f5f5",
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
    color: "#333",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F44336",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
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
    color: "#666",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    width: "31%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonSelected: {
    borderWidth: 2,
    shadowOpacity: 0.15,
    elevation: 3,
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
    color: "#333",
    textAlign: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  quickDateButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F44336",
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F44336",
  },
  noteInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    minHeight: 100,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#F44336",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
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
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dateNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  dateNavButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 6,
  },
  dateNavText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
});