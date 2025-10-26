import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ThemedView, ThemedText, ThemedInput, ThemedButton } from '../components/themed';
import { useTheme } from '../theme';
import axios from 'axios';
import { API_URL } from '../api/client';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [languageChangeKey, setLanguageChangeKey] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Listen for language changes and force re-render
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageChangeKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert(t('error'), t('emailRequired'));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/password-reset/request`, {
        email: email.trim().toLowerCase(),
      });

      // Extract token from response message (DEV ONLY - in production this would be sent via email)
      const message = response.data.message;
      const tokenMatch = message.match(/Token: ([^\s]+)/);
      
      if (tokenMatch) {
        const token = tokenMatch[1];
        setResetToken(token);
        setShowResetForm(true);
        Alert.alert(
          t('success'),
          t('passwordResetTokenSent') + '\n\n' + t('devModeToken') + ': ' + token
        );
      } else {
        Alert.alert(t('success'), t('passwordResetEmailSent'));
      }
    } catch (error: any) {
      console.error('Password reset request error:', error);
      Alert.alert(
        t('error'),
        error.response?.data?.detail || t('passwordResetFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert(t('error'), t('passwordRequired'));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(t('error'), t('passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/password-reset/confirm`, {
        token: resetToken,
        new_password: newPassword,
      });

      Alert.alert(
        t('success'),
        t('passwordResetSuccess'),
        [
          {
            text: t('ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Password reset confirm error:', error);
      Alert.alert(
        t('error'),
        error.response?.data?.detail || t('passwordResetFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ThemedText variant="h1" style={styles.title}>
              {t('forgotPassword')}
            </ThemedText>
            <ThemedText variant="body" style={styles.subtitle}>
              {showResetForm ? t('enterNewPassword') : t('enterEmailForReset')}
            </ThemedText>
          </View>

          {!showResetForm ? (
            <View style={styles.form}>
              <ThemedInput
                label={t('email')}
                value={email}
                onChangeText={setEmail}
                placeholder={t('emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <ThemedButton
                title={t('sendResetLink')}
                onPress={handleRequestReset}
                loading={loading}
                style={styles.button}
              />

              <ThemedButton
                title={t('backToLogin')}
                onPress={() => navigation.goBack()}
                variant="outline"
                style={styles.button}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <ThemedInput
                label={t('resetToken')}
                value={resetToken}
                onChangeText={setResetToken}
                placeholder={t('enterResetToken')}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <ThemedInput
                label={t('newPassword')}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t('passwordPlaceholder')}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <ThemedInput
                label={t('confirmPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('confirmPasswordPlaceholder')}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <ThemedButton
                title={t('resetPassword')}
                onPress={handleConfirmReset}
                loading={loading}
                style={styles.button}
              />

              <ThemedButton
                title={t('cancel')}
                onPress={() => {
                  setShowResetForm(false);
                  setResetToken('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                variant="outline"
                style={styles.button}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  button: {
    marginTop: 8,
  },
});