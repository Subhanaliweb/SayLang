import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function RegisterScreen({ navigation }) {
  const { t } = useLanguage();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const getPasswordStrength = (password) => {
    if (password.length < 6) return { strength: 'weak', color: '#ef4444', text: t('authWeakPassword') };
    if (password.length < 8) return { strength: 'fair', color: '#f97316', text: t('authFairPassword') };
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
      return { strength: 'strong', color: '#22c55e', text: t('authStrongPassword') };
    }
    return { strength: 'good', color: '#eab308', text: t('authGoodPassword') };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('error'), t('authFillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('error'), t('authPasswordsDontMatch'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('error'), t('authPasswordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert(t('error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#006A4E', '#004A37']} style={styles.gradient}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.appName}>Gbé-Gné</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Text style={styles.title}>{t('authRegister')}</Text>
              
              {/* Email Input */}
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
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder={t('authEmailPlaceholder')}
                  placeholderTextColor="#94a3b8"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
                {email && email.includes('@') && (
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                )}
              </View>

              {/* Password Input */}
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
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder={t('authPasswordPlaceholder')}
                  placeholderTextColor="#94a3b8"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.strengthBar}>
                    <View 
                      style={[
                        styles.strengthFill, 
                        { 
                          width: `${Math.min((password.length / 12) * 100, 100)}%`,
                          backgroundColor: passwordStrength.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.text}
                  </Text>
                </View>
              )}

              {/* Confirm Password Input */}
              <View style={[
                styles.inputContainer,
                confirmPasswordFocused && styles.inputContainerFocused,
                confirmPassword && !passwordsMatch && styles.inputContainerError
              ]}>
                <View style={styles.inputIconContainer}>
                  <Ionicons 
                    name="shield-checkmark-outline" 
                    size={20} 
                    color={confirmPasswordFocused ? '#006A4E' : '#64748b'} 
                  />
                </View>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder={t('authConfirmPasswordPlaceholder')}
                  placeholderTextColor="#94a3b8"
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
                {passwordsMatch && (
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" style={{ marginLeft: 8 }} />
                )}
              </View>

              {/* Password Match Indicator */}
              {confirmPassword && !passwordsMatch && (
                <Text style={styles.errorText}>{t('authPasswordsDontMatch')}</Text>
              )}

              {/* Register Button */}
              <TouchableOpacity 
                style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
                onPress={handleRegister} 
                disabled={loading}
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
                    <View style={styles.buttonContent}>
                      <Ionicons name="person-add-outline" size={20} color="#006A4E" style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>{t('authRegister')}</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('authHaveAccount')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>{t('authLogin')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
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
    marginBottom: 20,
    marginTop: 20,
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
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    height: 56,
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
  inputContainerError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  eyeButton: {
    padding: 4,
  },

  // Password Strength
  passwordStrengthContainer: {
    marginBottom: 16,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },

  // Button Styles
  registerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  registerButtonDisabled: {
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#006A4E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
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