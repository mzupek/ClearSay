import React from "react"
import { View, ViewStyle } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { useNavigation } from "@react-navigation/native"

export function WelcomeScreen() {
  const navigation = useNavigation()

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text text="Welcome to ClearSay" preset="heading" style={$title} />
      
      <View style={$buttonContainer}>
        <Button
          text="Letter & Number Practice"
          preset="filled"
          onPress={() => navigation.navigate("MainTabs")}
          style={$button}
        />
        
        <Button
          text="Custom Objects Practice"
          preset="filled"
          onPress={() => navigation.navigate("ObjectTabs")}
          style={$button}
        />
      </View>
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.lg,
}

const $title: TextStyle = {
  marginBottom: spacing.xxxl,
  textAlign: "center",
}

const $buttonContainer: ViewStyle = {
  gap: spacing.md,
}

const $button: ViewStyle = {
  marginVertical: spacing.md,
}
