import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { ObjectPracticeScreen } from "app/screens/ObjectPracticeScreen"
import { ObjectProgressScreen } from "app/screens/ObjectProgressScreen"
import { ObjectSettingsScreen } from "app/screens/ObjectSettingsScreen"
import { colors } from "app/theme"
import { Icon } from "app/components"

export type ObjectTabParamList = {
  ObjectPractice: undefined
  ObjectProgress: undefined
  ObjectSettings: undefined
}

const Tab = createBottomTabNavigator<ObjectTabParamList>()

export function ObjectNavigator() {
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
    >
      <Tab.Screen 
        name="ObjectPractice" 
        component={ObjectPracticeScreen}
        options={{
          title: "Practice",
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color, size }) => (
            <Icon icon="components" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="ObjectProgress" 
        component={ObjectProgressScreen}
        options={{
          title: "Progress",
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Icon icon="view" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="ObjectSettings" 
        component={ObjectSettingsScreen}
        options={{
          title: "Settings",
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon icon="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
} 