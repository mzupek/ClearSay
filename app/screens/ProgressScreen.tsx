import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, ScrollView, TouchableOpacity, TextStyle } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { useStores } from "app/models"
import { formatDistanceToNow } from "date-fns"

export const ProgressScreen = observer(function ProgressScreen() {
  const { practiceStore } = useStores()
  const [selectedChar, setSelectedChar] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<number>(7) // days

  const rangeStats = practiceStore.getDateRangeStats(timeRange)
  const dailyStats = practiceStore.getDailyStats(timeRange)

  // Get unique characters from session history
  const characters = Array.from(
    new Set(practiceStore.sessionHistory.map(s => s.character))
  ).sort()

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

      {rangeStats && (
        <View style={$statsContainer}>
          <View style={$statBox}>
            <Text text="Average Accuracy" style={$statLabel} />
            <Text text={`${rangeStats.averageAccuracy}%`} style={$statValue} />
          </View>
          <View style={$statBox}>
            <Text text="Total Sessions" style={$statLabel} />
            <Text text={rangeStats.sessions.toString()} style={$statValue} />
          </View>
          <View style={$statBox}>
            <Text text="Characters Practiced" style={$statLabel} />
            <Text text={rangeStats.characters.toString()} style={$statValue} />
          </View>
        </View>
      )}

      <Text preset="subheading" text="Daily Progress" style={$subheading} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={$dailyStats}>
        {dailyStats.map((stat, index) => (
          <View key={stat.date} style={$dailyStatBox}>
            <Text text={stat.date} style={$dailyDate} />
            <Text text={`${stat.accuracy}%`} style={$dailyAccuracy} />
            <Text text={`${stat.sessions} sessions`} style={$dailySessions} />
          </View>
        ))}
      </ScrollView>

      <Text preset="subheading" text="Character Performance" style={$subheading} />
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={$charList}>
        {characters.map(char => {
          const stats = practiceStore.getCharacterStats(char)
          if (!stats) return null
          
          return (
            <TouchableOpacity
              key={char}
              style={[
                $charButton,
                selectedChar === char && $selectedCharButton
              ]}
              onPress={() => setSelectedChar(char === selectedChar ? null : char)}
            >
              <Text text={char} style={$charText} />
              <Text text={`${stats.averageAccuracy}%`} style={$charAccuracy} />
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {selectedChar && (
        <View style={$sessionList}>
          <Text text="Recent Sessions" style={$sessionTitle} />
          {practiceStore.sessionHistory
            .filter(s => s.character === selectedChar)
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(session => (
              <View key={session.id} style={$sessionItem}>
                <View style={$sessionHeader}>
                  <Text 
                    text={formatDistanceToNow(session.timestamp, { addSuffix: true })}
                    style={$sessionDate}
                  />
                  <Text text={`${session.accuracy}%`} style={$sessionAccuracy} />
                </View>
                <Text 
                  text={`Found ${session.totalFound} of ${session.totalTargets}`}
                  style={$sessionDetails}
                />
              </View>
            ))}
        </View>
      )}
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  padding: spacing.medium,
}

const $heading: TextStyle = {
  marginBottom: spacing.extraLarge,
  textAlign: "center",
}

const $statsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.extraLarge,
  paddingHorizontal: spacing.small,
}

const $statBox: ViewStyle = {
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.medium,
  borderRadius: 8,
  flex: 1,
  marginHorizontal: spacing.tiny,
}

const $statLabel: TextStyle = {
  fontSize: 14,
  color: colors.textDim,
  marginBottom: spacing.extraSmall,
  textAlign: "center",
}

const $statValue: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
}

const $subheading: TextStyle = {
  marginBottom: spacing.medium,
}

const $charList: ViewStyle = {
  flexGrow: 0,
  marginBottom: spacing.extraLarge,
}

const $charButton: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  padding: spacing.medium,
  borderRadius: 8,
  marginRight: spacing.small,
  alignItems: "center",
  minWidth: 80,
}

const $selectedCharButton: ViewStyle = {
  backgroundColor: colors.palette.primary500,
}

const $charText: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: spacing.extraSmall,
}

const $charAccuracy: TextStyle = {
  fontSize: 14,
  color: colors.textDim,
}

const $sessionList: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.medium,
  borderRadius: 8,
}

const $sessionTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: spacing.medium,
}

const $sessionItem: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  padding: spacing.small,
  borderRadius: 4,
  marginBottom: spacing.extraSmall,
}

const $sessionHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.extraSmall,
}

const $sessionDate: TextStyle = {
  fontSize: 14,
  color: colors.textDim,
}

const $sessionAccuracy: TextStyle = {
  fontSize: 14,
  fontWeight: "bold",
}

const $sessionDetails: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
}

const $timeRangeButtons: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  gap: spacing.small,
  marginBottom: spacing.extraLarge,
}

const $timeButton: ViewStyle = {
  paddingVertical: spacing.extraSmall,
  paddingHorizontal: spacing.small,
  borderRadius: 16,
  backgroundColor: colors.palette.neutral200,
}

const $selectedTimeButton: ViewStyle = {
  backgroundColor: colors.palette.primary500,
}

const $timeButtonText: TextStyle = {
  color: colors.text,
}

const $selectedTimeButtonText: TextStyle = {
  color: colors.palette.neutral100,
}

const $dailyStats: ViewStyle = {
  marginBottom: spacing.extraLarge,
}

const $dailyStatBox: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.small,
  borderRadius: 8,
  marginRight: spacing.small,
  alignItems: "center",
  minWidth: 80,
}

const $dailyDate: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
  marginBottom: spacing.extraSmall,
}

const $dailyAccuracy: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
}

const $dailySessions: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
  marginTop: spacing.extraSmall,
}