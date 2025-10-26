import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth';
import { useSettingsStore } from '../store/settings';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [languageChangeKey, setLanguageChangeKey] = useState(0);
  
  // Load all settings from the store
  const {
    fullName,
    email,
    emailNotificationsEnabled,
    pushNotificationsEnabled,
    fontSize,
    language,
    currency,
    loadSettings,
    setFullName,
    setEmail,
    setEmailNotifications,
    setPushNotifications,
    setFontSize,
    setLanguage,
    setCurrency,
  } = useSettingsStore();

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  
  // Listen for language changes to force re-render
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log(`🌐 SettingsScreen detected language change to: ${lng}`);
      console.log(`✅ i18n.language is now: ${i18n.language}`);
      console.log(`✅ t('settings') returns: "${t('settings')}"`);
      console.log(`✅ t('accountDetails') returns: "${t('accountDetails')}"`);
      setLanguageChangeKey(prev => {
        const newKey = prev + 1;
        console.log(`🔄 SettingsScreen key changing to force re-render: ${newKey}`);
        return newKey;
      });
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, t]);

  // Auto-save with error feedback
  const handleFieldChange = async (setter: (value: any) => Promise<void>, value: any) => {
    try {
      console.log(`📝 handleFieldChange called with value: ${value}`);
      await setter(value);
      console.log(`✅ handleFieldChange completed`);
    } catch (error) {
      console.error(`❌ handleFieldChange error:`, error);
      Alert.alert(t('error'), t('failedToSaveChanges'));
    }
  };

  // Log current language state on each render
  React.useEffect(() => {
    console.log(`📱 SettingsScreen RENDER - languageChangeKey: ${languageChangeKey}, i18n.language: ${i18n.language}, language store: ${language}`);
    console.log(`  ├─ t('settings'): "${t('settings')}"`);
    console.log(`  ├─ t('accountDetails'): "${t('accountDetails')}"`);
    console.log(`  ├─ t('languageAndCurrency'): "${t('languageAndCurrency')}"`);
    console.log(`  └─ t('appPreferences'): "${t('appPreferences')}"`);
  }, [languageChangeKey]);

  return (
    <SafeAreaView key={`settings-${languageChangeKey}`} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* DEBUG Panel */}
        <View style={{backgroundColor: '#fff3cd', padding: 12, margin: 8, borderRadius: 4, borderWidth: 1, borderColor: '#ffc107'}}>
          <Text style={{fontSize: 10, color: '#333', marginBottom: 4}}>🔧 DEBUG INFO:</Text>
          <Text style={{fontSize: 9, color: '#666', fontFamily: 'monospace'}}>i18n.language: {i18n.language}</Text>
          <Text style={{fontSize: 9, color: '#666', fontFamily: 'monospace'}}>store.language: {language}</Text>
          <Text style={{fontSize: 9, color: '#666', fontFamily: 'monospace'}}>changeKey: {languageChangeKey}</Text>
          <Text style={{fontSize: 9, color: '#666', fontFamily: 'monospace'}}>t('settings'): {t('settings')}</Text>
          <Text style={{fontSize: 9, color: '#666', fontFamily: 'monospace'}}>t('accountDetails'): {t('accountDetails')}</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings')}</Text>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('accountDetails')}</Text>

          <View style={styles.inputFieldWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t('fullNameLabel')}
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={(value) => handleFieldChange(setFullName, value)}
            />
          </View>

          <View style={styles.inputFieldWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t('emailLabel')}
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              editable={false}
            />
            <Text style={styles.helperText}>{t('emailCannotBeChanged')}</Text>
          </View>
        </View>

        {/* Language & Currency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('languageAndCurrency')}</Text>

          <View style={styles.pickerRow}>
            <Text style={styles.toggleLabel}>{t('language')}</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => Alert.alert(t('language'), t('selectLanguage'), [
                { text: 'English', onPress: () => handleFieldChange(setLanguage, 'en') },
                { text: 'Русский (Russian)', onPress: () => handleFieldChange(setLanguage, 'ru') },
                { text: 'Ўзбек (Uzbek)', onPress: () => handleFieldChange(setLanguage, 'uz') },
                { text: 'Español (Spanish)', onPress: () => handleFieldChange(setLanguage, 'es') },
                { text: t('cancel'), style: 'cancel' }
              ])}
            >
              <Text style={styles.pickerButtonText}>
                {language === 'en' ? 'English' : language === 'ru' ? 'Русский' : language === 'uz' ? 'Ўзбек' : language === 'es' ? 'Español' : language}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerRow}>
            <Text style={styles.toggleLabel}>{t('currency')}</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => Alert.alert(t('currency'), t('selectCurrency'), [
                { text: 'USD ($)', onPress: () => handleFieldChange(setCurrency, 'USD') },
                { text: 'UZS (сўм)', onPress: () => handleFieldChange(setCurrency, 'UZS') },
                { text: 'RUB (₽)', onPress: () => handleFieldChange(setCurrency, 'RUB') },
                { text: 'EUR (€)', onPress: () => handleFieldChange(setCurrency, 'EUR') },
                { text: t('cancel'), style: 'cancel' }
              ])}
            >
              <Text style={styles.pickerButtonText}>
                {currency === 'USD' ? 'USD ($)' : currency === 'UZS' ? 'UZS (сўм)' : currency === 'RUB' ? 'RUB (₽)' : currency === 'EUR' ? 'EUR (€)' : currency}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notificationSettings')}</Text>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t('emailNotifications')}</Text>
            <TouchableOpacity
              style={[styles.toggleButton, emailNotificationsEnabled && styles.toggleButtonActive]}
              onPress={() => handleFieldChange(setEmailNotifications, !emailNotificationsEnabled)}
            >
              <View
                style={[styles.toggleKnob, emailNotificationsEnabled && styles.toggleKnobActive]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t('pushNotifications')}</Text>
            <TouchableOpacity
              style={[styles.toggleButton, pushNotificationsEnabled && styles.toggleButtonActive]}
              onPress={() => handleFieldChange(setPushNotifications, !pushNotificationsEnabled)}
            >
              <View
                style={[styles.toggleKnob, pushNotificationsEnabled && styles.toggleKnobActive]}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.upgradePlanButton}>
          <Text style={styles.upgradePlanText}>{t('upgradePlan')}</Text>
        </TouchableOpacity>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('appPreferences')}</Text>

          <View style={styles.radioGroup}>
            <Text style={styles.toggleLabel}>{t('theme')}</Text>
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
            <Text style={styles.toggleLabel}>{t('fontSize')} ({fontSize}px)</Text>
            <View style={styles.sliderControls}>
              <TouchableOpacity 
                style={styles.sliderButton} 
                onPress={() => handleFieldChange(setFontSize, fontSize - 1)}
              >
                <Ionicons name="remove" size={16} color="#000" />
              </TouchableOpacity>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${((fontSize - 10) / 14) * 100}%` }]} />
                <View style={styles.sliderThumb} />
              </View>
              <TouchableOpacity 
                style={styles.sliderButton} 
                onPress={() => handleFieldChange(setFontSize, fontSize + 1)}
              >
                <Ionicons name="add" size={16} color="#000" />
              </TouchableOpacity>
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
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  inputFieldWrapper: {
    marginBottom: 12,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
  },
  toggleButton: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ccc',
    alignSelf: 'flex-start',
  },
  toggleKnobActive: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
  upgradePlanButton: {
    alignSelf: 'center',
    backgroundColor: '#000',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  upgradePlanText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
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
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: '#000',
  },
  sliderThumb: {
    position: 'absolute',
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000',
    top: -5,
  },
  backupButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  backupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#000',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    gap: 8,
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
});