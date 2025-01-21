import React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"

export const ObjectPracticeScreen = observer(function ObjectPracticeScreen() {
  const navigation = useNavigation()

  const handleExitSession = () => {
    navigation.navigate("Welcome")
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} style={$screenContainer}>
      <View style={$mainContainer}>
        <View style={$exitButtonContainer}>
          <Button
            preset="default"
            text="Exit Session"
            onPress={handleExitSession}
            style={$exitButton}
          />
        </View>

        <Text text="Object Practice" preset="heading" style={$title} />
        <Text text="Coming soon..." style={$text} />
      </View>
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $mainContainer: ViewStyle = {
  flex: 1,
  padding: spacing.large,
  alignItems: "center",
  justifyContent: "center",
}

const $exitButtonContainer: ViewStyle = {
  position: 'absolute',
  top: spacing.medium,
  left: spacing.medium,
  zIndex: 1,
}

const $exitButton: ViewStyle = {
  minWidth: 100,
  backgroundColor: colors.palette.neutral400,
}

const $title: TextStyle = {
  marginBottom: spacing.large,
  textAlign: "center",
}

const $text: TextStyle = {
  textAlign: "center",
} 