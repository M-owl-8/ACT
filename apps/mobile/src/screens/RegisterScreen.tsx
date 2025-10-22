import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { API } from '../api/client';
import { useAuthStore } from '../store/auth';
import { useTheme } from '../theme';
import { ThemedView } from '../components/themed';

export default function RegisterScreen({ navigation }: any) {
  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  const { setTokens, fetchProfile } = useAuthStore();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const password = watch('password');

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log('📝 Attempting registration for:', data.email);
      const res = await API.post('/auth/register', {
        email: data.email,
        password: data.password
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
      
      let errorMessage = 'Registration failed. Please try again.';
      let errorTitle = 'Registration Failed';
      
      if (error.code === 'ECONNABORTED') {
        errorTitle = 'Connection Timeout';
        errorMessage = 'The server is taking too long to respond. Please check if the API server is running and try again.';
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
        errorTitle = 'Network Error';
        errorMessage = 'Cannot connect to the server. Please ensure:\n\n1. The API server is running\n2. Your device has network access\n3. For physical devices: Set EXPO_PUBLIC_API_BASE_URL to your computer\'s IP address\n\nCurrent API URL: ' + (process.env.EXPO_PUBLIC_API_BASE_URL || 'default');
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.detail || 'Email already registered.';
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
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.subtitleText}>Join ACT</Text>
            <View style={styles.underline} />
          </View>
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
          rules={{ 
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            }
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                placeholder="At least 8 characters" 
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
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match'
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput 
                placeholder="Re-enter your password" 
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

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Bottom Link */}
          <View style={styles.linksContainer}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text style={styles.link}>Already have an account? Sign In</Text>
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
});
