import React, { FC } from "react"
import { View, ViewStyle, Image, ImageStyle, Text, TextStyle, StyleSheet } from "react-native"
import { colors } from "../theme"

interface DroppableAreaProps {
  id: string
  imageSource: string
  isMatched: boolean
  style?: ViewStyle
  onDrop?: (wordId: string) => void
}

export const DroppableArea: FC<DroppableAreaProps> = ({
  id,
  imageSource,
  isMatched,
  style,
  onDrop,
}) => {
  return (
    <View style={[styles.container, style, isMatched && styles.matched]}>
      <Image source={{ uri: imageSource }} style={styles.image} resizeMode="contain" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    margin: 8,
  },
  matched: {
    borderColor: colors.palette.success300,
    backgroundColor: colors.palette.success100,
  },
  image: {
    width: "80%",
    height: "80%",
  },
}) 