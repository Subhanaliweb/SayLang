import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginScreen({ navigation }) {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Refs for inputs
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('authFillAllFields'));
      return;
    }

    // Dismiss keyboard before API call
    Keyboard.dismiss();
    
    setLoading(true);
    try {
      await login(email, password);
      navigation.navigate('HomeTab', { screen: 'Home' });
    } catch (error) {
      Alert.alert(t('error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#006A4E', '#004A37']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <KeyboardAvoidingView 
              style={styles.keyboardView}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
                {/* Header Section */}
                <View style={styles.headerSection}>
                  <Text style={styles.appName}>Gbé-Gné</Text>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                  <Text style={styles.title}>{t('authLogin')}</Text>
                  
                  {/* Email Input */}
                  <TouchableWithoutFeedback onPress={() => emailInputRef.current?.focus()}>
                    <View style={[
                      styles.inputContainer,
                      emailFocused && styles.inputContainerFocused
                    ]}>
                      <View style={styles.inputIconContainer}>
                        <Ionicons 
                          name="mail-outline" 
                          size={20} 
                          color={emailFocused ? '#006A4E' : '#64748b'} 
                        />
                      </View>
                      <TextInput
                        ref={emailInputRef}
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        placeholder={t('authEmailPlaceholder')}
                        placeholderTextColor="#94a3b8"
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        returnKeyType="next"
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    </View>
                  </TouchableWithoutFeedback>

                  {/* Password Input */}
                  <TouchableWithoutFeedback onPress={() => passwordInputRef.current?.focus()}>
                    <View style={[
                      styles.inputContainer,
                      passwordFocused && styles.inputContainerFocused
                    ]}>
                      <View style={styles.inputIconContainer}>
                        <Ionicons 
                          name="lock-closed-outline" 
                          size={20} 
                          color={passwordFocused ? '#006A4E' : '#64748b'} 
                        />
                      </View>
                      <TextInput
                        ref={passwordInputRef}
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="password"
                        textContentType="password"
                        placeholder={t('authPasswordPlaceholder')}
                        placeholderTextColor="#94a3b8"
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                      />
                      <TouchableOpacity 
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                          size={20} 
                          color="#64748b" 
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableWithoutFeedback>

                  {/* Login Button */}
                  <TouchableOpacity 
                    style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                    onPress={handleLogin} 
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={loading ? ['#94a3b8', '#94a3b8'] : ['#FFCE00', '#FFD700']}
                      style={styles.buttonGradient}
                    >
                      {loading ? (
                        <View style={styles.loadingContainer}>
                          <Ionicons name="reload-outline" size={20} color="#fff" />
                          <Text style={styles.buttonText}>{t('authLoading')}</Text>
                        </View>
                      ) : (
                        <Text style={styles.buttonText}>{t('authLogin')}</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{t('or')}</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Alternative Actions */}
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Anonymous')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="person-outline" size={20} color="#006A4E" style={styles.buttonIcon} />
                    <Text style={styles.secondaryButtonText}>{t('authContinueAsGuest')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>{t('authNoAccount')} </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                    <Text style={styles.footerLink}>{t('authRegister')}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#006A4E', // Add background color to prevent white flash
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent', // Make SafeAreaView transparent
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 206, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 206, 0, 0.3)',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFCE00',
    marginBottom: 8,
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
  },

  // Form Section
  formSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 32,
  },

  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputContainerFocused: {
    borderColor: '#006A4E',
    backgroundColor: '#fff',
    shadowColor: '#006A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 16,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },

  // Button Styles
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#006A4E',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748b',
    fontSize: 14,
  },

  // Secondary Button
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#006A4E',
    fontSize: 16,
    fontWeight: '600',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: '#e2e8f0',
    fontSize: 16,
  },
  footerLink: {
    color: '#FFCE00',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});