import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { API } from '../api/client';
import { useAuthStore } from '../store/auth';
import { Ionicons } from '@expo/vector-icons';

// Fallback BlurView component using semi-transparent background
// Note: expo-blur requires native rebuild. Using fallback for compatibility.
const BlurView = ({ children, intensity, tint, style, ...props }: any) => {
  const backgroundColor = tint === 'light' 
    ? `rgba(255, 255, 255, ${Math.min(intensity / 100, 0.85)})` 
    : `rgba(0, 0, 0, ${Math.min(intensity / 100, 0.85)})`;
  
  return (
    <View 
      {...props} 
      style={[
        style, 
        { 
          backgroundColor,
          // Add subtle border to enhance glass effect
          borderWidth: 1,
          borderColor: tint === 'light' 
            ? 'rgba(255, 255, 255, 0.3)' 
            : 'rgba(0, 0, 0, 0.3)',
        }
      ]}
    >
      {children}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

// Sakura petal component
const SakuraPetal = ({ delay }: { delay: number }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startX = Math.random() * width;
    const amplitude = 30 + Math.random() * 60;
    
    // Delay start
    setTimeout(() => {
      // Fade in
      Animated.timing(opacity, {
        toValue: 0.6 + Math.random() * 0.4,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Fall animation
      Animated.loop(
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: height + 100,
            duration: 8000 + Math.random() * 4000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: amplitude,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -amplitude,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(rotate, {
            toValue: 360,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
  }, []);

  return (
    <Animated.Text
      style={[
        styles.petal,
        {
          left: Math.random() * width,
          opacity,
          transform: [
            { translateY },
            { translateX },
            { rotate: rotate.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              })
            },
          ],
        },
      ]}
    >
      🌸
    </Animated.Text>
  );
};

// Soft blob component
const SoftBlob = ({ size, color, top, left, bottom, right }: any) => (
  <View
    style={[
      styles.blob,
      {
        width: size,
        height: size,
        backgroundColor: color,
        top,
        left,
        bottom,
        right,
      },
    ]}
  />
);

export default function JapaneseLockScreen({ navigation }: any) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { setTokens, fetchProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
        errorMessage = 'Cannot connect to server. Please check:\n\n1. API server is running\n2. Network connection\n3. For physical devices: Configure EXPO_PUBLIC_API_BASE_URL';
      } else if (error.response?.status === 401) {
        errorMessage = error.response?.data?.detail || 'Invalid email or password.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatDate = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[currentTime.getMonth()]} ${currentTime.getDate()}, ${currentTime.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#FDEDEC', '#F6F7FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative blobs */}
      <SoftBlob size={220} color="rgba(43, 110, 251, 0.12)" top={40} left={-60} />
      <SoftBlob size={300} color="rgba(255, 192, 203, 0.10)" bottom={-40} right={-60} />

      {/* Animated sakura petals */}
      {[...Array(7)].map((_, i) => (
        <SakuraPetal key={i} delay={i * 1000} />
      ))}

      {/* Main content */}
      <View style={styles.content}>
        {/* Time and date header */}
        <View style={styles.header}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{formatTime()}</Text>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>
          <Ionicons name="lock-closed-outline" size={28} color="rgba(0,0,0,0.54)" />
        </View>

        <View style={styles.spacer} />

        {/* Glass sign-in card and side panel */}
        <View style={styles.mainRow}>
          {/* Glass sign-in card */}
          <View style={styles.cardContainer}>
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={styles.cardContent}>
                {/* Header row with accent */}
                <View style={styles.cardHeader}>
                  <View style={styles.accentDot} />
                  <Text style={styles.signInText}>SIGN IN</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.japaneseText}>日本</Text>
                </View>

                {/* Welcome text */}
                <Text style={styles.welcomeText}>Welcome back</Text>

                {/* Username field */}
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                          placeholder="Username"
                          placeholderTextColor="#999"
                          style={styles.input}
                          value={value}
                          onChangeText={onChange}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          editable={!isLoading}
                        />
                      </View>
                      {errors.email && (
                        <Text style={styles.errorText}>{errors.email.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* Password field */}
                <Controller
                  name="password"
                  control={control}
                  rules={{ required: 'Password is required' }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                          placeholder="Password"
                          placeholderTextColor="#999"
                          style={styles.input}
                          secureTextEntry={!showPassword}
                          value={value}
                          onChangeText={onChange}
                          editable={!isLoading}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <Ionicons
                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.password && (
                        <Text style={styles.errorText}>{errors.password.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* Unlock button */}
                <TouchableOpacity
                  style={[styles.unlockButton, isLoading && styles.unlockButtonDisabled]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  <Text style={styles.unlockButtonText}>
                    {isLoading ? 'Unlocking...' : 'Unlock'}
                  </Text>
                </TouchableOpacity>

                {/* Forgot Password link */}
                <TouchableOpacity
                  style={styles.forgotPasswordLink}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  disabled={isLoading}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Fingerprint alternative */}
                <View style={styles.fingerprintRow}>
                  <Ionicons name="finger-print" size={18} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.fingerprintText}>Touch to unlock</Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Side panel (ACT branding) */}
          <View style={styles.sidePanel}>
            <View style={styles.sidePanelInner}>
              <Text style={styles.actText}>ACT</Text>
            </View>
          </View>
        </View>

        {/* Register link */}
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
          disabled={isLoading}
        >
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text style={styles.registerTextBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 26,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  timeContainer: {
    flex: 1,
  },
  time: {
    fontSize: 48,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.87)',
  },
  date: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.54)',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  spacer: {
    flex: 1,
  },
  mainRow: {
    flexDirection: 'row',
    marginBottom: 48,
  },
  cardContainer: {
    flex: 6,
    marginRight: 12,
  },
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.85)', // More opaque for fallback
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    // Shadow for depth when blur is not available
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardContent: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9AA2',
    marginRight: 8,
  },
  signInText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#000',
  },
  japaneseText: {
    color: 'rgba(0,0,0,0.54)',
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  inputWrapper: {
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  errorText: {
    fontSize: 12,
    color: '#FF5252',
    marginTop: 4,
    marginLeft: 4,
  },
  unlockButton: {
    backgroundColor: '#2B6EFB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
    elevation: 4,
    shadowColor: '#2B6EFB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  unlockButtonDisabled: {
    opacity: 0.6,
  },
  unlockButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  fingerprintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  fingerprintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginLeft: 8,
  },
  sidePanel: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidePanelInner: {
    width: 140,
    height: 300,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.2,
    borderColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '270deg' }],
  },
  actText: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 2.0,
    color: '#000',
  },
  forgotPasswordLink: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: '#2B6EFB',
    fontSize: 13,
    fontWeight: '500',
  },
  registerLink: {
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: {
    color: 'rgba(0,0,0,0.54)',
    fontSize: 14,
  },
  registerTextBold: {
    color: '#2B6EFB',
    fontWeight: 'bold',
  },
  petal: {
    position: 'absolute',
    fontSize: 18,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.8,
  },
});