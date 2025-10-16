/**
 * Japanese-themed Register Screen (Standalone Mode)
 * Works completely offline - no backend required!
 */
import React from 'react';
import { Alert } from 'react-native';
import { SignUpScreen } from './AuthScreens';
import { useAuthStore } from '../store/authLocal';

export default function JapaneseRegisterScreenStandalone({ navigation }: any) {
  const { register } = useAuthStore();

  const handleSignUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    try {
      console.log('📝 Attempting standalone registration for:', email);
      await register(email, password);
      console.log('✅ Standalone registration successful!');
      // Navigation will happen automatically when user state changes
    } catch (error: any) {
      console.error('❌ Standalone registration error:', error);
      Alert.alert('Registration Failed', error.message || 'Could not create account');
      throw error; // Re-throw to stop loading state
    }
  };

  const handleSwitch = (screen: string) => {
    if (screen === 'signin') {
      navigation.navigate('LoginStandalone');
    }
  };

  return (
    <SignUpScreen 
      onSignUp={handleSignUp}
      onSwitch={handleSwitch}
    />
  );
}