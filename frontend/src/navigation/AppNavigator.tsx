import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
// import ProfileSelectionScreen from '../screens/ProfileSelectionScreen';
// import ChildRegisterScreen from '../screens/ChildRegisterScreen';
import ResponsibleRegisterScreen from '../screens/ResponsibleRegisterScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import FoodResultScreen from '../screens/FoodResultScreen';
import PaymentScreen from '../screens/PaymentScreen';
import AdminScreen from '../screens/AdminScreen';
import TabNavigator from './TabNavigator';
import AddDependentScreen from '../screens/AddDependentScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        id="RootStack" 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ResponsibleRegister" component={ResponsibleRegisterScreen} />
        <Stack.Screen name="HomeTab" component={TabNavigator} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
        <Stack.Screen name="FoodResult" component={FoodResultScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="AddDependent" component={AddDependentScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}