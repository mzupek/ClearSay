import React, { useEffect } from "react"
import { View, ViewStyle, TouchableOpacity, Alert, TextStyle, Dimensions } from "react-native"
import { observer } from "mobx-react-lite"
import { Screen, Text, Button, ProgressBar } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"
import { useNavigation } from "@react-navigation/native"
import { ObjectTabParamList } from "app/navigators/ObjectNavigator"
import { CompositeScreenProps } from "@react-navigation/native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { useHeader } from "app/utils/useHeader"
import * as Speech from "expo-speech"

interface PracticeScreenProps extends BottomTabScreenProps<ObjectTabParamList, "ObjectPractice"> {}

export const PracticeScreen = observer(function PracticeScreen(_props: PracticeScreenProps) {
  const { practiceStore } = useStores()
  const navigation = useNavigation()

  useHeader({
    title: "Visual Scanning",
    leftIcon: "back",
    onLeftPress: () => navigation.goBack(),
  })

  useEffect(() => {
    if (practiceStore.isSessionActive) {
      Speech.speak(`Find the letter ${practiceStore.currentCharacter}`)
    }
  }, [practiceStore.currentCharacter, practiceStore.isSessionActive])

  const handleCharacterPress = (char: string, index: number) => {
    const isCorrect = char === practiceStore.currentCharacter && practiceStore.isTargetPosition(index)
    practiceStore.markPosition(index, isCorrect)

    if (isCorrect) {
      practiceStore.removeTargetPosition(index)
      practiceStore.markCharacterFound(1, 0)

      if (practiceStore.getRemainingTargets() === 0) {
        if (practiceStore.currentRound === 10) {
          practiceStore.recordSession()
          showSessionSummary()
        } else {
          practiceStore.nextRound()
        }
      }
    } else {
      practiceStore.markCharacterFound(0, 1)
    }
  }

  const handleEndRound = () => {
    practiceStore.recordSession()
    const finalScore = practiceStore.accuracy()
    
    // Narrate completion and score
    Speech.speak(`Character complete! Your final score is ${finalScore} percent.`)
    
    Alert.alert(
      "Character Complete!",
      `Analysis: ${finalScore}%\n\nReady to try a new character?`,
      [
        {
          text: "Start New Character",
          onPress: () => {
            practiceStore.startNewGame()
          }
        }
      ]
    )
  }

  const handleEndSession = () => {
    Alert.alert(
      "End Session",
      "Are you sure you want to end this practice session?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "End Session", 
          style: "destructive",
          onPress: () => {
            showSessionSummary()
          }
        }
      ]
    )
  }

  const showSessionSummary = () => {
    const accuracy = practiceStore.accuracy()
    const totalFound = practiceStore.correctAnswers
    const totalAttempts = practiceStore.totalAttempts
    const incorrectAttempts = practiceStore.incorrectAttempts

    Alert.alert(
      "Session Complete! 🎉",
      `Excellent work!\n\n` +
      `Final Accuracy: ${accuracy}%\n` +
      `Characters Found: ${totalFound}\n` +
      `Total Attempts: ${totalAttempts}\n` +
      `Incorrect Attempts: ${incorrectAttempts}\n\n` +
      `Would you like to start a new session?`,
      [
        {
          text: "New Session",
          style: "default",
          onPress: () => {
            practiceStore.endSession()
            practiceStore.startNewGame()
          }
        },
        {
          text: "Exit to Welcome",
          style: "cancel",
          onPress: () => {
            practiceStore.endSession()
            navigation.goBack()
          }
        }
      ],
      { cancelable: false }
    )
  }

  const renderCharacterButton = (char: string, index: number) => {
    const isSelected = practiceStore.isPositionSelected(index)
    const wasCorrect = practiceStore.wasSelectionCorrect(index)

    return (
      <TouchableOpacity
        key={index}
        style={[
          $characterButton,
          isSelected && (wasCorrect ? $correctButton : $incorrectButton)
        ]}
        onPress={() => handleCharacterPress(char, index)}
        disabled={isSelected}
      >
        <Text
          style={[
            $characterText,
            isSelected && $selectedCharacterText
          ]}
        >
          {char}
        </Text>
      </TouchableOpacity>
    )
  }

  if (!practiceStore.isSessionActive) {
    return (
      <Screen preset="scroll" contentContainerStyle={$startContainer}>
        <Text text="Visual Scanning" style={$title} />
        
        <View style={$startContent}>
          <ProgressBar
            current={practiceStore.currentRound}
            total={10}
            message={practiceStore.currentRound === 1 
              ? "Complete 10 rounds to finish the session" 
              : `Round ${practiceStore.currentRound} of 10`}
          />

          <Button
            text="Start Practice ➡️"
            onPress={() => practiceStore.startNewGame()}
            style={$startButton}
            textStyle={$whiteText}
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$container}>
      <View style={$mainContent}>
        <View style={$header}>
          <Text text={`Round: ${practiceStore.currentRound}/10`} style={$score} />
          <Text text={`Accuracy: ${practiceStore.accuracy()}%`} style={$score} />
        </View>

        <ProgressBar
          current={practiceStore.currentRound}
          total={10}
          showNumbers={true}
          style={$gameProgressBar}
        />

        <View style={$flashCard}>
          <Text text="Find all:" style={$instruction} />
          <Text text={practiceStore.currentCharacter} style={$targetChar} />
          <Text text={`Remaining: ${practiceStore.getRemainingTargets()}`} style={$remainingText} />
        </View>

        <View style={$characterGrid}>
          {practiceStore.getCurrentRoundCharacters().map((char, index) =>
            renderCharacterButton(char, index),
          )}
        </View>
      </View>

      <Button
        text="End Session"
        onPress={handleEndSession}
        style={$exitButton}
        textStyle={$exitButtonText}
      />
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.small,
}

const $mainContent: ViewStyle = {
  flex: 1,
  alignItems: "center",
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  marginBottom: spacing.small,
}

const $score: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
}

const $instruction: TextStyle = {
  fontSize: 18,
  lineHeight: 24
}

const $targetChar: TextStyle = {
  fontSize: 42,
  fontWeight: "bold",
  lineHeight: 48,
  textAlign: "center",
  includeFontPadding: false,
}

const $remainingText: TextStyle = {
  fontSize: 14,
  color: colors.textDim,
  marginTop: 0
}

const $characterGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: spacing.tiny,
  backgroundColor: colors.palette.neutral200,
  padding: spacing.small,
  borderRadius: 10,
  marginBottom: spacing.medium,
  width: "100%",
}

const $characterButton: ViewStyle = {
  width: "23%",
  aspectRatio: 1,
  backgroundColor: colors.background,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.tiny,
  minHeight: 60,
}

const $characterText: TextStyle = {
  fontSize: 32,
  fontWeight: "bold",
  color: colors.text,
  textAlign: "center",
  includeFontPadding: false,
  textAlignVertical: "center",
  lineHeight: 36,
}

const $button: ViewStyle = {
  minWidth: 80,
}

const $endButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
  padding: spacing.small,
  borderRadius: 8,
}

const $title: TextStyle = {
  fontSize: 40,
  fontWeight: "bold",
  textAlign: "center",
  marginTop: spacing.extraLarge,
  marginBottom: spacing.huge,
  color: colors.text,
  includeFontPadding: false,
  lineHeight: 48,
}

const $startContainer: ViewStyle = {
  flex: 1,
  padding: spacing.large,
}

const $startContent: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingBottom: spacing.massive,
}

const $startButton: ViewStyle = {
  backgroundColor: "#4CAF50",
  borderRadius: 16,
  padding: spacing.large,
  minHeight: 80,
  width: "100%",
  marginTop: spacing.extraLarge * 2,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 8,
}

const $correctButton: ViewStyle = {
  backgroundColor: "#4CAF50",
}

const $incorrectButton: ViewStyle = {
  backgroundColor: "#FF5252",
}

const $selectedCharacterText: TextStyle = {
  color: colors.text,
  fontWeight: "bold",
}

const $gameProgressBar: ViewStyle = {
  marginBottom: spacing.medium,
}

const $exitButton: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  paddingVertical: spacing.small,
  paddingHorizontal: spacing.medium,
  borderRadius: 8,
  marginBottom: spacing.medium,
  borderWidth: 1,
  borderColor: colors.palette.neutral400,
  alignSelf: "center",
  minWidth: 200,
}

const $exitButtonText: TextStyle = {
  color: colors.text,
  fontSize: 16,
  fontWeight: "500",
  textAlign: "center",
}

const $whiteText: TextStyle = {
  color: colors.palette.neutral100,
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  includeFontPadding: false,
  lineHeight: 32,
}

const $flashCard: ViewStyle = {
  backgroundColor: colors.background,
  borderRadius: 16,
  padding: spacing.small,
  shadowColor: colors.text,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  alignItems: 'center',
  gap: spacing.tiny,
  width: "100%",
  alignSelf: 'center',
  marginBottom: spacing.medium,
  borderWidth: 1,
  borderColor: colors.border,
}
