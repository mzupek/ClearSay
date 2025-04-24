import React, { FC } from "react"
import { ViewStyle } from "react-native"
import { Button, Screen, Text } from "../components"
import { colors } from "../theme"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "../navigators"

export const ObjectSetScreen: FC = function ObjectSetScreen() {
  const navigation = useNavigation<AppStackScreenProps<"ObjectSet">["navigation"]>()

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$container}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text tx="objectSetScreen:title" preset="heading" />
      <Button
        tx="objectSetScreen:practice"
        onPress={() => navigation.navigate("ObjectSetPractice")}
        style={$button}
      />
      <Button
        tx="objectSetScreen:progress"
        onPress={() => navigation.navigate("ObjectSetProgress")}
        style={$button}
      />
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
  padding: 16,
}

const $button: ViewStyle = {
  marginVertical: 8,
}