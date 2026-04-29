import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../theme/colors';
import SettingsScreen from '../screens/SettingsScreen';
import CameraScreen from '../screens/CameraScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CalendarScreen from '../screens/CalendarScreen';

// -------------------------------------------------------------
// Truque Sênior: Telas Falsas para preencher a barra de navegação
// -------------------------------------------------------------
const DummyCamera = () => (
  <View style={styles.dummyContainer}><Text style={styles.dummyText}>Câmera (Em Breve)</Text></View>
);
const DummyCalendar = () => (
  <View style={styles.dummyContainer}><Text style={styles.dummyText}>Calendário (Em Breve)</Text></View>
);
const DummySettings = () => (
  <View style={styles.dummyContainer}><Text style={styles.dummyText}>Configurações (Em Breve)</Text></View>
);

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: colors.primaryGreen, 
        tabBarInactiveTintColor: '#A0A0A0', 
        tabBarShowLabel: false, // Esconde o texto para ficar igual ao Figma
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
        }
      }}
    >
      {/* 1. Câmera */}
      <Tab.Screen 
        name="CameraTab" 
        component={CameraScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="camera" color={color} size={size + 2} /> }}
      />
      
      {/* 2. Calendário */}
      <Tab.Screen 
        name="CalendarTab" 
        component={CalendarScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size + 2} /> }}
      />

      {/* 3. Home (A Casa do Panda) */}
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size + 2} /> }}
      />
      
      {/* 4. Perfil */}
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size + 2} /> }}
      />

      {/* 5. Configurações */}
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="settings-sharp" color={color} size={size + 2} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  dummyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F9F4'
  },
  dummyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryGreen
  }
});