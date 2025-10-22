import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth';
import { SAMURAI_COLORS, SAMURAI_PATTERNS } from '../theme/SAMURAI_COLORS';

interface AccountFormState {
  fullName: string;
  email: string;
  password: string;
}

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const [accountForm, setAccountForm] = useState<AccountFormState>({
    fullName: user?.name || '',
    email: user?.email || '',
    password: '••••••••',
  });
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const autoBackupEnabled = false;

  const handleFormChange = (field: keyof AccountFormState, value: string) => {
    setAccountForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEmailNotifications = () => {
    setEmailNotificationsEnabled((prev) => !prev);
  };

  const togglePushNotifications = () => {
    setPushNotificationsEnabled((prev) => !prev);
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(10, prev - 1));
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(24, prev + 1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SAMURAI_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BudgetWise Settings</Text>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          <View style={styles.inputFieldWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={SAMURAI_COLORS.text.tertiary}
              value={accountForm.fullName}
              onChangeText={(value) => handleFormChange('fullName', value)}
            />
          </View>

          <View style={styles.inputFieldWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={SAMURAI_COLORS.text.tertiary}
              keyboardType="email-address"
              value={accountForm.email}
              onChangeText={(value) => handleFormChange('email', value)}
            />
          </View>

          <View style={styles.inputFieldWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={SAMURAI_COLORS.text.tertiary}
              secureTextEntry
              value={accountForm.password}
              onChangeText={(value) => handleFormChange('password', value)}
            />
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Email Notifications</Text>
            <TouchableOpacity
              style={[styles.toggleButton, emailNotificationsEnabled && styles.toggleButtonActive]}
              onPress={toggleEmailNotifications}
            >
              <View
                style={[styles.toggleKnob, emailNotificationsEnabled && styles.toggleKnobActive]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Push Notifications</Text>
            <TouchableOpacity
              style={[styles.toggleButton, pushNotificationsEnabled && styles.toggleButtonActive]}
              onPress={togglePushNotifications}
            >
              <View
                style={[styles.toggleKnob, pushNotificationsEnabled && styles.toggleKnobActive]}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.upgradePlanButton}>
          <Text style={styles.upgradePlanText}>UPGRADE PLAN</Text>
        </TouchableOpacity>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <View style={styles.radioGroup}>
            <Text style={styles.toggleLabel}>Theme</Text>
            <View style={styles.radioRow}>
              <View style={styles.radioOption}>
                <View style={styles.radioOuterCircle}>
                  <View style={styles.radioInnerCircle} />
                </View>
              </View>
              <View style={styles.radioOption}>
                <View style={styles.radioOuterCircle}>
                  <View style={styles.radioInnerCircleInactive} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sliderRow}>
            <Text style={styles.toggleLabel}>Font Size</Text>
            <View style={styles.sliderControls}>
              <TouchableOpacity style={styles.sliderButton} onPress={decreaseFontSize}>
                <Ionicons name="remove" size={16} color={SAMURAI_COLORS.text.primary} />
              </TouchableOpacity>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${((fontSize - 10) / 14) * 100}%` }]} />
                <View style={styles.sliderThumb} />
              </View>
              <TouchableOpacity style={styles.sliderButton} onPress={increaseFontSize}>
                <Ionicons name="add" size={16} color={SAMURAI_COLORS.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Data Backup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Backup</Text>

          <TouchableOpacity style={styles.backupButton}>
            <Text style={styles.backupButtonText}>Backup Now</Text>
          </TouchableOpacity>

          <View style={styles.checkboxRow}>
            <Text style={styles.toggleLabel}>Auto Backup</Text>
            <View style={styles.checkbox}>
              {autoBackupEnabled && <View style={styles.checkboxChecked} />}
            </View>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Data Sharing</Text>
            <View style={[styles.toggleButton, styles.toggleButtonActive]}>
              <View style={[styles.toggleKnob, styles.toggleKnobActive]} />
            </View>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Usage Stats</Text>
            <View style={[styles.toggleButton, styles.toggleButtonActive]}>
              <View style={[styles.toggleKnob, styles.toggleKnobActive]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SAMURAI_COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: SAMURAI_COLORS.border.primary,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 12,
  },
  inputFieldWrapper: {
    marginBottom: 12,
  },
  input: {
    ...SAMURAI_PATTERNS.inputField,
    borderRadius: 12,
    borderWidth: 0,
    backgroundColor: SAMURAI_COLORS.background.surface,
    color: SAMURAI_COLORS.text.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: SAMURAI_COLORS.border.primary,
  },
  toggleLabel: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
  },
  toggleButton: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: SAMURAI_COLORS.background.surface,
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
  },
  toggleButtonActive: {
    backgroundColor: SAMURAI_COLORS.accent.red,
    borderColor: SAMURAI_COLORS.accent.red,
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: SAMURAI_COLORS.text.secondary,
    alignSelf: 'flex-start',
  },
  toggleKnobActive: {
    backgroundColor: SAMURAI_COLORS.text.primary,
    alignSelf: 'flex-end',
  },
  upgradePlanButton: {
    alignSelf: 'center',
    backgroundColor: SAMURAI_COLORS.text.primary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  upgradePlanText: {
    fontSize: 12,
    fontWeight: '700',
    color: SAMURAI_COLORS.background.primary,
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 12,
  },
  radioOption: {
    paddingVertical: 12,
  },
  radioOuterCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: SAMURAI_COLORS.text.primary,
  },
  radioInnerCircleInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  sliderRow: {
    marginTop: 12,
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SAMURAI_COLORS.background.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: SAMURAI_COLORS.border.primary,
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: SAMURAI_COLORS.text.primary,
  },
  sliderThumb: {
    position: 'absolute',
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: SAMURAI_COLORS.text.primary,
    top: -5,
  },
  backupButton: {
    alignSelf: 'flex-start',
    backgroundColor: SAMURAI_COLORS.text.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  backupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SAMURAI_COLORS.background.primary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SAMURAI_COLORS.background.surface,
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: SAMURAI_COLORS.accent.red,
  },
});