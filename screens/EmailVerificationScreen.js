import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  SafeAreaView,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function EmailVerificationScreen({ navigation, route }) {
  const { t } = useLanguage();
  const { resendConfirmation } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const email = route.params?.email || '';

  const handleResendEmail = async () => {
    if (!email) {
      Alert.alert(t('error'), t('authEmailNotFound'));
      return;
    }

    setIsResending(true);
    try {
      await resendConfirmation(email);
      Alert.alert(
        t('success'), 
        t('authVerificationEmailSent')
      );
    } catch (error) {
      Alert.alert(t('error'), error.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#006A4E', '#004A37']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.appName}>Gbé-Gné</Text>
            </View>

            {/* Main Content */}
            <View style={styles.mainSection}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={64} color="#FFCE00" />
              </View>
              
              <Text style={styles.title}>{t('authCheckYourEmail')}</Text>
              
              <Text style={styles.description}>
                {t('authVerificationSent')}
              </Text>
              
              <Text style={styles.email}>{email}</Text>
              
              <Text style={styles.instructions}>
                {t('authEmailVerificationInstructions')}
              </Text>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={handleBackToLogin}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-back-outline" size={20} color="#dc2626" style={styles.buttonIcon} />
                  <Text style={styles.backButtonText}>{t('authBackToLogin')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFCE00',
    letterSpacing: 1,
  },

  // Main Section
  mainSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 206, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 206, 0, 0.3)',
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006A4E',
    textAlign: 'center',
    marginBottom: 16,
  },
  
  instructions: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  // Tips Section
  tipsContainer: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  tip: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 16,
  },

  // Buttons
  buttonContainer: {
    width: '100%',
  },
  resendButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#006A4E',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  backButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});