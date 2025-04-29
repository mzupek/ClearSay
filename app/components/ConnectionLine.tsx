import React from "react"
import { View } from "react-native"
import { colors } from "../theme"

interface ConnectionLineProps {
  startX: number
  startY: number
  endX: number
  endY: number
  isCorrect: boolean
}

export const ConnectionLine = ({ startX, startY, endX, endY, isCorrect }: ConnectionLineProps) => {
  // Calculate the line length and angle
  const dx = endX - startX
  const dy = endY - startY
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  // Calculate the center point of the line for absolute positioning
  const centerX = (startX + endX) / 2
  const centerY = (startY + endY) / 2

  return (
    <View
      style={{
        position: "absolute",
        left: centerX - length / 2,
        top: centerY,
        width: length,
        height: 3,
        backgroundColor: isCorrect ? colors.palette.success300 : colors.palette.angry500,
        transform: [
          { translateY: -1.5 },
          { rotateZ: `${angle}deg` },
        ],
        opacity: 0.8,
        borderRadius: 1.5,
        zIndex: 1,
      }}
    />
  )
} 