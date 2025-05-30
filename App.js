import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './screens/HomeScreen';
import CustomTextScreen from './screens/CustomTextScreen';
import SuggestedTextScreen from './screens/SuggestedTextScreen';
import RecordingScreen from './screens/RecordingScreen';
import HistoryScreen from './screens/HistoryScreen';

// Import database initialization
import { initDatabase } from './database/database';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Initialize database when app starts
initDatabase();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'SayLang' }}
      />
      <Stack.Screen 
        name="CustomText" 
        component={CustomTextScreen} 
        options={{ title: 'Custom Text' }}
      />
      <Stack.Screen 
        name="SuggestedText" 
        component={SuggestedTextScreen} 
        options={{ title: 'Suggested Texts' }}
      />
      <Stack.Screen 
        name="Recording" 
        component={RecordingScreen} 
        options={{ title: 'Record Audio' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'History') {
              iconName = focused ? 'list' : 'list-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="HomeTab" 
          component={HomeStack} 
          options={{ title: 'Home' }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{ 
            title: 'History',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#6366f1',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}