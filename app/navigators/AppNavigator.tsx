/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { WelcomeScreen } from "app/screens/WelcomeScreen"
import { MainNavigator } from "./MainNavigator"
import { ObjectNavigator } from "./ObjectNavigator"
import { ObjectSetScreen } from "app/screens/ObjectSetScreen"

export type AppStackParamList = {
  Welcome: undefined
  MainTabs: undefined
  ObjectTabs: undefined
  ObjectSet: undefined
}

const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = observer(function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen name="ObjectTabs" component={ObjectNavigator} />
      <Stack.Screen
        name="ObjectSet"
        component={ObjectSetScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
})

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const { navigationRef } = useStores()

  return (
    <NavigationContainer ref={navigationRef} {...props}>
      <AppStack />
    </NavigationContainer>
  )
})
