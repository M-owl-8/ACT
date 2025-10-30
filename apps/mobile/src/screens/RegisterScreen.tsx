import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform, Modal } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../api/client';
import { useAuthStore } from '../store/auth';
import { useTheme } from '../theme';
import { ThemedView } from '../components/themed';
import { SAMURAI_COLORS } from '../theme/SAMURAI_COLORS';

export default function RegisterScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const [languageChangeKey, setLanguageChangeKey] = React.useState(0);
  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      recovery_keyword: ''
    }
  });
  const { setTokens, fetchProfile } = useAuthStore();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [showCurrencyWarning, setShowCurrencyWarning] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const password = watch('password');

  // Listen for language changes and force re-render
  React.useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageChangeKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const onSubmit = async (data: any) => {
    // Validate email format before proceeding
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      Alert.alert(t('invalidEmailFormat'), t('invalidEmail'));
      return;
    }

    // Verify password and confirm password match
    if (data.password !== data.confirmPassword) {
      Alert.alert(t('passwordsDoNotMatch'), t('passwordsDoNotMatch'));
      return;
    }

    // First, show currency selection - don't submit yet
    setFormData(data);
    setSelectedCurrency(null);
    setShowCurrencyWarning(true);
  };

  const handleCurrencySelected = async (currency: string) => {
    setSelectedCurrency(currency);
    setShowCurrencyWarning(false);
    
    // Now submit with currency
    setIsLoading(true);
    try {
      console.log('📝 Attempting registration for:', formData.email);
      console.log('💱 Currency selected:', currency);
      const res = await API.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        recovery_keyword: formData.recovery_keyword,
        currency: currency
      });
      console.log('✅ Registration successful, saving tokens...');
      await setTokens(res.data.access_token, res.data.refresh_token);
      console.log('✅ Tokens saved, fetching profile...');
      await fetchProfile();
      console.log('✅ Registration complete! User authenticated.');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });
      
      let errorMessage = t('registrationFailed');
      let errorTitle = t('registrationFailed');
      
      if (error.code === 'ECONNABORTED') {
        errorTitle = t('connectionTimeout');
        errorMessage = t('serverTimeoutMessage');
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
        errorTitle = t('networkError');
        errorMessage = t('networkErrorMessage') + (process.env.EXPO_PUBLIC_API_BASE_URL || 'default');
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.detail || t('emailAlreadyRegistered');
      } else if (error.response?.status === 422) {
        errorMessage = t('requiredFieldsError');
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data) {
        // Fallback: show whatever error data the backend sent
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedView variant="background" style={styles.container}>
          <View style={styles.content}>
            <View style={styles.card}>
          {/* Title with red underline */}
          <View style={styles.titleContainer}>
            <Text style={styles.welcomeTitle}>{t('createAccount')}</Text>
            <Text style={styles.subtitleText}>{t('joinACT')}</Text>
            <View style={styles.underline} />
          </View>
        <Controller 
          name="email" 
          control={control}
          rules={{ 
            required: t('emailRequired'),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t('invalidEmail')
            }
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('email')}</Text>
              <TextInput 
                placeholder="user@actgen1.com" 
                style={[styles.input, errors.email && styles.inputError]}
                value={value} 
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>
          )} 
        />

        <Controller 
          name="password" 
          control={control}
          rules={{ 
            required: t('passwordRequired'),
            minLength: {
              value: 8,
              message: t('passwordMinLength')
            }
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('password')}</Text>
              <TextInput 
                placeholder={t('atLeast8Characters')} 
                style={[styles.input, errors.password && styles.inputError]}
                secureTextEntry 
                value={value} 
                onChangeText={onChange}
                editable={!isLoading}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>
          )} 
        />

        <Controller 
          name="confirmPassword" 
          control={control}
          rules={{ 
            required: t('confirmPasswordRequired'),
            validate: (value) => value === password || t('passwordsDoNotMatch')
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('confirmPassword')}</Text>
              <TextInput 
                placeholder={t('reEnterPassword')} 
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                secureTextEntry 
                value={value} 
                onChangeText={onChange}
                editable={!isLoading}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              )}
            </View>
          )} 
        />

        <Controller 
          name="recovery_keyword" 
          control={control}
          rules={{ 
            required: t('recoveryKeywordRequired'),
            minLength: {
              value: 3,
              message: t('recoveryKeywordMinLength')
            }
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('recoveryKeyword')}</Text>
              <Text style={styles.helperText}>
                {t('recoveryKeywordHelper')}
              </Text>
              <TextInput 
                placeholder={t('favoriteAnimalExample')} 
                style={[styles.input, errors.recovery_keyword && styles.inputError]}
                value={value} 
                onChangeText={onChange}
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.recovery_keyword && (
                <Text style={styles.errorText}>{errors.recovery_keyword.message}</Text>
              )}
            </View>
          )} 
        />

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>{t('createAccount')}</Text>
            )}
          </TouchableOpacity>

          {/* Bottom Link */}
          <View style={styles.linksContainer}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text style={styles.link}>{t('alreadyHaveAccount')}</Text>
            </TouchableOpacity>
          </View>
            </View>
          </View>
        </ThemedView>
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyWarning}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyWarning(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Ionicons name="cash" size={28} color="#FFFFFF" />
              <Text style={styles.modalTitle}>{t('selectCurrency')}</Text>
            </View>

            {/* Modal Description */}
            <Text style={styles.modalDescription}>
              {t('chooseCurrencyDescription')}
            </Text>

            {/* Warning Box */}
            <View style={styles.warningBox}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning" size={20} color="#FFB700" />
                <Text style={styles.warningLabel}>{t('warningLabel')}</Text>
              </View>
              <Text style={styles.warningText}>
                {t('currencyWarningMessage')}
              </Text>
            </View>

            {/* Currency Options */}
            <Text style={styles.currencyLabel}>{t('selectCurrency')}</Text>
            <View style={styles.currencyGrid}>
              {['USD', 'EUR', 'RUB', 'UZS'].map((currency) => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.currencyButton,
                    selectedCurrency === currency && styles.currencyButtonSelected,
                  ]}
                  onPress={() => handleCurrencySelected(currency)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={selectedCurrency === currency ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={selectedCurrency === currency ? '#4CAF50' : '#CCCCCC'}
                  />
                  <Text
                    style={[
                      styles.currencyButtonText,
                      selectedCurrency === currency && styles.currencyButtonTextSelected,
                    ]}
                  >
                    {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Error message if no currency selected */}
            {!selectedCurrency && (
              <Text style={styles.selectCurrencyError}>
                {t('pleaseSelectCurrency')}
              </Text>
            )}

            {/* Confirmation Button */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedCurrency || isLoading) && styles.confirmButtonDisabled,
              ]}
              onPress={() => selectedCurrency && handleCurrencySelected(selectedCurrency)}
              disabled={!selectedCurrency || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {t('confirmSelection')}
                </Text>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCurrencyWarning(false)}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#000000',
  },
  content: {
    width: '100%',
    maxWidth: 450,
  },
  card: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  titleContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CCCCCC',
    marginBottom: 12,
  },
  underline: {
    width: 140,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: { 
    borderWidth: 1,
    borderColor: '#FFFFFF',
    padding: 12, 
    borderRadius: 8,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 22,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 20,
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#2A2A1F',
    borderLeftWidth: 4,
    borderLeftColor: '#FFB700',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFB700',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#E0E0E0',
    lineHeight: 18,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  currencyButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#3A3A3A',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  currencyButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#1B3D1B',
  },
  currencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CCCCCC',
    marginLeft: 8,
  },
  currencyButtonTextSelected: {
    color: '#4CAF50',
  },
  selectCurrencyError: {
    fontSize: 12,
    color: '#FF6B6B',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  confirmButton: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#CCCCCC',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
});
