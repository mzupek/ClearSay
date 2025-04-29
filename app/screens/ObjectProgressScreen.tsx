import React, { FC } from "react"
import { ViewStyle, View, TextStyle } from "react-native"
import { Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"

export const ObjectProgressScreen: FC = observer(function ObjectProgressScreen() {
  const { recognitionPractice: store } = useStores()

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={$container}
      safeAreaEdges={["top"]}
    >
      <Text text="Practice Progress" preset="heading" style={$title} />
      
      <View style={$section}>
        <Text text="Current Session" preset="subheading" style={$sectionTitle} />
        <View style={$statsContainer}>
          <View style={$statCard}>
            <Text text="Total" style={$statLabel} />
            <Text text="Attempts" style={$statSubLabel} />
            <Text text={store.totalAttempts.toString()} style={$statValue} />
          </View>
          <View style={$statCard}>
            <Text text="Correct" style={$statLabel} />
            <Text text="Answers" style={$statSubLabel} />
            <Text text={store.correctAnswers.toString()} style={$statValue} />
          </View>
          <View style={$statCard}>
            <Text text="Success" style={$statLabel} />
            <Text text="Rate" style={$statSubLabel} />
            <Text 
              text={`${Math.round((store.correctAnswers / Math.max(store.totalAttempts, 1)) * 100)}%`} 
              style={$statValue} 
            />
          </View>
        </View>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.medium,
  backgroundColor: colors.background,
}

const $title: TextStyle = {
  marginBottom: spacing.large,
}

const $section: ViewStyle = {
  marginBottom: spacing.large,
}

const $sectionTitle: TextStyle = {
  marginBottom: spacing.medium,
}

const $statsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: spacing.medium,
}

const $statCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.medium,
  padding: spacing.medium,
  alignItems: "center",
  width: "30%",
  minWidth: 100,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
}

const $statLabel: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  textAlign: "center",
}

const $statSubLabel: TextStyle = {
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.tiny,
}

const $statValue: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  color: colors.text,
  textAlign: "center",
}
