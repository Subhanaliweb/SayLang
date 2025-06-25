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

export default function AnonymousScreen({ navigation }) {
  const { t } = useLanguage();
  const { continueAsAnonymous } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);

  const handleContinue = async () => {
    if (!username.trim()) {
      Alert.alert(t('error'), t('authEnterUsername'));
      return;
    }

    if (username.trim().length < 2) {
      Alert.alert(t('error'), t('authUsernameTooShort'));
      return;
    }

    setLoading(true);
    try {
      await continueAsAnonymous(username.trim());
      navigation.navigate('HomeTab', { screen: 'Home' });
    } catch (error) {
      Alert.alert(t('error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomUsername = () => {
    const adjectives = ['Happy', 'Clever', 'Bright', 'Swift', 'Bold', 'Kind', 'Smart', 'Cool'];
    const nouns = ['User', 'Guest', 'Visitor', 'Explorer', 'Friend', 'Learner', 'Speaker', 'Student'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 99) + 1;
    return `${randomAdjective}${randomNoun}${randomNumber}`;
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
              <Text style={styles.title}>{t('authContinueAsGuest')}</Text>
              
              {/* Info Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="information-circle" size={24} color="#006A4E" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoDescription}>{t('authAnonymousDesc')}</Text>
                </View>
              </View>

              {/* Username Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>{t('chooseUsername')}</Text>
                <View style={[
                  styles.inputContainer,
                  usernameFocused && styles.inputContainerFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons 
                      name="person-outline" 
                      size={20} 
                      color={usernameFocused ? '#006A4E' : '#64748b'} 
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder={t('authUsernamePlaceholder')}
                    placeholderTextColor="#94a3b8"
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                    maxLength={20}
                  />
                  <TouchableOpacity 
                    style={styles.randomButton}
                    onPress={() => setUsername(generateRandomUsername())}
                  >
                    <Ionicons name="dice-outline" size={20} color="#006A4E" />
                  </TouchableOpacity>
                </View>
                
                {username.length > 0 && (
                  <Text style={styles.characterCount}>
                    {username.length}/20 {t('authCharacters')}
                  </Text>
                )}
              </View>

              {/* Continue Button */}
              <TouchableOpacity 
                style={[
                  styles.continueButton, 
                  loading && styles.continueButtonDisabled,
                  !username.trim() && styles.continueButtonDisabled
                ]} 
                onPress={handleContinue} 
                disabled={loading || !username.trim()}
              >
                <LinearGradient
                  colors={loading || !username.trim() ? ['#94a3b8', '#94a3b8'] : ['#FFCE00', '#FFD700']}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons name="reload-outline" size={20} color="#fff" />
                      <Text style={styles.buttonText}>{t('authLoading')}</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="arrow-forward" size={20} color="#006A4E" style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>{t('authContinue')}</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('or')}</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Login Button */}
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="log-in-outline" size={20} color="#006A4E" style={styles.buttonIcon} />
                <Text style={styles.loginButtonText}>{t('authLoginInstead')}</Text>
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
    marginBottom: 24,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#006A4E',
  },
  infoIconContainer: {
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006A4E',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },

  // Features List
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
    flex: 1,
  },

  // Input Section
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
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
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  randomButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginLeft: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 4,
  },

  // Button Styles
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  continueButtonDisabled: {
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

  // Login Button
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  loginButtonText: {
    color: '#006A4E',
    fontSize: 16,
    fontWeight: '600',
  },

  // Benefits Section
  benefitsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  benefitsList: {
    alignItems: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#e2e8f0',
    marginLeft: 8,
  },
});