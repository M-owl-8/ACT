/**
 * Japanese-themed Login Screen (Backend API Mode)
 * Connects to FastAPI backend for authentication
 */
import React from 'react';
import { Alert } from 'react-native';
import SignInScreen from './AuthScreens';
import { API } from '../api/client';
import { useAuthStore } from '../store/auth';

export default function JapaneseLoginScreen({ navigation }: any) {
  const { setTokens, fetchProfile } = useAuthStore();

  const handleSignIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const res = await API.post('/auth/login', { email, password });
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
      
      let errorMessage = 'Invalid email or password. Please try again.';
      let errorTitle = 'Login Failed';
      
      if (error.code === 'ECONNABORTED') {
        errorTitle = 'Connection Timeout';
        errorMessage = 'The server is taking too long to respond. Please check if the API server is running and try again.';
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
        errorTitle = 'Network Error';
        errorMessage = 'Cannot connect to the server. Please ensure:\n\n1. The API server is running\n2. Your device has network access\n3. For physical devices: Set EXPO_PUBLIC_API_BASE_URL to your computer\'s IP address\n\nCurrent API URL: ' + (process.env.EXPO_PUBLIC_API_BASE_URL || 'default');
      } else if (error.response?.status === 401) {
        errorMessage = error.response?.data?.detail || 'Invalid email or password.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert(errorTitle, errorMessage);
      throw error; // Re-throw to stop loading state
    }
  };

  const handleSwitch = (screen: string) => {
    if (screen === 'signup') {
      navigation.navigate('Register');
    }
  };

  return (
    <SignInScreen 
      onSignIn={handleSignIn}
      onSwitch={handleSwitch}
    />
  );
}