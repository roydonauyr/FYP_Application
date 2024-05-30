import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "./constants/styles";

// Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
import AllChat from "./screens/AllChat";
import UpcomingEvents from "./screens/UpcomingEvents";
import Profile from "./screens/Profile";
import Chat from "./screens/Chat";

//Create Navigation items
const Stack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();

// Other components
import IconButton from "./components/UI/IconButton";
import EntypoButton from "./components/UI/EntypoButton";
import SearchBar from "./components/UI/SearchBar";

function MainOverview() {
  return (
    <BottomTabs.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: GlobalStyles.colors.primary100,
          shadowOpacity: 0, // remove shadow on iOS
          elevation: 0, // remove shadow on Android
        },
        headerTintColor: "white",
        tabBarStyle: { backgroundColor: GlobalStyles.colors.primary100 },
        tabBarActiveTintColor: GlobalStyles.colors.accent500,
        headerRight: ({ tintColor }) => (
          <EntypoButton
            icon="new-message"
            size={24}
            color={tintColor}
            onPress={() => {
              navigation.navigate("Chat");
            }}
          />
        ),
      })}
    >
      <BottomTabs.Screen
        name="AllChat"
        component={AllChat}
        options={{
          title: "All Chat",
          tabBarLabel: "All Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hourglass" size={size} color={color} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Upcoming Events"
        component={UpcomingEvents}
        options={{
          title: "Upcoming Events",
          tabBarLabel: "Upcoming Events",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Profile"
        component={Profile}
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
    </BottomTabs.Navigator>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: GlobalStyles.colors.primary50 },
            headerTintColor: "white",
          }}
        >
          <Stack.Screen
            name="MainOverview"
            component={MainOverview}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AllChat"
            component={AllChat}
            options={{
              presentation: "modal",
              headerTitle: () => <SearchBar />,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
