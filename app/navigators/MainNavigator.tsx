import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { PracticeScreen } from "app/screens/PracticeScreen"
import { ProgressScreen } from "app/screens/ProgressScreen"
import { SettingsScreen } from "app/screens/SettingsScreen"
import { colors } from "app/theme"
import { Icon } from "app/components"

export type MainTabParamList = {
  Practice: undefined
  Progress: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.text,
      }}
      initialRouteName="Practice"
    >
      <Tab.Screen 
        name="Practice" 
        component={PracticeScreen}
        options={{
          title: "Visual Scanning",
          tabBarIcon: ({ color, size }) => (
            <Icon icon="view" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Icon icon="components" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Icon icon="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
} 