import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { PictureToWordPracticeScreen } from "app/screens/PictureToWordPracticeScreen"
import { colors } from "app/theme"
import { Icon } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { HeaderBackButton } from "@react-navigation/elements"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AppStackParamList } from "./AppNavigator"

// Create new screens for Progress and Settings
import { PictureToWordProgressScreen } from "app/screens/PictureToWordProgressScreen"
import { PictureToWordSettingsScreen } from "app/screens/PictureToWordSettingsScreen"

export type PictureToWordTabParamList = {
  Practice: undefined
  Progress: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<PictureToWordTabParamList>()

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

export function PictureToWordNavigator() {
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
        component={PictureToWordPracticeScreen}
        options={{
          title: "Practice",
          tabBarIcon: ({ color, size }) => (
            <Icon icon="view" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={PictureToWordProgressScreen}
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Icon icon="components" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={PictureToWordSettingsScreen}
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