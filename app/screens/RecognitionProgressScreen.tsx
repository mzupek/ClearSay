import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, ScrollView, TouchableOpacity, TextStyle } from "react-native"
import { Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { useStores } from "app/models"

export const RecognitionProgressScreen = observer(function RecognitionProgressScreen() {
  const { recognitionPractice: store } = useStores()
  const [timeRange, setTimeRange] = useState<number>(7) // days

  const dailyStats = store.getDailyStats(timeRange)

  return (
    <Screen preset="scroll" contentContainerStyle={$screenContainer}>
      <Text preset="heading" text="Your Progress" style={$heading} />
      
      <View style={$timeRangeButtons}>
        {[7, 14, 30].map(days => (
          <TouchableOpacity
            key={days}
            style={[
              $timeButton,
              timeRange === days && $selectedTimeButton
            ]}
            onPress={() => setTimeRange(days)}
          >
            <Text 
              text={`${days} Days`} 
              style={[
                $timeButtonText,
                timeRange === days && $selectedTimeButtonText
              ]} 
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text preset="subheading" text="Daily Progress" style={$subheading} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={$dailyStats}>
        {dailyStats.slice(0, 4).map((stat) => (
          <View key={stat.date} style={$dailyStatBox}>
            <Text 
              text={stat.date.split(" ")[0]} 
              style={$dailyMonth} 
            />
            <Text 
              text={stat.date.split(" ")[1]} 
              style={$dailyDay} 
            />
            <Text text={`${stat.accuracy}%`} style={$dailyAccuracy} />
            <Text text={stat.sessions.toString()} style={$dailyCount} />
            <Text text="sessions" style={$dailySessions} />
          </View>
        ))}
      </ScrollView>

      <Text preset="subheading" text="Word Performance" style={$subheading} />
      <View style={$wordPerformance}>
        {/* Word performance content will go here */}
      </View>
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  padding: spacing.medium,
}

const $heading: TextStyle = {
  marginBottom: spacing.extraLarge,
  fontSize: 34,
  fontWeight: "600",
  color: colors.text,
}

const $timeRangeButtons: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-start",
  gap: spacing.small,
  marginBottom: spacing.extraLarge,
}

const $timeButton: ViewStyle = {
  paddingVertical: spacing.small,
  paddingHorizontal: spacing.medium + 4,
  borderRadius: 20,
}

const $selectedTimeButton: ViewStyle = {
  backgroundColor: colors.palette.angry100,
}

const $timeButtonText: TextStyle = {
  fontSize: 16,
  fontWeight: "500",
  color: colors.textDim,
}

const $selectedTimeButtonText: TextStyle = {
  color: colors.palette.neutral100,
}

const $subheading: TextStyle = {
  fontSize: 28,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.large,
}

const $dailyStats: ViewStyle = {
  marginBottom: spacing.extraLarge,
}

const $dailyStatBox: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.medium,
  borderRadius: spacing.medium,
  marginRight: spacing.medium,
  alignItems: "center",
  justifyContent: "center",
  width: 85,
  aspectRatio: 0.85,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 2,
}

const $dailyMonth: TextStyle = {
  fontSize: 12,
  fontWeight: "500",
  color: colors.textDim,
  marginBottom: spacing.tiny / 2,
}

const $dailyDay: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.textDim,
  marginBottom: spacing.small,
}

const $dailyAccuracy: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.tiny,
}

const $dailyCount: TextStyle = {
  fontSize: 14,
  fontWeight: "500",
  color: colors.textDim,
  marginBottom: spacing.tiny / 2,
}

const $dailySessions: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
}

const $wordPerformance: ViewStyle = {
  marginTop: spacing.medium,
} 