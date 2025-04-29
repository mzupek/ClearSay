/**
 * The app navigator is used for the primary navigation flows of your app.
 */
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { WelcomeScreen } from "app/screens/WelcomeScreen"
import { MainNavigator } from "./MainNavigator"
import { ObjectNavigator, ObjectTabParamList } from "./ObjectNavigator"
import { ObjectSetScreen } from "app/screens/ObjectSetScreen"
import { CreateObjectSetScreen } from "app/screens/CreateObjectSetScreen"
import { ManageObjectSetsScreen } from "app/screens/ManageObjectSetsScreen"
import { colors } from "app/theme"
import { useRef } from "react"

export type AppStackParamList = {
  Welcome: undefined
  MainTabs: undefined
  ObjectTabs: {
    screen?: keyof ObjectTabParamList
  }
  CreateObjectSet: undefined
  ManageObjectSets: undefined
}

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>

const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = observer(function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background }
      }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen name="ObjectTabs" component={ObjectNavigator} />
      <Stack.Screen 
        name="CreateObjectSet" 
        component={CreateObjectSetScreen}
        options={{
          headerShown: true,
          headerBackTitle: "Back",
          title: "Create Object Set"
        }}
      />
      <Stack.Screen 
        name="ManageObjectSets" 
        component={ManageObjectSetsScreen}
        options={{
          headerShown: true,
          headerBackTitle: "Back",
          title: "Manage Object Sets"
        }}
      />
    </Stack.Navigator>
  )
})

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const navigationRef = useRef<NavigationContainerRef<AppStackParamList>>(null)
  const { setNavigationRef } = useStores()

  return (
    <NavigationContainer 
      ref={navigationRef} 
      onReady={() => {
        if (navigationRef.current) {
          setNavigationRef(navigationRef.current)
        }
      }}
      {...props}
    >
      <AppStack />
    </NavigationContainer>
  )
})
