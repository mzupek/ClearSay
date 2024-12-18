import React from "react"
import { View, ViewStyle } from "react-native"
import { Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"

export const ObjectProgressScreen = observer(function ObjectProgressScreen() {
  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} style={$screenContainer}>
      <View style={$mainContainer}>
        <Text text="Object Progress" preset="heading" style={$title} />
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

const $title: TextStyle = {
  marginBottom: spacing.large,
  textAlign: "center",
}

const $text: TextStyle = {
  textAlign: "center",
} 