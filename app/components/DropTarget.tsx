import React, { FC } from "react"
import { View, ViewStyle } from "react-native"
import { colors, spacing } from "app/theme"

interface DropTargetProps {
  id: string
  style?: ViewStyle
  onDrop?: (wordId: string) => void
  children: React.ReactNode
}

export const DropTarget: FC<DropTargetProps> = ({
  id,
  style,
  onDrop,
  children,
}) => {
  return (
    <View
      style={[$container, style]}
      onStartShouldSetResponder={() => true}
      onResponderRelease={(event) => {
        // Handle drop event
        onDrop?.(id)
      }}
    >
      {children}
    </View>
  )
}

const $container: ViewStyle = {
  width: 150,
  height: 150,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  margin: spacing.small,
  borderWidth: 2,
  borderColor: colors.palette.neutral400,
  borderStyle: "dashed",
} 