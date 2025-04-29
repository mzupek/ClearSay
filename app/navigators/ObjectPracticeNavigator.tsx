import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { colors } from "app/theme"
import { Icon } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { HeaderBackButton } from "@react-navigation/elements"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AppStackParamList } from "./AppNavigator"

// Import screens
import { ObjectPracticeScreen } from "app/screens/ObjectPracticeScreen"
import { ObjectProgressScreen } from "app/screens/ObjectProgressScreen"
import { ObjectSettingsScreen } from "app/screens/ObjectSettingsScreen"

export type ObjectPracticeTabParamList = {
  Practice: undefined
  Progress: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<ObjectPracticeTabParamList>()

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

export function ObjectPracticeNavigator() {
  const navigation = useNavigation<NavigationProp>()

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
        headerLeft: () => (
          <HeaderBackButton
            onPress={() => navigation.navigate("Welcome")}
            tintColor={colors.text}
          />
        ),
      }}
    >
      <Tab.Screen 
        name="Practice" 
        component={ObjectPracticeScreen}
        options={{
          title: "Image Recognition",
          tabBarIcon: ({ color, size }) => (
            <Icon icon="view" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ObjectProgressScreen}
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Icon icon="components" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={ObjectSettingsScreen}
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