import { useState } from "react";
import { ActivityIndicator, Button, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { CalculatorScreen } from "./src/screens/CalculatorScreen";
import { CarDetailsScreen } from "./src/screens/CarDetailsScreen";
import { FavoritesScreen } from "./src/screens/FavoritesScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MyOffersScreen } from "./src/screens/MyOffersScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type RootStackParamList = {
  Tabs: undefined;
  CarDetails: { carId: number };
};

function AppNavigator() {
  const { loading, user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator /></View>;

  if (!user) {
    return showRegister
      ? <RegisterScreen onBack={() => setShowRegister(false)} />
      : <LoginScreen onRegister={() => setShowRegister(true)} />;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="CarDetails"
        component={CarDetailsRoute}
        options={{ title: "Szczegóły auta" }}
      />
    </Stack.Navigator>
  );
}

function CarDetailsRoute({ route }: { route: { params: { carId: number } } }) {
  return <CarDetailsScreen carId={route.params.carId} />;
}

function TabsNavigator({ navigation }: { navigation: any }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Oferty" options={{
        headerRight: () => <Button title="Profil" onPress={() => navigation.navigate("Profil")} />,
      }}>
        {() => <HomeScreen onOpenCar={(carId) => navigation.navigate("CarDetails", { carId })} />}
      </Tab.Screen>
      <Tab.Screen name="Ulubione" component={FavoritesScreen} />
      <Tab.Screen name="Moje oferty" component={MyOffersScreen} />
      <Tab.Screen name="Kalkulator" component={CalculatorScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
