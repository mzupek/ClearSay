import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { ObjectPracticeScreen } from "app/screens/ObjectPracticeScreen"
import { ObjectProgressScreen } from "app/screens/ObjectProgressScreen"
import { ObjectManagerScreen } from "app/screens/ObjectManagerScreen"
import { colors } from "app/theme"
import { Icon } from "app/components"

export type ObjectTabParamList = {
  ObjectPractice: undefined
  ObjectProgress: undefined
  ObjectManager: undefined
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
      initialRouteName="ObjectPractice"
    >
      <Tab.Screen 
        name="ObjectPractice" 
        component={ObjectPracticeScreen}
        options={{
          title: "Image Recognition",
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
        name="ObjectManager" 
        component={ObjectManagerScreen}
        options={{
          title: "Objects",
          tabBarLabel: 'Objects',
          tabBarIcon: ({ color, size }) => (
            <Icon icon="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
} 