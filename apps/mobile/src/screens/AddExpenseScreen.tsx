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
  Modal,
  FlatList,
  SectionList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCategories, createEntry } from "../services/database";
import { Category } from "../services/database";
import { useAuthStore } from "../store/auth";
import { useGoalsStore, Goal } from "../store/goals";
import { useSettingsStore } from "../store/settings";
import { formatCurrency } from "../utils/currencyFormatter";
import { SAMURAI_COLORS } from "../theme/SAMURAI_COLORS";

export type ExpenseType = "mandatory" | "neutral" | "excess";

const LAST_CATEGORY_KEY = "@last_expense_category";

interface CategorySection {
  title: string;
  expenseType: ExpenseType;
  data: Category[];
  color: string;
}

export default function AddExpenseScreen({ navigation, route }: any) {
  const { onSave } = route.params || {};
  const { user } = useAuthStore();
  const { goals, loadGoals: loadGoalsFromStore } = useGoalsStore();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySections, setCategorySections] = useState<CategorySection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const organizeCategoriesBySections = (categoryList: Category[]): CategorySection[] => {
    const sections: CategorySection[] = [];

    // Define section configurations with new colors
    const sectionConfig = [
      { type: "mandatory", title: "💪 Mandatory", color: "#2196F3" }, // Blue
      { type: "neutral", title: "⚖️ Neutral", color: "#757575" }, // Grey
      { type: "excess", title: "🎉 Excess", color: "#F44336" }, // Red
    ] as const;

    // Create "Others" category that appears in all sections
    const createOthersCategory = (expenseType: ExpenseType): Category => ({
      id: -1, // Negative ID to distinguish from real categories
      name: "Others",
      icon: "🛒",
      color: "#999",
      expense_type: expenseType,
      type: "expense",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    sectionConfig.forEach(({ type, title, color }) => {
      const sectionCategories = categoryList.filter(
        (cat) => cat.expense_type === type
      );
      
      // Check if "Others" category already exists for this type
      const hasOthersCategory = sectionCategories.some(cat => cat.name.toLowerCase() === "others");
      
      // Add "Others" category to each section if it doesn't already exist
      const categoriesWithOthers = hasOthersCategory
        ? sectionCategories
        : [
            ...sectionCategories,
            createOthersCategory(type as ExpenseType),
          ];

      if (categoriesWithOthers.length > 0) {
        sections.push({
          title,
          expenseType: type as ExpenseType,
          data: categoriesWithOthers,
          color,
        });
      }
    });

    return sections;
  };

  const loadCategories = async () => {
    try {
      // Load categories from local database instead of API
      const data = await getCategories("expense");

      if (!data || data.length === 0) {
        console.warn("No expense categories found in local database");
        setCategories([]);
        setCategorySections([]);
        setLoadingCategories(false);
        return;
      }

      // Convert database categories to format expected by the UI
      const formattedCategories: Category[] = data.map((cat: any) => ({
        id: cat.id,
        user_id: cat.user_id,
        name: cat.name,
        icon: cat.icon || "🛒",
        color: cat.color || "#999",
        expense_type: cat.expense_type || "mandatory",
        type: "expense",
        is_default: cat.is_default,
        created_at: cat.created_at || new Date().toISOString(),
      }));

      setCategories(formattedCategories);
      
      // Organize categories into sections
      const sections = organizeCategoriesBySections(formattedCategories);
      setCategorySections(sections);

      // Load last used category
      const lastCategoryId = await AsyncStorage.getItem(LAST_CATEGORY_KEY);
      if (lastCategoryId) {
        const lastCategory = formattedCategories.find(
          (cat) => cat.id === parseInt(lastCategoryId)
        );
        if (lastCategory) {
          setSelectedCategory(lastCategory);
        }
      }
    } catch (error: any) {
      console.error("Failed to load categories:", error);
      Alert.alert(
        "Error Loading Categories",
        "Failed to load categories from local storage",
        [
          { text: "OK", onPress: () => navigation.goBack() },
        ]
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleOthersCategory = (expenseType: ExpenseType): Category | null => {
    // Find or create "Others" category from local categories
    const existingOthers = categories.find(
      cat => cat.name.toLowerCase() === "others"
    );
    
    if (existingOthers) {
      return existingOthers;
    }

    // If not found, return a temporary placeholder
    // "Others" should already exist from database seeding
    return null;
  };

  const handleSave = async () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive amount");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Category Required", "Please select a category");
      return;
    }

    setLoading(true);
    try {
      let categoryId = selectedCategory.id;

      // Handle placeholder "Others" category - create or fetch it
      if (selectedCategory.id === -1) {
        const othersCategory = await handleOthersCategory(selectedCategory.expense_type);
        if (!othersCategory) {
          setLoading(false);
          return;
        }
        categoryId = othersCategory.id;
        setSelectedCategory(othersCategory);
      }

      // Save expense to local database
      const { currency } = useSettingsStore.getState();
      await createEntry({
        user_id: 0, // Offline mode - single user device
        category_id: categoryId,
        amount: amountNum,
        type: "expense",
        description: note.trim() || undefined,
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      });

      // Save last used category
      await AsyncStorage.setItem(
        LAST_CATEGORY_KEY,
        categoryId.toString()
      );

      // Show success message
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

  const formatDate = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryOption}
      onPress={() => {
        setSelectedCategory(item);
        setShowCategoryDropdown(false);
      }}
    >
      <View
        style={[
          styles.categoryIconSmall,
          { backgroundColor: item.color || "#F44336" },
        ]}
      >
        <Text style={styles.categoryEmoji}>{item.icon || "💸"}</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: CategorySection }) => (
    <View style={[styles.sectionHeader, { borderLeftColor: section.color }]}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>

            {/* Header with Icon and Title */}
            <View style={styles.header}>
              <Ionicons name="folder" size={20} color="#000" />
              <Text style={styles.title}>Add Expense</Text>
            </View>

            {/* Category Dropdown */}
            <View style={styles.section}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                disabled={loadingCategories}
              >
                {selectedCategory ? (
                  <View style={styles.selectedCategoryView}>
                    <Text style={styles.selectedCategoryText}>
                      {selectedCategory.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Select a category</Text>
                )}
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>

              {showCategoryDropdown && !loadingCategories && (
                <View style={styles.dropdownMenu}>
                  {categorySections.length > 0 ? (
                    <SectionList
                      sections={categorySections}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={renderCategoryItem}
                      renderSectionHeader={renderSectionHeader}
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                    />
                  ) : (
                    <View style={styles.emptyMessage}>
                      <Text style={styles.emptyMessageText}>
                        No categories available
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Amount */}
            <View style={styles.section}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="138"
                  placeholderTextColor="#999"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <Ionicons name="swap-vertical" size={24} color="#999" />
              </View>
            </View>

            {/* Date */}
            <View style={styles.section}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Optional notes"
                placeholderTextColor="#999"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dropdownButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedCategoryView: {
    flex: 1,
  },
  selectedCategoryText: {
    fontSize: 14,
    color: "#000",
  },
  placeholderText: {
    fontSize: 14,
    color: "#999",
  },
  dropdownMenu: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    maxHeight: 350,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 14,
    color: "#000",
    flex: 1,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000",
  },
  dateText: {
    fontSize: 14,
    color: "#000",
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  sectionHeader: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3", // Default color (will be overridden by section.color)
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  emptyMessage: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyMessageText: {
    fontSize: 14,
    color: "#999",
  },
});