import React, { FC } from "react"
import { ViewStyle } from "react-native"
import { Button, Screen, Text } from "../components"
import { colors, spacing } from "../theme"

export const CreateObjectSetScreen: FC = function CreateObjectSetScreen() {
  return (
    <Screen
      preset="scroll"
      contentContainerStyle={$container}
      safeAreaEdges={["bottom"]}
    >
      {/* Add form components here */}
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.large,
  backgroundColor: colors.background,
} 