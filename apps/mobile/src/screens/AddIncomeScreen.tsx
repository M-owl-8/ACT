import React, { useState } from "react";
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
import { createEntry } from "../api/entries";
import { SAMURAI_COLORS, SAMURAI_PATTERNS } from "../theme/SAMURAI_COLORS";

export default function AddIncomeScreen({ navigation, route }: any) {
  const { onSave } = route.params || {};

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive amount");
      return;
    }

    setLoading(true);
    try {
      await createEntry({
        type: "income",
        amount: amountNum,
        note: note.trim() || null,
        booked_at: date.toISOString(),
        currency: "USD",
      });

      Alert.alert("Success", "Income added successfully", [
        {
          text: "OK",
          onPress: () => {
            if (onSave) onSave();
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Failed to create income:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Failed to add income"
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={SAMURAI_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Income</Text>
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

        {/* Date Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={24} color={SAMURAI_COLORS.semantic.income} />
            <Text style={styles.dateText}>{formatDateForDisplay(date)}</Text>
            <Ionicons name="chevron-down" size={24} color={SAMURAI_COLORS.semantic.income} />
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
          
          <View style={styles.dateNavigation}>
            <TouchableOpacity
              onPress={() => adjustDate(-1)}
              style={styles.dateNavButton}
            >
              <Ionicons name="chevron-back" size={20} color={SAMURAI_COLORS.semantic.income} />
              <Text style={styles.dateNavText}>Previous Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => adjustDate(1)}
              style={styles.dateNavButton}
              disabled={date >= new Date()}
            >
              <Text style={styles.dateNavText}>Next Day</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={date >= new Date() ? SAMURAI_COLORS.text.tertiary : SAMURAI_COLORS.semantic.income}
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
              <Text style={styles.saveButtonText}>Save Income</Text>
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
    color: SAMURAI_COLORS.semantic.income,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "bold",
    color: SAMURAI_COLORS.text.primary,
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
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: SAMURAI_COLORS.text.primary,
    textAlign: "center",
    marginHorizontal: 12,
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
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
    gap: 6,
  },
  dateNavText: {
    fontSize: 13,
    fontWeight: "500",
    color: SAMURAI_COLORS.semantic.income,
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
    borderColor: SAMURAI_COLORS.semantic.income,
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: "600",
    color: SAMURAI_COLORS.semantic.income,
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
    backgroundColor: SAMURAI_COLORS.semantic.income,
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