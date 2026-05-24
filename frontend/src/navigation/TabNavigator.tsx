import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import SettingsScreen from '../screens/SettingsScreen';
import CameraScreen from '../screens/CameraScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CalendarScreen from '../screens/CalendarScreen';

const { width: SCREEN_W } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_W / 390) * size;
const scaleFont = (size: number) =>
  Math.round(PixelRatio.roundToNearestPixel((SCREEN_W / 390) * size));

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const [usuarioAtivoTipo, setUsuarioAtivoTipo] = useState<string | null>(null);
  const [tipoLoginOriginal, setTipoLoginOriginal] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkUserType = async () => {
      const ativoTipo = await AsyncStorage.getItem('usuarioAtivoTipo');
      const loginOriginal = await AsyncStorage.getItem('tipoLoginOriginal');
      setUsuarioAtivoTipo(ativoTipo);
      setTipoLoginOriginal(loginOriginal);
      setReady(true);
    };
    checkUserType();
  }, []);

  if (!ready) return null;
  
  const isResponsavelAtivo =
    tipoLoginOriginal === 'responsavel' && usuarioAtivoTipo === 'responsavel';

  const isFilhoAtivo = usuarioAtivoTipo === 'filho';

  return (
    <Tab.Navigator
      initialRouteName={isResponsavelAtivo ? "CalendarTab" : "Home"}
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
      {!isResponsavelAtivo && (
        <Tab.Screen
          name="CameraTab"
          component={CameraScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="camera" color={color} size={scale(24)} />
            ),
          }}
        />
      )}

      {isResponsavelAtivo && (
        <Tab.Screen
          name="CalendarTab"
          component={CalendarScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="calendar" color={color} size={scale(24)} />
            ),
          }}
        />
      )}

      {!isResponsavelAtivo && (
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" color={color} size={scale(24)} />
            ),
          }}
        />
      )}

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
  dummyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F9F4' },
  dummyText: { fontSize: scaleFont(20), fontWeight: 'bold', color: colors.primaryGreen },
});