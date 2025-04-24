import React, { FC } from "react"
import { ViewStyle } from "react-native"
import { Screen, Text } from "../components"
import { colors } from "../theme"

export const ObjectSetProgressScreen: FC = function ObjectSetProgressScreen() {
  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$container}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text tx="objectSetScreen:progress" preset="heading" />
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
} 