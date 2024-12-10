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

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

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
export const App: React.FC<AppProps> = function App(props) {
  console.log("App component rendering")
  
  const {
    rehydrated,
    rootStore,
  } = useInitialRootStore(async () => {
    console.log("RootStore initialization callback")
    try {
      await props.hideSplashScreen?.()
      console.log("Splash screen hidden")
    } catch (error) {
      console.error("Error hiding splash screen:", error)
    }
  })

  const { settingsStore } = useStores()
  console.log("Rehydration status:", rehydrated)

  useEffect(() => {
    console.log("App useEffect triggered, rehydrated:", rehydrated)
    if (rehydrated) {
      console.log("Loading settings...")
      settingsStore.loadSettings().catch(error => {
        console.error("Failed to load settings:", error)
      })
    }
  }, [rehydrated])

  if (!rehydrated) {
    console.log("Showing loading view")
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }} />
    )
  }

  console.log("Rendering full app")
  return (
    <ErrorBoundary catchErrors="always">
      <KeyboardProvider>
        <AppNavigator />
      </KeyboardProvider>
    </ErrorBoundary>
  )
}
