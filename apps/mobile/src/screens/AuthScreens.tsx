// AuthScreens.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Noto_Serif_JP_400Regular, Noto_Serif_JP_700Bold } from '@expo-google-fonts/noto-serif-jp';
import { NotoSansJP_400Regular, NotoSansJP_700Bold } from '@expo-google-fonts/noto-sans-jp';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, G, Ellipse, Rect } from 'react-native-svg';

/*
  Exports:
    default -> SignInScreen
    named  -> SignUpScreen
   
  Both components accept props:
    onSignIn({email, password}) or onSignUp({name, email, password})
    onSwitch -> callback to switch between screens (optional)
*/

const THEME = {
  paper: '#f6efe6',
  sakura: '#c85a3a', // warm red-orange
  sakuraLight: '#ffdbcf',
  ink: '#433a34',
  muted: '#7a6f65',
  panel: 'rgba(255,255,255,0.92)',
};

function JapaneseHeader({ small = false }) {
  // simple decorative header (sun, branch, Fuji)
  return (
    <View style={styles.headerWrap} pointerEvents="none">
      <Svg style={styles.svg} viewBox="0 0 380 200" preserveAspectRatio="xMidYMid slice">
        {/* Large sun (left) */}
        <Circle cx="60" cy="60" r="45" fill="#dd5b3f" />
        {/* Fuji simplified */}
        <G transform="translate(60,30)">
          <Path d="M20 120 L160 10 L300 120 Z" fill="#e9e6e3" />
          <Path d="M120 20 L160 10 L200 35 L175 10 L160 8 L140 30 Z" fill="#fff" opacity="0.95" />
        </G>
        {/* cherry branch top-right */}
        <G transform="translate(260,6)">
          <Path d="M0 30 C 16 26 36 24 58 10" stroke="#3b2a22" strokeWidth="3" fill="none" strokeLinecap="round" />
          <G transform="translate(44,6)" fill="#dd5b3f" stroke="#7a3b2f" strokeWidth="0.8">
            <Ellipse rx="9" ry="6" cx="0" cy="0" />
            <Ellipse rx="9" ry="6" cx="12" cy="-6" transform="rotate(-18)" />
            <Ellipse rx="9" ry="6" cx="-6" cy="-6" transform="rotate(22)" />
          </G>
        </G>
      </Svg>
      
      <View style={styles.brandRow}>
        <View style={styles.logo}><Text style={{fontSize:20}}>🌸</Text></View>
        <View>
          <Text style={styles.brandTitle}>桜 Studio</Text>
          {!small && <Text style={styles.brandSubtitle}>Quiet · Minimal · Japanese-inspired</Text>}
        </View>
      </View>
    </View>
  );
}

/* small animated focus hook for inputs */
function useFocusAnimation() {
  const anim = useRef(new Animated.Value(0)).current;
  const focus = () => Animated.timing(anim, { toValue: 1, duration: 240, useNativeDriver: false }).start();
  const blur = () => Animated.timing(anim, { toValue: 0, duration: 240, useNativeDriver: false }).start();
  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(67,58,52,0.06)', THEME.sakura],
  });
  return { anim, focus, blur, borderColor };
}

/* Shared Input component */
function Field({ placeholder, secureTextEntry, value, onChangeText, icon, keyboardType, accessibilityLabel, editable = true }: any) {
  const { focus, blur, borderColor } = useFocusAnimation();
  return (
    <TouchableWithoutFeedback>
      <Animated.View style={[styles.field, { borderColor }]}>
        {icon ? <MaterialIcons name={icon} size={18} color={THEME.muted} style={{ marginRight: 8 }} /> : null}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9b8e85"
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          onFocus={focus}
          onBlur={blur}
          keyboardType={keyboardType}
          style={styles.input}
          accessibilityLabel={accessibilityLabel || placeholder}
          returnKeyType="done"
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          editable={editable}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

/* Default export: SignInScreen */
export default function SignInScreen({ onSignIn = (c: any) => Alert.alert('SignIn', JSON.stringify(c)), onSwitch = () => {}, style }: any) {
  const [fontsLoaded] = useFonts({
    Noto_Serif_JP_400Regular,
    Noto_Serif_JP_700Bold,
    NotoSansJP_400Regular,
    NotoSansJP_700Bold,
  });
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // micro animation for card entrance
  const translateY = useRef(new Animated.Value(28)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 420, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []);
  
  if (!fontsLoaded) return null; // or a loader
  
  async function submit() {
    if (!email || !password) {
      return Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください。');
    }
    setIsLoading(true);
    try {
      await onSignIn({ email: email.trim().toLowerCase(), password });
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <KeyboardAvoidingView style={[styles.container, style]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[THEME.paper, '#fffdf9']} style={styles.background}>
        <JapaneseHeader />
        <Animated.View style={[styles.card, { transform: [{ translateY }], opacity }]}>
          <Text style={styles.bigTitle}>サインイン</Text>
          <Text style={styles.lead}>メールアドレスとパスワードでログイン</Text>
          
          <Field
            placeholder="メールアドレス"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            icon="email"
            editable={!isLoading}
          />
          <Field
            placeholder="パスワード"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            icon="lock"
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            accessibilityRole="button" 
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
            onPress={submit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>サインイン</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.ghostButton} 
            onPress={() => onSwitch('signup')}
            disabled={isLoading}
          >
            <Text style={styles.ghostText}>アカウントを作成する</Text>
          </TouchableOpacity>
         
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

/* Named export: SignUpScreen */
export function SignUpScreen({ onSignUp = (c: any) => Alert.alert('SignUp', JSON.stringify(c)), onSwitch = () => {}, style }: any) {
  const [fontsLoaded] = useFonts({
    Noto_Serif_JP_400Regular,
    Noto_Serif_JP_700Bold,
    NotoSansJP_400Regular,
    NotoSansJP_700Bold,
  });
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const translateY = useRef(new Animated.Value(28)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 420, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []);
  
  if (!fontsLoaded) return null;
  
  async function submit() {
    if (!name || !email || !password) return Alert.alert('入力エラー', '全てのフィールドを入力してください。');
    setIsLoading(true);
    try {
      await onSignUp({ name, email: email.trim().toLowerCase(), password });
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <KeyboardAvoidingView style={[styles.container, style]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[THEME.paper, '#fffdf9']} style={styles.background}>
        <JapaneseHeader small />
        <Animated.View style={[styles.card, { transform: [{ translateY }], opacity }]}>
          <Text style={styles.bigTitle}>アカウント作成</Text>
          <Text style={styles.lead}>桜 Studio にようこそ — アカウントを作成してください</Text>
          
          <Field placeholder="フルネーム" value={name} onChangeText={setName} icon="person" editable={!isLoading} />
          <Field placeholder="メールアドレス" value={email} onChangeText={setEmail} keyboardType="email-address" icon="email" editable={!isLoading} />
          <Field placeholder="パスワード" secureTextEntry value={password} onChangeText={setPassword} icon="lock" editable={!isLoading} />
          
          <TouchableOpacity 
            accessibilityRole="button" 
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
            onPress={submit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>アカウントを作成</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.ghostButton} 
            onPress={() => onSwitch('signin')}
            disabled={isLoading}
          >
            <Text style={styles.ghostText}>既にアカウントをお持ちですか？ サインイン</Text>
          </TouchableOpacity>
         
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: THEME.paper },
  background: { flex: 1, paddingTop: 18, paddingHorizontal: 18, alignItems: 'center' },
  
  headerWrap: { width: '100%', alignItems: 'flex-start', marginBottom: 6 },
  svg: { width: '100%', height: 140 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: -36, paddingHorizontal: 6 },
  logo: { width: 54, height: 54, borderRadius: 12, backgroundColor: THEME.sakuraLight, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  brandTitle: { fontFamily: 'Noto_Serif_JP_700Bold', fontSize: 18, color: THEME.ink },
  brandSubtitle: { fontSize: 12, color: THEME.muted },
  
  card: { width: '92%', backgroundColor: THEME.panel, borderRadius: 16, padding: 18, marginTop: 6, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 8 }, elevation: 6, alignSelf: 'center' },
  bigTitle: { fontFamily: 'Noto_Serif_JP_700Bold', fontSize: 28, textAlign: 'center', color: THEME.ink, marginBottom: 6 },
  lead: { fontFamily: 'NotoSansJP_400Regular', fontSize: 13, color: THEME.muted, textAlign: 'center', marginBottom: 16 },
  
  field: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(67,58,52,0.06)', backgroundColor: '#fffaf6', marginBottom: 10 },
  input: { flex: 1, paddingVertical: 10, fontSize: 15, color: THEME.ink, fontFamily: 'NotoSansJP_400Regular' },
  
  primaryButton: { marginTop: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: THEME.sakura, alignItems: 'center', justifyContent: 'center', shadowColor: THEME.sakura, shadowOpacity: 0.18, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  buttonDisabled: { opacity: 0.6 },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  
  ghostButton: { marginTop: 10, alignItems: 'center', paddingVertical: 10 },
  ghostText: { color: THEME.ink, fontWeight: '600' },
});