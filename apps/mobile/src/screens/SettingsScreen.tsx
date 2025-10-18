import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth';
import { useTheme } from '../theme';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SAMURAI_COLORS, SAMURAI_PATTERNS } from '../theme/SAMURAI_COLORS';

interface UserSettings {
  language: string;
  theme: string;
  currency: string;
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const { theme, mode, setMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    language: 'en',
    theme: 'light',
    currency: 'USD',
  });
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      const userSettings = {
        language: response.data.language || 'en',
        theme: response.data.theme || 'light',
        currency: response.data.currency || 'USD',
      };
      
      setSettings(userSettings);
      
      // Sync i18n language
      await i18n.changeLanguage(userSettings.language);
      
      // Sync theme mode
      if (userSettings.theme === 'light' || userSettings.theme === 'dark' || userSettings.theme === 'auto') {
        await setThemeMode(userSettings.theme as 'light' | 'dark' | 'auto');
      }
      
      console.log('Settings loaded successfully:', userSettings);
    } catch (error: any) {
      console.error('Error loading settings:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: string) => {
    try {
      // Update i18n first if language changed (this will cache it)
      if (key === 'language') {
        await i18n.changeLanguage(value);
      }
      
      // Update backend
      await api.patch('/users/me', { [key]: value });
      
      // Update local state
      setSettings(prev => ({ ...prev, [key]: value }));
      
      // Refresh user profile in auth store to sync changes across the app
      await fetchProfile();
      
      Alert.alert(t('success'), t('settingUpdated') || 'Setting updated successfully');
    } catch (error: any) {
      console.error('Error updating setting:', error);
      console.error('Error response:', error.response?.data);
      
      // If backend fails but language was changed, keep the language change
      if (key === 'language') {
        setSettings(prev => ({ ...prev, [key]: value }));
      }
      
      let errorMessage = t('settingUpdateFailed') || 'Failed to update setting. ';
      
      if (error.response) {
        errorMessage += error.response.data?.detail || 
                       error.response.data?.message || 
                       `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      Alert.alert(t('error'), errorMessage);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      
      // Get CSV data from API
      const response = await api.get('/export/entries/csv', {
        responseType: 'blob',
      });
      
      // Create file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `act_entries_${timestamp}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Save file
      await FileSystem.writeAsStringAsync(fileUri, response.data, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', `File saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExportLoading(true);
      
      // Get JSON data from API
      const response = await api.get('/export/entries/json');
      
      // Create file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `act_entries_${timestamp}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Save file
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(response.data, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      
      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', `File saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting JSON:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const showLanguageOptions = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        {
          text: 'English',
          onPress: () => updateSetting('language', 'en'),
        },
        {
          text: 'Русский',
          onPress: () => updateSetting('language', 'ru'),
        },
        {
          text: 'O\'zbekcha',
          onPress: () => updateSetting('language', 'uz'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showCurrencyOptions = () => {
    Alert.alert(
      'Select Currency',
      'Choose your preferred currency',
      [
        {
          text: 'USD ($)',
          onPress: () => updateSetting('currency', 'USD'),
        },
        {
          text: 'UZS (so\'m)',
          onPress: () => updateSetting('currency', 'UZS'),
        },
        {
          text: 'RUB (₽)',
          onPress: () => updateSetting('currency', 'RUB'),
        },
        {
          text: 'EUR (€)',
          onPress: () => updateSetting('currency', 'EUR'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showThemeOptions = () => {
    Alert.alert(
      'Select Theme',
      'Choose your preferred theme',
      [
        {
          text: 'Light',
          onPress: () => {
            setThemeMode('light');
            updateSetting('theme', 'light');
          },
        },
        {
          text: 'Dark',
          onPress: () => {
            setThemeMode('dark');
            updateSetting('theme', 'dark');
          },
        },
        {
          text: 'Auto (System)',
          onPress: () => {
            setThemeMode('auto');
            updateSetting('theme', 'auto');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'en': return 'English';
      case 'ru': return 'Русский';
      case 'uz': return 'O\'zbekcha';
      default: return lang;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SAMURAI_COLORS.accent} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your experience</Text>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {/* Language */}
          <TouchableOpacity style={styles.settingItem} onPress={showLanguageOptions}>
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={24} color={SAMURAI_COLORS.accent} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Language</Text>
                <Text style={styles.settingValue}>{getLanguageLabel(settings.language)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          {/* Currency */}
          <TouchableOpacity style={styles.settingItem} onPress={showCurrencyOptions}>
            <View style={styles.settingLeft}>
              <Ionicons name="cash" size={24} color={SAMURAI_COLORS.accent} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Currency</Text>
                <Text style={styles.settingValue}>{settings.currency}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          {/* Theme */}
          <TouchableOpacity style={styles.settingItem} onPress={showThemeOptions}>
            <View style={styles.settingLeft}>
              <Ionicons 
                name={settings.theme === 'dark' ? 'moon' : 'sunny'} 
                size={24} 
                color={SAMURAI_COLORS.accent} 
              />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Theme</Text>
                <Text style={styles.settingValue}>
                  {settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Data Export Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Export</Text>
          <Text style={styles.sectionDescription}>
            Export your financial data for backup or analysis
          </Text>

          {/* Export CSV */}
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportCSV}
            disabled={exportLoading}
          >
            <View style={styles.exportButtonContent}>
              <Ionicons name="document-text" size={24} color={SAMURAI_COLORS.accent} />
              <View style={styles.exportButtonInfo}>
                <Text style={styles.exportButtonTitle}>Export as CSV</Text>
                <Text style={styles.exportButtonDescription}>
                  Spreadsheet format for Excel, Google Sheets
                </Text>
              </View>
            </View>
            {exportLoading ? (
              <ActivityIndicator size="small" color={SAMURAI_COLORS.accent} />
            ) : (
              <Ionicons name="download" size={24} color={SAMURAI_COLORS.accent} />
            )}
          </TouchableOpacity>

          {/* Export JSON */}
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportJSON}
            disabled={exportLoading}
          >
            <View style={styles.exportButtonContent}>
              <Ionicons name="code-slash" size={24} color={SAMURAI_COLORS.accent} />
              <View style={styles.exportButtonInfo}>
                <Text style={styles.exportButtonTitle}>Export as JSON</Text>
                <Text style={styles.exportButtonDescription}>
                  Structured data format for developers
                </Text>
              </View>
            </View>
            {exportLoading ? (
              <ActivityIndicator size="small" color={SAMURAI_COLORS.accent} />
            ) : (
              <Ionicons name="download" size={24} color={SAMURAI_COLORS.accent} />
            )}
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID</Text>
              <Text style={styles.infoValue}>#{user?.id}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ACT Gen-1</Text>
          <Text style={styles.footerSubtext}>Personal Finance Tracker</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: SAMURAI_COLORS.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderBottomWidth: 2,
    borderBottomColor: SAMURAI_COLORS.accent,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: SAMURAI_COLORS.accent,
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
  },
  exportButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: SAMURAI_COLORS.accent,
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  exportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exportButtonInfo: {
    marginLeft: 12,
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 4,
  },
  exportButtonDescription: {
    fontSize: 12,
    color: SAMURAI_COLORS.text.secondary,
  },
  infoCard: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: SAMURAI_COLORS.accent,
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: SAMURAI_COLORS.border.primary,
  },
  infoLabel: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: SAMURAI_COLORS.text.tertiary,
  },
});