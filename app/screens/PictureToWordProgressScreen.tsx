import React, { FC } from "react"
import { ViewStyle, View, TextStyle } from "react-native"
import { Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"

export const PictureToWordProgressScreen: FC = observer(function PictureToWordProgressScreen() {
  const { pictureToWordPractice: store } = useStores()

  const accuracy = store.totalAttempts > 0 
    ? Math.round((store.correctAnswers / store.totalAttempts) * 100) 
    : 0

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={$container}
      safeAreaEdges={["top"]}
    >
      <Text text="Practice Progress" preset="heading" style={$title} />
      
      <View style={$statsContainer}>
        <View style={$statBox}>
          <Text text={store.totalAttempts.toString()} preset="heading" style={$statNumber} />
          <Text text="Total Attempts" style={$statLabel} />
        </View>

        <View style={$statBox}>
          <Text text={store.correctAnswers.toString()} preset="heading" style={$statNumber} />
          <Text text="Correct Answers" style={$statLabel} />
        </View>

        <View style={$statBox}>
          <Text text={`${accuracy}%`} preset="heading" style={$statNumber} />
          <Text text="Accuracy" style={$statLabel} />
        </View>
      </View>

      <View style={$section}>
        <Text text="Recent Activity" preset="subheading" style={$sectionTitle} />
        {/* Add recent activity list here when available */}
        <Text text="No recent activity" style={$emptyText} />
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

const $statsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.large,
}

const $statBox: ViewStyle = {
  flex: 1,
  alignItems: "center",
  padding: spacing.medium,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  marginHorizontal: spacing.tiny,
}

const $statNumber: TextStyle = {
  fontSize: 24,
  marginBottom: spacing.tiny,
}

const $statLabel: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
  textAlign: "center",
}

const $section: ViewStyle = {
  marginBottom: spacing.large,
}

const $sectionTitle: TextStyle = {
  marginBottom: spacing.medium,
}

const $emptyText: TextStyle = {
  textAlign: "center",
  color: colors.textDim,
  marginTop: spacing.large,
} 