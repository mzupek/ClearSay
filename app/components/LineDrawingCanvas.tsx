import React, { useRef, useState } from "react"
import { View, ViewStyle, PanResponder, Animated, Dimensions } from "react-native"
import { colors } from "../theme"

export interface Point {
  x: number
  y: number
}

export interface Connection {
  wordId: string
  imageId: string
  isCorrect: boolean
  startPoint: Point
  endPoint: Point
}

interface LineDrawingCanvasProps {
  onConnect: (wordId: string, imageId: string) => void
  connections: Connection[]
  layouts: {
    [key: string]: { x: number; y: number; width: number; height: number; type: "word" | "image" }
  }
}

export function LineDrawingCanvas({ onConnect, connections, layouts }: LineDrawingCanvasProps) {
  const [currentLine, setCurrentLine] = useState<{
    start: Point
    end: Point
    sourceId: string
    sourceType: "word" | "image"
  } | null>(null)

  const findElementAtPoint = (x: number, y: number) => {
    for (const [id, layout] of Object.entries(layouts)) {
      if (
        x >= layout.x &&
        x <= layout.x + layout.width &&
        y >= layout.y &&
        y <= layout.y + layout.height
      ) {
        return { id, type: layout.type }
      }
    }
    return null
  }
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const { pageX, pageY } = evt.nativeEvent
        const element = findElementAtPoint(pageX, pageY)
        
        if (element) {
          const layout = layouts[element.id]
          const centerX = layout.x + layout.width / 2
          const centerY = layout.y + layout.height / 2
          
          setCurrentLine({
            start: { x: centerX, y: centerY },
            end: { x: centerX, y: centerY },
            sourceId: element.id,
            sourceType: element.type
          })
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (currentLine) {
          const { pageX, pageY } = evt.nativeEvent
          setCurrentLine({
            ...currentLine,
            end: { x: pageX, y: pageY }
          })
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (currentLine) {
          const { pageX, pageY } = evt.nativeEvent
          const element = findElementAtPoint(pageX, pageY)
          if (element && element.type !== currentLine.sourceType) {
            const wordId = currentLine.sourceType === "word" ? currentLine.sourceId : element.id
            const imageId = currentLine.sourceType === "image" ? currentLine.sourceId : element.id
            onConnect(wordId, imageId)
          }
          setCurrentLine(null)
        }
      }
    })
  ).current

  const getLineStyle = (start: Point, end: Point) => {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * 180 / Math.PI

    return {
      width: length,
      transform: [
        { translateX: start.x },
        { translateY: start.y },
        { rotate: `${angle}deg` },
        { translateX: 0 },
        { translateY: -2 }, // Half the line height to center it
      ]
    }
  }

  return (
    <View style={$canvas} {...panResponder.panHandlers}>
      {/* Render existing connections */}
      {connections.map((connection, index) => (
        <View
          key={`${connection.wordId}-${connection.imageId}`}
          style={[
            $line,
            getLineStyle(connection.startPoint, connection.endPoint),
            {
              backgroundColor: connection.isCorrect ? colors.palette.neutral300 : colors.palette.angry500,
              height: 4, // Make lines thicker
            }
          ]}
        />
      ))}

      {/* Render current line being drawn */}
      {currentLine && (
        <View
          style={[
            $line,
            getLineStyle(currentLine.start, currentLine.end),
            {
              backgroundColor: colors.palette.neutral400,
              height: 4, // Make lines thicker
            }
          ]}
        />
      )}
    </View>
  )
}

const $canvas: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "transparent",
  zIndex: 1,
  elevation: 1, // Add elevation for Android
}

const $line: ViewStyle = {
  position: "absolute",
  height: 4, // Default line thickness
  backgroundColor: colors.palette.neutral400,
  transformOrigin: "left",
  borderRadius: 2, // Round the line edges
} 