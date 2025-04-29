/**
 * The app navigator is used for the primary navigation flows of your app.
 */
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { WelcomeScreen } from "app/screens"
import { MainNavigator } from "./MainNavigator"
import { ObjectNavigator, ObjectTabParamList } from "./ObjectNavigator"
import { ObjectSetScreen } from "app/screens/ObjectSetScreen"
import { CreateObjectSetScreen } from "app/screens/CreateObjectSetScreen"
import { ManageObjectSetsScreen } from "app/screens/ManageObjectSetsScreen"
import { colors } from "app/theme"
import { useRef } from "react"
import { PictureToWordNavigator } from "./PictureToWordNavigator"
import { RecognitionNavigator } from "./RecognitionNavigator"

export type InteractiveType = "PictureToWord" | "WordToPicture" | "Spelling" | "Pronunciation" | "Recognition"

export type AppStackParamList = {
  Welcome: undefined
  MainTabs: undefined
  ObjectTabs: {
    screen?: keyof ObjectTabParamList
  }
  CreateObjectSet: {
    editMode?: boolean
    setId?: string
    setData?: {
      name: string
      description: string
      objects: any[] // We'll use any[] for now since the exact type is complex
      category: string
      practiceMode: "sequential" | "random" | "adaptive"
      isActive: boolean
    }
  }
  ManageObjectSets: {
    interactiveType?: InteractiveType
  }
  ObjectManager: undefined
  PictureToWordPractice: undefined
  Recognition: undefined
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
      <Stack.Screen name="ObjectManager" component={ObjectNavigator} />
      <Stack.Screen name="PictureToWordPractice" component={PictureToWordNavigator} />
      <Stack.Screen name="Recognition" component={RecognitionNavigator} />
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
