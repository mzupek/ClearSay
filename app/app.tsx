/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
if (__DEV__) {
  // Load Reactotron in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require("./devtools/ReactotronConfig.ts")
}
import "./utils/gestureHandler"
import { initI18n } from "./i18n"
import "./utils/ignoreWarnings"
import { useFonts } from "expo-font"
import { useEffect } from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import * as Linking from "expo-linking"
import { useInitialRootStore } from "./models"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import * as storage from "./utils/storage"
import { customFontsToLoad } from "./theme"
import Config from "./config"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { loadDateFnsLocale } from "./utils/formatDate"
import { Platform } from 'react-native'
import * as Speech from 'expo-speech'
import * as Permissions from 'expo-permissions'
import { useStores } from "./models"
import { View } from "react-native"
import { colors } from "./theme"
import React from "react"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ViewStyle } from "react-native"
import * as SplashScreen from "expo-splash-screen"
import { RootStore, RootStoreProvider } from "./models"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

const rootStore = RootStore.create({
  objectStore: { objects: [] },
  objectSetStore: { sets: [] },
  practiceStore: {
    isSessionActive: false,
    currentRound: 1,
    currentCharacter: "",
    characterPool: [],
    charactersFound: 0,
    totalTargetCharacters: 0,
    sessionHistory: []
  }
})

// Web linking configuration
const prefix = Linking.createURL("/")
const config = {
  screens: {
    Login: {
      path: "",
    },
    Welcome: "welcome",
    Practice: "practice",
    Settings: "settings",
    Progress: "progress",
    Demo: {
      screens: {
        DemoShowroom: {
          path: "showroom/:queryIndex?/:itemIndex?",
        },
        DemoDebug: "debug",
        DemoPodcastList: "podcast",
        DemoCommunity: "community",
      },
    },
  },
}

interface AppProps {
  hideSplashScreen?: () => Promise<void>
}

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  useEffect(() => {
    async function prepare() {
      try {
        await rootStore.objectStore.loadObjects()
      } catch (e) {
        console.warn(e)
      } finally {
        await SplashScreen.hideAsync()
      }
    }

    if (isNavigationStateRestored) {
      prepare()
    }
  }, [isNavigationStateRestored])

  if (!isNavigationStateRestored) return null

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <RootStoreProvider value={rootStore}>
          <ErrorBoundary catchErrors={Config.catchErrors}>
            <AppNavigator
              initialState={initialNavigationState}
              onStateChange={onNavigationStateChange}
            />
          </ErrorBoundary>
        </RootStoreProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  )
}

const $container: ViewStyle = {
  flex: 1,
}
