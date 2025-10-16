/**
 * Japanese-themed Register Screen (Backend API Mode)
 * Connects to FastAPI backend for registration
 */
import React from 'react';
import { Alert } from 'react-native';
import { SignUpScreen } from './AuthScreens';
import { API } from '../api/client';
import { useAuthStore } from '../store/auth';

export default function JapaneseRegisterScreen({ navigation }: any) {
  const { setTokens, fetchProfile } = useAuthStore();

  const handleSignUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    try {
      console.log('📝 Attempting registration for:', email);
      const res = await API.post('/auth/register', {
        email,
        password,
        // Note: Backend might not use 'name' field, but we include it for future compatibility
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
      throw error; // Re-throw to stop loading state
    }
  };

  const handleSwitch = (screen: string) => {
    if (screen === 'signin') {
      navigation.navigate('Login');
    }
  };

  return (
    <SignUpScreen 
      onSignUp={handleSignUp}
      onSwitch={handleSwitch}
    />
  );
}