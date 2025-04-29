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
import { useEffect, useState } from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import * as Linking from "expo-linking"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import * as storage from "./utils/storage"
import { customFontsToLoad } from "./theme"
import Config from "./config"
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
import { RootStoreModel, RootStoreProvider } from "./models"
import { setupRootStore } from "./models/helpers/setupRootStore"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Create the initial root store
const rootStore = RootStoreModel.create({
  objects: [],
  objectSets: [],
  currentObjectSet: null,
  currentObject: null,
  navigationRef: undefined,
  currentUser: undefined,
  practiceSession: {},
  practiceStore: {},
  settingsStore: {
    selectedVoiceId: "",
    selectedVoiceName: "",
    availableVoices: []
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
export function App({ hideSplashScreen }: AppProps) {
  const [rehydrated, setRehydrated] = useState(false)
  
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize the root store with persistence
        await setupRootStore(rootStore)
        // Ensure default data exists after rehydration
        rootStore.setupDefaultData()
        setRehydrated(true)
      } catch (e) {
        console.warn(e)
      } finally {
        if (hideSplashScreen) {
          await hideSplashScreen()
        } else {
          await SplashScreen.hideAsync()
        }
      }
    }

    if (isNavigationStateRestored) {
      prepare()
    }
  }, [isNavigationStateRestored, hideSplashScreen])

  // Wait for rehydration to complete
  if (!isNavigationStateRestored || !rehydrated) return null

  return (
    <GestureHandlerRootView style={$container}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <RootStoreProvider value={rootStore}>
          <ErrorBoundary catchErrors={Config.catchErrors}>
            <AppNavigator
              initialState={initialNavigationState}
              onStateChange={onNavigationStateChange}
            />
          </ErrorBoundary>
        </RootStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const $container: ViewStyle = {
  flex: 1,
}
