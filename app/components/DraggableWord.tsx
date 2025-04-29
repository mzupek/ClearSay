import * as React from "react"
import { StyleProp, TextStyle, ViewStyle, Pressable } from "react-native"
import { Text } from "./Text"
import { colors, spacing } from "../theme"

export interface DraggableWordProps {
  /**
   * The unique identifier for the word
   */
  id: string
  /**
   * The text to display
   */
  text: string
  /**
   * Whether the word has been matched to an image
   */
  isMatched?: boolean
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * An optional style override for the text.
   */
  textStyle?: StyleProp<TextStyle>
}

/**
 * A draggable word component that can be matched with images.
 */
export function DraggableWord(props: DraggableWordProps) {
  const { id, text, isMatched, style: $styleOverride, textStyle: $textStyleOverride } = props

  if (isMatched) {
    return null // Don't render matched words
  }

  return (
    <Pressable
      style={[
        $containerBase,
        $styleOverride,
      ]}
    >
      <Text
        text={text}
        style={[$text, $textStyleOverride]}
      />
    </Pressable>
  )
}

const $containerBase: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.small,
  padding: spacing.small,
  minWidth: 100,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
}

const $text: TextStyle = {
  fontSize: 16,
  fontWeight: "500",
  textAlign: "center",
} 