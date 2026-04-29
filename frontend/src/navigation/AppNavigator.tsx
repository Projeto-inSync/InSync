import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileSelectionScreen from '../screens/ProfileSelectionScreen'; 
import ChildRegisterScreen from '../screens/ChildRegisterScreen';
import ResponsibleRegisterScreen from '../screens/ResponsibleRegisterScreen';

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
        <Stack.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ChildRegister" component={ChildRegisterScreen} />
        <Stack.Screen name="ResponsibleRegister" component={ResponsibleRegisterScreen} />
      {}
      </Stack.Navigator> 
    </NavigationContainer>
  );
}