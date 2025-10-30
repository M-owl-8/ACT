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
import { updateEntry, Entry } from "../api/entries";
import { useAuthStore } from "../store/auth";
import { formatCurrency } from "../utils/currencyFormatter";
import { SAMURAI_COLORS, SAMURAI_PATTERNS } from "../theme/SAMURAI_COLORS";

export default function EditIncomeScreen({ navigation, route }: any) {
  const { entry, onSave } = route.params as { entry: Entry; onSave: () => void };
  const { user } = useAuthStore();

  const [amount, setAmount] = useState(entry.amount.toString());
  const [note, setNote] = useState(entry.note || "");
  const [date, setDate] = useState(new Date(entry.booked_at));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive amount");
      return;
    }

    setLoading(true);
    try {
      await updateEntry(entry.id, {
        amount: amountNum,
        note: note.trim() || null,
        booked_at: date.toISOString(),
      });

      Alert.alert("Success", "Income updated successfully", [
        {
          text: "OK",
          onPress: () => {
            if (onSave) onSave();
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Failed to update income:", error);
      Alert.alert(
        "Error",
        error.response?.data?.detail || "Failed to update income"
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
          <Text style={styles.headerTitle}>Edit Income</Text>
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
          <View style={styles.dateContainer}>
            <TouchableOpacity
              onPress={() => adjustDate(-1)}
              style={styles.dateButton}
            >
              <Ionicons name="chevron-back" size={24} color="#4CAF50" />
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
                color={date >= new Date() ? "#ccc" : "#4CAF50"}
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
              <Text style={styles.saveButtonText}>Update Income</Text>
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