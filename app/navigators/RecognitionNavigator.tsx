import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { colors } from "app/theme"
import { Icon } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { HeaderBackButton } from "@react-navigation/elements"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AppStackParamList } from "./AppNavigator"

// Create new screens for Recognition
import { RecognitionPracticeScreen } from "app/screens/RecognitionPracticeScreen"
import { RecognitionProgressScreen } from "app/screens/RecognitionProgressScreen"
import { RecognitionSettingsScreen } from "app/screens/RecognitionSettingsScreen"

export type RecognitionTabParamList = {
  Practice: undefined
  Progress: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<RecognitionTabParamList>()

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

export function RecognitionNavigator() {
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
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
    >
      <Tab.Screen 
        name="Practice" 
        component={RecognitionPracticeScreen}
        options={{
          title: "Name the Picture",
          tabBarIcon: ({ color, size }) => (
            <Icon icon="view" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={RecognitionProgressScreen}
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Icon icon="components" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={RecognitionSettingsScreen}
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