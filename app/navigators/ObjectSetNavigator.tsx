import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { TextStyle, ViewStyle } from "react-native"
import { Icon } from "../components"
import { colors, spacing, typography } from "../theme"
import { ObjectSetPracticeScreen, ObjectSetProgressScreen, ObjectSetManagerScreen } from "../screens"
import { translate } from "../i18n"

export type ObjectSetTabParamList = {
  ObjectSetPractice: undefined
  ObjectSetProgress: undefined
  ObjectSetManager: undefined
}

const Tab = createBottomTabNavigator<ObjectSetTabParamList>()

export function ObjectSetNavigator() {
  const tabScreenOptions = ({ route }) => ({
    tabBarIcon: ({ focused }) => {
      const icons = {
        ObjectSetPractice: "play",
        ObjectSetProgress: "chart",
        ObjectSetManager: "settings",
      }
      return (
        <Icon
          icon={icons[route.name]}
          color={focused ? colors.tint : colors.textDim}
          size={24}
          containerStyle={$tabIconContainer}
        />
      )
    },
    tabBarLabel: translate(`objectSetNavigator:${route.name.toLowerCase()}`),
    tabBarLabelStyle: $tabBarLabel,
    tabBarStyle: $tabBar,
    headerShown: false,
  })

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="ObjectSetPractice"
        component={ObjectSetPracticeScreen}
      />
      <Tab.Screen
        name="ObjectSetProgress"
        component={ObjectSetProgressScreen}
      />
      <Tab.Screen
        name="ObjectSetManager"
        component={ObjectSetManagerScreen}
      />
    </Tab.Navigator>
  )
}

const $tabBar: ViewStyle = {
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
  height: spacing.huge,
}

const $tabBarLabel: TextStyle = {
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
}

const $tabIconContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  height: 30,
  width: 30,
} 