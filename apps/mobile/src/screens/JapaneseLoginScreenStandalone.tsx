/**
 * Japanese-themed Login Screen (Standalone Mode)
 * Works completely offline - no backend required!
 */
import React from 'react';
import { Alert } from 'react-native';
import SignInScreen from './AuthScreens';
import { useAuthStore } from '../store/authLocal';

export default function JapaneseLoginScreenStandalone({ navigation }: any) {
  const { login } = useAuthStore();

  const handleSignIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      console.log('🔐 Attempting standalone login for:', email);
      await login(email, password);
      console.log('✅ Standalone login successful!');
      // Navigation will happen automatically when user state changes
    } catch (error: any) {
      console.error('❌ Standalone login error:', error);
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
      throw error; // Re-throw to stop loading state
    }
  };

  const handleSwitch = (screen: string) => {
    if (screen === 'signup') {
      navigation.navigate('RegisterStandalone');
    }
  };

  return (
    <SignInScreen 
      onSignIn={handleSignIn}
      onSwitch={handleSwitch}
    />
  );
}