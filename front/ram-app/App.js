import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import './firebase';
import { ThemeProvider, ThemeContext } from './ThemeContext';

// ✅ Importations corrigées
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MesVoyagesScreen from './screens/MesVoyagesScreen';
import BagageFavorisScreen from './screens/BagageFavorisScreen';
import AjouterUnVolScreen from './screens/AjouterUnVolScreen';
import DetailVoyageScreen from './screens/DetailVoyageScreen';
import AjouterBagageScreen from './screens/AjouterBagageScreen';
import AjouterBagageFavoriScreen from './screens/AjouterBagageFavoriScreen';
import ChoisirBagageFavoriScreen from './screens/ChoisirBagageFavoriScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen'; // <-- AJOUTE CETTE LIGNE !


import CustomDrawerContent from './components/CustomDrawerContent';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerScreens() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        gestureEnabled: true,
        swipeEdgeWidth: 50,
        headerTintColor: isDark ? '#fff' : '#000',
        drawerActiveTintColor: '#d34f4f',
        drawerInactiveTintColor: '#777',
        drawerLabelStyle: { marginLeft: -16, fontSize: 15 },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Mes Voyages" component={MesVoyagesScreen} />
      <Drawer.Screen name="Mes Bagages" component={BagageFavorisScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemeContext.Consumer>
          {({ theme }) => (
            <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="Login"
              >
                 <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="Register" component={RegisterScreen} />
  <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
  <Stack.Screen name="DrawerNav" component={DrawerScreens} />
  <Stack.Screen name="AjouterUnVol" component={AjouterUnVolScreen} />
  <Stack.Screen name="DetailVoyage" component={DetailVoyageScreen} />
  <Stack.Screen name="AjouterBagage" component={AjouterBagageScreen} />
  <Stack.Screen name="AjouterBagageFavori" component={AjouterBagageFavoriScreen} />
  <Stack.Screen name="ChoisirBagageFavori" component={ChoisirBagageFavoriScreen} />
              </Stack.Navigator>
              <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            </NavigationContainer>
          )}
        </ThemeContext.Consumer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
