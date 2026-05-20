import React from 'react';
import { View, Text, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import SettingsScreen from '../screens/SettingsScreen';
import CameraScreen from '../screens/CameraScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CalendarScreen from '../screens/CalendarScreen';

//Responsividade
const { width: SCREEN_W } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_W / 390) * size;

const scaleFont = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel((SCREEN_W / 390) * size));

// Telas
const DummyCamera = () => (
  <View style={styles.dummyContainer}>
    <Text style={styles.dummyText}>Câmera (Em Breve)</Text>
  </View>
);
const DummyCalendar = () => (
  <View style={styles.dummyContainer}>
    <Text style={styles.dummyText}>Calendário (Em Breve)</Text>
  </View>
);
const DummySettings = () => (
  <View style={styles.dummyContainer}>
    <Text style={styles.dummyText}>Configurações (Em Breve)</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryGreen,
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 10,
          height: scale(60) + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarIconStyle: {
          marginTop: scale(8),
        },
      }}
    >
      <Tab.Screen
        name="CameraTab"
        component={CameraScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="camera" color={color} size={scale(24)} />
          ),
        }}
      />

      <Tab.Screen
        name="CalendarTab"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" color={color} size={scale(24)} />
          ),
        }}
      />

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" color={color} size={scale(24)} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" color={color} size={scale(24)} />
          ),
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-sharp" color={color} size={scale(24)} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  dummyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F9F4',
  },
  dummyText: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: colors.primaryGreen,
  },
});