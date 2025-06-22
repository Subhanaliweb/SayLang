import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Alert, View, Text } from 'react-native';
// Import Language Context
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
// Import Language Switch Component
import LanguageSwitch from './components/LanguageSwitch';
// Import screens
import HomeScreen from './screens/HomeScreen';
import CustomTextScreen from './screens/CustomTextScreen';
import SuggestedTextScreen from './screens/SuggestedTextScreen';
import RecordingScreen from './screens/RecordingScreen';
// Import Supabase storage initialization
import { initializeStorage } from './database/database';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Initialize Supabase storage when app starts
initializeStorage();

// Login Button Component
function LoginButton() {
  const handleLogin = () => {
    // Add your login logic here
    Alert.alert('Login', 'Login functionality to be implemented');
  };

  return (
    <TouchableOpacity 
      onPress={handleLogin} 
      style={{ marginRight: 15 }}
    >
      <Ionicons name="person-circle-outline" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

function HomeStack() {
  const { t } = useLanguage();
  const navigation = useNavigation(); // Add this import at top: import { useNavigation } from '@react-navigation/native';
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#006A4E',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <LanguageSwitch />
            <LoginButton />
          </View>
        ),
      }}
      listeners={{
        tabPress: (e) => {
          // This will trigger the back animation to Home
          e.preventDefault();
          navigation.popToTop();
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ 
          title: '',
          headerLeft: () => null, // Remove back button from Home
        }}
      />
      <Stack.Screen
        name="CustomText"
        component={CustomTextScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="SuggestedText"
        component={SuggestedTextScreen}
        options={{ title: ''}}
      />
      <Stack.Screen
        name="Recording"
        component={RecordingScreen}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { t, loading } = useLanguage();
  
  // Show loading screen while language preference is being loaded
  if (loading) {
    return null; // You can replace this with a loading screen component
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
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerShown: false,
        })}
        tabBar={(props) => {
          return (
            <View style={{
              flexDirection: 'row',
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              height: 75,
              alignItems: 'center',
              paddingBottom: 10,
              paddingHorizontal: 25,
            }}>
              {/* Home tab on the left */}
              <TouchableOpacity
  onPress={() => {
    props.navigation.navigate('HomeTab', {
      screen: 'Home'
    });
  }}                style={{
                  alignItems: 'center',
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                }}
              >
                <Ionicons 
                  name={props.state.index === 0 ? 'home' : 'home-outline'} 
                  size={24} 
                  color={props.state.index === 0 ? '#D21034' : 'gray'} 
                />
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: props.state.index === 0 ? '#D21034' : 'gray',
                  marginTop: 2,
                }}>
                  {t('home')}
                </Text>
              </TouchableOpacity>
              
              {/* App name in the center */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#006A4E',
                  letterSpacing: 0.5,
                }}>
                  Gbé-Gné
                </Text>
              </View>
              
              {/* Empty right space for balance */}
              <View style={{ width: 48 }} />
            </View>
          );
        }}
      >
        {/* Only Home tab */}
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{ title: t('home') }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}