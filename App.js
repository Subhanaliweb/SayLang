import React, { useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Alert, View, Text, Modal, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import LanguageSwitch from './components/LanguageSwitch';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomeScreen from './screens/HomeScreen';
import CustomTextScreen from './screens/CustomTextScreen';
import SuggestedTextScreen from './screens/SuggestedTextScreen';
import RecordingScreen from './screens/RecordingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AnonymousScreen from './screens/AnonymousScreen';
import { initializeStorage } from './database/database';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

initializeStorage();

function UserProfileModal({ visible, onClose, onLogout }) {
  const { t } = useLanguage();
  const { user, anonymousUser } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const displayName = anonymousUser ? anonymousUser.username : user?.email?.split('@')[0];
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1} />
        <Animated.View 
          style={[
            styles.modalContent, 
            { 
              transform: [{ 
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }] 
            }
          ]}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={['#006A4E', '#004A37']}
            style={styles.modalHeader}
          >
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={60} color="#FFCE00" />
            </View>
            <Text style={styles.modalTitle}>
              {anonymousUser ? t('authGuestProfile') : t('authUserProfile')}
            </Text>
          </LinearGradient>

          {/* User Info Section */}
          <View style={styles.userInfoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="person-outline" size={20} color="#006A4E" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>
                  {anonymousUser ? t('authNickname') : t('authEmail')}
                </Text>
                <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
                  {anonymousUser ? anonymousUser.username : user?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.logoutButtonText}>{t('authLogout')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function LoginButton() {
  const { t } = useLanguage();
  const { user, anonymousUser, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const handlePress = () => {
    if (user || anonymousUser) {
      setModalVisible(true);
    } else {
      Alert.alert(
        t('authLogin'),
        t('authLoginPrompt'),
        [
          { text: t('authLogin'), onPress: () => navigation.navigate('Login') },
          { text: t('authContinueAsGuest'), onPress: () => navigation.navigate('Anonymous') },
          { text: t('cancel'), style: 'cancel' },
        ]
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setModalVisible(false);
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress} style={styles.loginButtonContainer}>
        <View style={[
          styles.profileIconContainer,
          { backgroundColor: user || anonymousUser ? '#006A4E' : 'transparent' }
        ]}>
          <Ionicons
            name={user || anonymousUser ? 'person' : 'person-circle-outline'}
            size={18}
            color={user || anonymousUser ? '#FFFACD' : '#fff'}
          />
        </View>
      </TouchableOpacity>
      <UserProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLogout={handleLogout}
      />
    </>
  );
}

// Header component for authenticated screens (with login button)
function AuthenticatedHeader() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <LanguageSwitch />
    </View>
  );
}

// Header component for auth screens (language switch only)
function AuthScreenHeader() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <LanguageSwitch />
    </View>
  );
}

function HomeStack() {
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#006A4E' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <AuthenticatedHeader />,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '', headerLeft: () => null }}
      />
      <Stack.Screen name="CustomText" component={CustomTextScreen} options={{ title: '' }} />
      <Stack.Screen name="SuggestedText" component={SuggestedTextScreen} options={{ title: '' }} />
      <Stack.Screen name="Recording" component={RecordingScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  const { t } = useLanguage();

  return (
    <Stack.Navigator 
      screenOptions={{
        headerStyle: { backgroundColor: '#006A4E' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <AuthScreenHeader />,
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ 
          title: t('authLogin'),
          headerLeft: () => null 
        }} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ 
          title: t('authRegister')
        }} 
      />
      <Stack.Screen 
        name="Anonymous" 
        component={AnonymousScreen} 
        options={{ 
          title: t('authContinueAsGuest')
        }} 
      />
      <Stack.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { t, loading: languageLoading } = useLanguage();
  const { user, anonymousUser, loading: authLoading } = useAuth();

  if (languageLoading || authLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === 'HomeTab') {
              return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
            }
            return null;
          },
          tabBarActiveTintColor: '#D21034',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          headerShown: false,
        })}
        tabBar={(props) => {
          // Only show tab bar when user is authenticated and on home screens
          if (user || anonymousUser) {
            return (
              <View style={styles.customTabBar}>
                <TouchableOpacity
                  onPress={() =>
                    props.navigation.navigate('HomeTab', { screen: 'Home' })
                  }
                  style={styles.homeTabButton}
                >
                  <Ionicons
                    name={props.state.index === 0 ? 'home' : 'home-outline'}
                    size={24}
                    color={props.state.index === 0 ? '#006A4E' : 'gray'}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: props.state.index === 0 ? '#006A4E' : 'gray' }
                    ]}
                  >
                    {t('home')}
                  </Text>
                </TouchableOpacity>
                <View style={styles.appTitleContainer}>
                  <Text style={styles.appTitle}>Gbé-Gné</Text>
                </View>
                <LoginButton />
                {/* <View style={{ width: 48 }} /> */}
              </View>
            );
          }
          return null; // No tab bar for auth screens
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={user || anonymousUser ? HomeStack : AuthStack}
          options={{ title: t('home') }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  // Login Button Styles
  loginButtonContainer: {
    marginRight: 15,
  },
  profileIconContainer: {
    width: 33,
    height: 33,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFCE00',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 350,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalHeader: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },

  // User Info Section
  userInfoSection: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },

  // Button Styles
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  logoutButton: {
    backgroundColor: '#D21034',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#D21034',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#006A4E',
    fontSize: 16,
    fontWeight: '600',
  },

  // Tab Bar Styles
  customTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF8DC',
    borderTopWidth: 1,
    borderTopColor: '#FFCE00',
    height: 75,
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 25,
  },
  homeTabButton: {
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  appTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006A4E',
    letterSpacing: 0.5,
  },
});