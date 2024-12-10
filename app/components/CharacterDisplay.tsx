import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { Text } from "./Text"
import { colors } from "app/theme"

interface CharacterDisplayProps {
  character: string
  size?: number
  style?: StyleProp<ViewStyle>
}

export function CharacterDisplay(props: CharacterDisplayProps) {
  const { character, size = 120, style } = props
  
  return (
    <View style={[$container, style]}>
      <Text 
        text={character} 
        style={[$character, { fontSize: size }]}
      />
    </View>
  )
}

const $container: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
  width: 250,
  height: 250,
}

const $character: TextStyle = {
  color: colors.text,
  fontWeight: "bold",
  textAlign: "center",
  textAlignVertical: "center",
} 