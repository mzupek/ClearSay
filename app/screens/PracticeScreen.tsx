import React from "react"
import { View, ViewStyle, TouchableOpacity, Alert, TextStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Screen, Text, Button } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"
import { useNavigation } from "@react-navigation/native"
import { useState, useEffect } from "react"
import { speak } from "app/utils/speech"

export const PracticeScreen = observer(function PracticeScreen() {
  const { practiceStore } = useStores()
  const navigation = useNavigation()
  const [selectedChars, setSelectedChars] = useState<{ [key: string]: boolean }>({})
  const [results, setResults] = useState<{ [key: string]: boolean }>({})

  // Speak instructions when round starts
  useEffect(() => {
    if (practiceStore.isSessionActive) {
      speak(
        `Find all of the ${practiceStore.currentCharacter}`, 
        practiceStore.currentCharacter
      )
    }
  }, [practiceStore.currentCharacter, practiceStore.isSessionActive])

  const handleCharacterPress = (char: string, index: number) => {
    const key = `${practiceStore.currentRound}-${index}`
    const isTarget = char === practiceStore.currentCharacter
    
    // Mark as selected and show result
    setSelectedChars(prev => ({ ...prev, [key]: true }))
    setResults(prev => ({ ...prev, [key]: isTarget }))
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
            practiceStore.endSession()
            navigation.goBack()
          }
        }
      ]
    )
  }

  const handleNextRound = () => {
    // Calculate round score
    const currentChars = practiceStore.getCurrentRoundCharacters()
    const foundCount = currentChars.filter((char, index) => {
      const key = `${practiceStore.currentRound}-${index}`
      return selectedChars[key] && results[key]
    }).length

    const totalTargets = currentChars.filter(char => 
      char === practiceStore.currentCharacter
    ).length

    practiceStore.markCharacterFound(foundCount)

    if (practiceStore.currentRound === 10) {
      practiceStore.recordSession()
      const finalScore = practiceStore.accuracy()
      
      // Narrate completion and score
      speak(`Character complete! Your final score is ${finalScore} percent.`)
      
      Alert.alert(
        "Character Complete!",
        `Analysis: ${finalScore}%\n\nReady to try a new character?`,
        [
          {
            text: "Start New Character",
            onPress: () => {
              practiceStore.startNewGame()
              setSelectedChars({})
              setResults({})
            }
          }
        ]
      )
    } else {
      practiceStore.nextRound()
      setSelectedChars({})
      setResults({})
    }
  }

  if (!practiceStore.isSessionActive) {
    return (
      <Screen preset="scroll" safeAreaEdges={["top"]} style={$container}>
        <Text text="Find the Character Activity" style={$title} />
        <Button
          text="Start Activity"
          onPress={() => practiceStore.startNewGame()}
          style={$startButton}
          textStyle={$whiteText}
        />
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} style={$container}>
      <View style={$header}>
        <Text text={`Round: ${practiceStore.currentRound}/10`} style={$score} />
        <Text text={`Accuracy: ${practiceStore.accuracy()}%`} style={$score} />
        <Button
          text="End Session"
          onPress={handleEndSession}
          style={[$button, $endButton]}
          textStyle={$whiteText}
        />
      </View>

      <View style={$progressContainer}>
        <View style={$progressBar}>
          <View 
            style={[
              $progressFill, 
              { width: `${(practiceStore.currentRound / 10) * 100}%` }
            ]} 
          />
        </View>
        <Text 
          text={`Progress: ${practiceStore.currentRound}/10`} 
          style={$progressText}
        />
      </View>

      <View style={$targetContainer}>
        <Text text="Find all:" style={$instruction} />
        <Text text={practiceStore.currentCharacter} style={$targetChar} />
      </View>

      <View style={$characterGrid}>
        {practiceStore.getCurrentRoundCharacters().map((char, index) => {
          const key = `${practiceStore.currentRound}-${index}`
          const isSelected = selectedChars[key]
          const isCorrect = results[key]
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                $characterButton,
                isSelected && (isCorrect ? $correctButton : $incorrectButton)
              ]}
              onPress={() => handleCharacterPress(char, index)}
              disabled={isSelected}
            >
              <Text 
                text={char} 
                style={[
                  $characterText,
                  isSelected && $selectedCharacterText
                ]} 
              />
            </TouchableOpacity>
          )
        })}
      </View>

      <Button
        text="Next Round"
        onPress={handleNextRound}
        style={[$startButton]}
        textStyle={$whiteText}
        disabled={Object.keys(selectedChars).length === 0}
      />
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.medium,
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.large,
}

const $score: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
}

const $targetContainer: ViewStyle = {
  alignItems: "center",
  minWidth: 300,
  alignSelf: 'center',
  marginBottom: spacing.huge,
  marginTop: spacing.large,
  backgroundColor: 'yellow',
  padding: spacing.large,
  borderRadius: 10,
  borderColor: 'black',
  borderWidth: 4,
}

const $instruction: TextStyle = {
  fontSize: 20,
  lineHeight: 40
}

const $targetChar: TextStyle = {
  fontSize: 48,
  fontWeight: "bold",
  marginTop: spacing.medium,
  lineHeight: 50
}

const $characterGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: spacing.medium,
  backgroundColor: 'blue',
  padding: spacing.large,
  borderRadius: 10,
  borderColor: 'black',
  borderWidth: 4,
  marginBottom: spacing.large,
}

const $characterButton: ViewStyle = {
  width: 60,
  height: 60,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
}

const $characterText: TextStyle = {
  fontSize: 32,
  fontWeight: "bold",
  lineHeight: 50
}

const $button: ViewStyle = {
  minWidth: 100,
}

const $endButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
  padding: spacing.medium,
  borderRadius: 10,
}

const $title: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: spacing.huge,
}

const $startButton: ViewStyle = {
  backgroundColor: 'green',
  borderRadius: 10,
  padding: 10,
  minHeight: 80,
  shadowColor: 'black',
  shadowOffset: { width: 5, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 5,
  elevation: 5,
}

const $correctButton: ViewStyle = {
  backgroundColor: 'green',
}

const $incorrectButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
}

const $selectedCharacterText: TextStyle = {
  color: colors.palette.neutral100,
}

const $nextButton: ViewStyle = {
  marginTop: spacing.large,
  backgroundColor: colors.palette.secondary500,
}

const $progressContainer: ViewStyle = {
  marginBottom: spacing.extraLarge,
  alignItems: "center",
}

const $progressBar: ViewStyle = {
  width: "100%",
  height: 10,
  backgroundColor: colors.palette.neutral300,
  borderRadius: 5,
  overflow: "hidden",
  marginBottom: spacing.extraSmall,
}

const $progressFill: ViewStyle = {
  height: "100%",
  backgroundColor: colors.palette.primary500,
  borderRadius: 5,
}

const $progressText: TextStyle = {
  fontSize: 14,
  color: colors.textDim,
}

const $whiteText: TextStyle = {
  color: colors.palette.neutral100,
  fontSize: 25,
  lineHeight: 30,
  fontWeight: "bold",
}
