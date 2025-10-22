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
      console.log('🔐 Attempting login for:', data.email);
      const res = await API.post('/auth/login', data);
      console.log('✅ Login successful, saving tokens...');
      await setTokens(res.data.access_token, res.data.refresh_token);
      console.log('✅ Tokens saved, fetching profile...');
      await fetchProfile();
      console.log('✅ Login complete! User authenticated.');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });
      
      let errorMessage = 'Invalid email/username or password. Please try again.';
      let errorTitle = 'Login Failed';
      
      if (error.code === 'ECONNABORTED') {
        errorTitle = 'Connection Timeout';
        errorMessage = 'The server is taking too long to respond. Please check if the API server is running and try again.';
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
        errorTitle = 'Network Error';
        errorMessage = 'Cannot connect to the server. Please ensure:\n\n1. The API server is running\n2. Your device has network access\n3. For physical devices: Set EXPO_PUBLIC_API_BASE_URL to your computer\'s IP address\n\nCurrent API URL: ' + (process.env.EXPO_PUBLIC_API_BASE_URL || 'default');
      } else if (error.response?.status === 401) {
        errorMessage = error.response?.data?.detail || 'Invalid email/username or password.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView variant="background" style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: '#FFFFFF' }]}>
          {/* Title with blue underline */}
          <View style={styles.titleContainer}>
            <Text style={styles.welcomeTitle}>Welcome to ACT</Text>
            <Text style={styles.subtitleText}>BudgetWise</Text>
            <View style={styles.underline} />
          </View>

          {/* Email/Username Input */}
          <Controller 
            name="email" 
            control={control}
            rules={{ required: 'Email or Username is required' }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput 
                  placeholder="Enter your username or email" 
                  style={[styles.input, errors.email && styles.inputError]}
                  value={value} 
                  onChangeText={onChange}
                  autoCapitalize="none"
                  editable={!isLoading}
                  placeholderTextColor="#CCCCCC"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>
            )} 
          />

          {/* Password Input */}
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
                  placeholderTextColor="#CCCCCC"
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
              </View>
            )} 
          />

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Bottom Links */}
          <View style={styles.linksContainer}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={isLoading}
            >
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              disabled={isLoading}
            >
              <Text style={styles.link}>Create New Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    backgroundColor: '#2196F3',
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
    borderColor: '#E0E0E0',
    padding: 12, 
    borderRadius: 8,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F9F9F9',
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: '#000000',
    padding: 14,
    borderRadius: 8,
    marginTop: 22,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
});
