import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Importação de todas as nossas telas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileSelectionScreen from '../screens/ProfileSelectionScreen';
import ChildRegisterScreen from '../screens/ChildRegisterScreen';
import ResponsibleRegisterScreen from '../screens/ResponsibleRegisterScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import FoodResultScreen from '../screens/FoodResultScreen'; // <-- A tela que estava faltando no mapa!
import PaymentScreen from '../screens/PaymentScreen';

// Importação do nosso Menu Inferior (que contém a Home, Perfil, etc)
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        id="RootStack" 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* Fluxo de Autenticação */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
        <Stack.Screen name="ChildRegister" component={ChildRegisterScreen} />
        <Stack.Screen name="ResponsibleRegister" component={ResponsibleRegisterScreen} />
        
        {/* O Menu Principal do App */}
        <Stack.Screen name="HomeTab" component={TabNavigator} />

        {/* Telas de Gamificação (Sobrepostas ao Menu) */}
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
        <Stack.Screen name="FoodResult" component={FoodResultScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}