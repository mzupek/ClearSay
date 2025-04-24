import React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "./Text"
import { colors, spacing } from "app/theme"

interface ProgressBarProps {
  /**
   * Current progress value (1-based)
   */
  current: number
  /**
   * Total number of steps
   */
  total: number
  /**
   * Show numbered indicators below the progress bar
   */
  showNumbers?: boolean
  /**
   * Optional message to display below the progress bar
   */
  message?: string
  /**
   * Container style overrides
   */
  style?: ViewStyle
}

export function ProgressBar(props: ProgressBarProps) {
  const { current, total, showNumbers = true, message, style } = props

  return (
    <View style={[$progressContainer, style]}>
      <View style={$progressBarContainer}>
        <View style={$progressBar}>
          <View 
            style={[
              $progressFill,
              { width: `${(current / total) * 100}%` }
            ]}
          />
        </View>
        {showNumbers && (
          <View style={$roundIndicators}>
            {Array.from({ length: total }).map((_, index) => (
              <View 
                key={index} 
                style={[
                  $roundDot,
                  index < current && $roundDotCompleted
                ]}
              >
                <Text style={$roundNumber}>{index + 1}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {message && (
        <Text style={$progressText}>{message}</Text>
      )}
    </View>
  )
}

const $progressContainer: ViewStyle = {
  width: "90%",
  marginBottom: spacing.medium,
  alignItems: "center",
}

const $progressBarContainer: ViewStyle = {
  width: "100%",
  marginBottom: spacing.small,
}

const $progressBar: ViewStyle = {
  width: "100%",
  height: 6,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 3,
  overflow: "hidden",
  marginBottom: spacing.medium,
}

const $progressFill: ViewStyle = {
  height: "100%",
  backgroundColor: "#4CAF50",
  borderRadius: 3,
}

const $roundIndicators: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  paddingHorizontal: spacing.tiny,
}

const $roundDot: ViewStyle = {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: colors.palette.neutral200,
  justifyContent: "center",
  alignItems: "center",
}

const $roundDotCompleted: ViewStyle = {
  backgroundColor: "#4CAF50",
}

const $roundNumber: TextStyle = {
  fontSize: 12,
  color: colors.text,
  fontWeight: "500",
}

const $progressText: TextStyle = {
  fontSize: 16,
  color: colors.text,
  textAlign: "center",
  marginTop: spacing.small,
} 