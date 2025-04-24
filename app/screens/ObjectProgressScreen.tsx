import React, { useState } from "react"
import { View, ViewStyle, ScrollView, TextStyle } from "react-native"
import { Screen, Text, Card, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { format, subDays, startOfToday, endOfToday } from "date-fns"
import { Instance } from "mobx-state-tree"
import { RootStoreModel } from "app/models/RootStore"

type RootStoreType = Instance<typeof RootStoreModel>

export const ObjectProgressScreen = observer(function ObjectProgressScreen() {
  const store = useStores() as RootStoreType
  const [selectedPeriod, setSelectedPeriod] = useState(7) // Default to 7 days

  const getDailyStats = () => {
    if (!store.practiceSession) return { attempts: 0, correct: 0 }
    return {
      attempts: store.practiceSession.totalAttempts,
      correct: store.practiceSession.correctAnswers
    }
  }

  const getPeriodStats = () => {
    if (!store.practiceSession) return { attempts: 0, correct: 0, accuracy: "0" }
    const { correctAnswers, totalAttempts } = store.practiceSession
    return {
      attempts: totalAttempts,
      correct: correctAnswers,
      accuracy: totalAttempts > 0 ? ((correctAnswers / totalAttempts) * 100).toFixed(1) : "0"
    }
  }

  const getSetStats = (setId: string) => {
    if (!store.practiceSession) return { attempts: 0, correct: 0, accuracy: "0" }
    if (store.practiceSession.currentSetId !== setId) return { attempts: 0, correct: 0, accuracy: "0" }
    
    const { correctAnswers, totalAttempts } = store.practiceSession
    return {
      attempts: totalAttempts,
      correct: correctAnswers,
      accuracy: totalAttempts > 0 ? ((correctAnswers / totalAttempts) * 100).toFixed(1) : "0"
    }
  }

  const dailyStats = getDailyStats()
  const periodStats = getPeriodStats()

  return (
    <Screen preset="scroll" contentContainerStyle={$screenContainer}>
      <View style={$mainContainer}>
        <Text text="Object Progress" preset="heading" style={$title} />
        
        <View style={$filterContainer}>
          {[7, 14, 30].map(days => (
            <Button
              key={days}
              text={`${days} Days`}
              onPress={() => setSelectedPeriod(days)}
              style={[
                $timeButton,
                selectedPeriod === days && $selectedTimeButton  
              ]}
              textStyle={selectedPeriod === days ? $selectedTimeButtonText : $timeButtonText}
            />
          ))}
        </View>

        <View style={$metricsContainer}>
          <Card
            style={$metricCard}
            ContentComponent={
              <View style={$metricContent}>
                <Text text="Today" style={$metricTitle} />
                <Text text={`${dailyStats.attempts}`} style={$metricValue} />
                <Text text="Objects Practiced" style={$metricLabel} />
                <Text 
                  text={`${dailyStats.correct} correct`} 
                  style={$metricSubtext} 
                />
              </View>
            }
          />

          <Card
            style={$metricCard}
            ContentComponent={
              <View style={$metricContent}>
                <Text text={`Last ${selectedPeriod} Days`} style={$metricTitle} />
                <Text text={`${periodStats.attempts}`} style={$metricValue} />
                <Text text="Objects Practiced" style={$metricLabel} />
                <Text 
                  text={`${periodStats.correct} correct (${periodStats.accuracy}%)`} 
                  style={$metricSubtext} 
                />
              </View>
            }
          />
        </View>

        <Text text="Sets Progress" style={$sectionTitle} />
        <ScrollView style={$setsContainer}>
          {store.objectSets.map(set => {
            const setStats = getSetStats(set.id)
            return (
              <Card
                key={set.id}
                style={$setCard}
                ContentComponent={
                  <View style={$setContent}>
                    <Text text={set.name} style={$setTitle} />
                    <View style={$setStats}>
                      <View style={$statColumn}>
                        <Text text={`${setStats.attempts}`} style={$statValue} />
                        <Text text="Attempts" style={$statLabel} />
                      </View>
                      <View style={$statColumn}>
                        <Text text={`${setStats.correct}`} style={$statValue} />
                        <Text text="Correct" style={$statLabel} />
                      </View>
                      <View style={$statColumn}>
                        <Text text={`${setStats.accuracy}%`} style={$statValue} />
                        <Text text="Accuracy" style={$statLabel} />
                      </View>
                    </View>
                  </View>
                }
              />
            )
          })}
        </ScrollView>
      </View>
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $mainContainer: ViewStyle = {
  flex: 1,
  padding: spacing.large,
}

const $title: TextStyle = {
  marginBottom: spacing.large,
  textAlign: "center",
}

const $statsCard: ViewStyle = {
  marginBottom: spacing.large,
}

const $objectsCard: ViewStyle = {
  flex: 1,
}

const $statsHeading: ViewStyle = {
  padding: spacing.medium,
  backgroundColor: colors.palette.neutral200,
}

const $statsTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
}

const $statsContent: ViewStyle = {
  padding: spacing.medium,
}

const $statRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.small,
}

const $statLabel: TextStyle = {
  fontSize: 16,
}

const $statValue: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
}

const $objectsList: ViewStyle = {
  maxHeight: 400,
}

const $objectRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.small,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral200,
}

const $objectName: TextStyle = {
  fontSize: 16,
  flex: 1,
}

const $objectStats: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.medium,
}

const $objectScore: TextStyle = {
  fontSize: 16,
}

const $objectAccuracy: TextStyle = {
  fontSize: 16,
  minWidth: 60,
  textAlign: "right",
}

const $filterContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  gap: spacing.small,
  marginBottom: spacing.large,
}

const $filterButton: ViewStyle = {
  minWidth: 100,
  backgroundColor: colors.palette.neutral300,
}

const $activeFilterButton: ViewStyle = {
  backgroundColor: colors.palette.neutral800,
}

const $historyCard: ViewStyle = {
  flex: 1,
}

const $historyList: ViewStyle = {
  maxHeight: 400,
}

const $historyRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.small,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral200,
  paddingHorizontal: spacing.medium,
}

const $historyInfo: ViewStyle = {
  flex: 1,
}

const $historyResult: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.small,
}

const $timestamp: TextStyle = {
  fontSize: 12,
  color: colors.palette.neutral600,
}

const $setName: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral600,
}

const $resultMark: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  minWidth: 24,
  textAlign: "center",
}

const $correctMark: TextStyle = {
  color: colors.palette.accent500,
}

const $incorrectMark: TextStyle = {
  color: colors.palette.angry500,
}

const $metricsContainer: ViewStyle = {
  flexDirection: "row",
  gap: spacing.medium,
  marginBottom: spacing.large,
}

const $metricCard: ViewStyle = {
  flex: 1,
}

const $metricContent: ViewStyle = {
  alignItems: "center",
  padding: spacing.medium,
}

const $metricTitle: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral600,
  marginBottom: spacing.tiny,
}

const $metricValue: TextStyle = {
  fontSize: 36,
  fontWeight: "bold",
  color: colors.text,
  marginBottom: spacing.tiny,
  lineHeight: 40,
}

const $metricLabel: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral600,
  marginBottom: spacing.tiny,
}

const $metricSubtext: TextStyle = {
  fontSize: 14,
  color: colors.text,
}

const $periodCard: ViewStyle = {
  marginBottom: spacing.large,
}

const $sectionTitle: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: spacing.medium,
}

const $setsContainer: ViewStyle = {
  flex: 1,
}

const $setCard: ViewStyle = {
  marginBottom: spacing.medium,
}

const $setContent: ViewStyle = {
  padding: spacing.medium,
}

const $setTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: spacing.medium,
}

const $setStats: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  padding: spacing.medium,
}

const $statColumn: ViewStyle = {
  alignItems: "center",
  padding: spacing.medium,
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
