import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text } from "app/components"

export const ProgressScreen = observer(function ProgressScreen() {
  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$screenContainer}
    >
      <Text
        preset="heading"
        text="Your Progress"
        style={$heading}
      />
      
      <Text
        preset="subheading"
        text="Progress stats coming soon"
        style={$subheading}
      />
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
  padding: 24,
  alignItems: "center",
  justifyContent: "center",
}

const $heading: ViewStyle = {
  marginBottom: 8,
  textAlign: "center",
}

const $subheading: ViewStyle = {
  marginBottom: 32,
  textAlign: "center",
} 