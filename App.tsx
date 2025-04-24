import "react-native-gesture-handler"
import "@expo/metro-runtime"
import "./app/utils/screens"
import * as SplashScreen from "expo-splash-screen"
import { App } from "./app/app"

SplashScreen.preventAutoHideAsync()

function ClearSayApp() {
  return <App hideSplashScreen={() => SplashScreen.hideAsync().then(() => {})} />
}

export default ClearSayApp
