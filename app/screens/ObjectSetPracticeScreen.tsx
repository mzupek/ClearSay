import React, { FC } from "react"
import { ViewStyle } from "react-native"
import { Screen, Text } from "../components"
import { colors } from "../theme"

export const ObjectSetPracticeScreen: FC = function ObjectSetPracticeScreen() {
  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$container}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text tx="objectSetScreen:practice" preset="heading" />
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
} 