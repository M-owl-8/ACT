import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { API } from '../api/client';
import { useAuthStore } from '../store/auth';
import { useTheme } from '../theme';
import { ThemedView, ThemedText, ThemedButton, ThemedInput } from '../components/themed';

export default function LoginScreen({ navigation }: any) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const { setTokens, fetchProfile } = useAuthStore();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await API.post('/auth/login', data);
      await setTokens(res.data.access_token, res.data.refresh_token);
      await fetchProfile();
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (error.response?.status === 401) {
        // Authentication error - invalid credentials
        errorMessage = error.response?.data?.detail || 'Invalid email or password.';
      } else if (error.message === 'Network Error' || !error.response) {
        // Network error - no connection to server
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response?.data?.detail) {
        // Other server errors
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🗡️</Text>
        <ThemedText size="4xl" weight="bold" style={styles.title}>
          ACT Gen-1
        </ThemedText>
        <ThemedText size="base" variant="secondary" style={styles.subtitle}>
          Personal Finance Tracker
        </ThemedText>
      </View>

      <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
        <Controller 
          name="email" 
          control={control}
          rules={{ 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
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
          rules={{ required: 'Password is required' }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                placeholder="Enter your password" 
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

        <ThemedButton 
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          style={styles.loginButton}
        >
          Login
        </ThemedButton>

        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={() => navigation.navigate('Register')}
          disabled={isLoading}
        >
          <ThemedText variant="secondary" size="sm">
            Don't have an account?{' '}
            <ThemedText size="sm" weight="bold" style={{ color: theme.colors.accent }}>
              Sign Up
            </ThemedText>
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <ThemedText variant="secondary" size="sm">
          🔒 Secure & Private
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  title: { 
    marginBottom: 4,
  },
  subtitle: {
    // Styled via ThemedText
  },
  form: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as any,
    marginBottom: 8,
  },
  input: { 
    borderWidth: 1,
    padding: 12, 
    borderRadius: 8,
    fontSize: 16,
  },
  inputError: {
    // Handled by ThemedInput
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  loginButton: {
    marginTop: 12,
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
});
