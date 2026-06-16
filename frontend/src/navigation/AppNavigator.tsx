import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/Login/LoginScreen";
import RegisterScreen from "../screens/Register/RegisterScreen";
import AnalysisScreen from "../screens/Analysis/AnalysisScreen";
import FoodResultScreen from "../screens/FoodResult/FoodResultScreen";
import PaymentScreen from "../screens/Payment/PaymentScreen";
import AdminScreen from "../screens/Admin/AdminScreen";
import TabNavigator from "./TabNavigator";
import AddDependentScreen from "../screens/AddDependent/AddDependentScreen";
import RecuperarSenha from "../screens/RecoverPassword/RecoverPasswordScreen";

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
        <Stack.Screen name="HomeTab" component={TabNavigator} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
        <Stack.Screen name="FoodResult" component={FoodResultScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="AddDependent" component={AddDependentScreen} />
        <Stack.Screen name="RecuperarSenha" component={RecuperarSenha} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}