import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
    setIsLoading(true);
    try {
      console.log('📝 Attempting registration for:', data.email);
      const res = await API.post('/auth/register', {
        email: data.email,
        password: data.password,
        recovery_keyword: data.recovery_keyword
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
  },
  content: {
    width: '100%',
    maxWidth: 450,
  },
  card: {
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 12,
  },
  underline: {
    width: 140,
    height: 3,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  input: { 
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 12, 
    borderRadius: 8,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: '#000000',
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
    color: '#FFFFFF',
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
    color: '#000000',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
});
