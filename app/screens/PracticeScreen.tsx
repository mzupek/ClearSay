import React from "react"
import { View, ViewStyle, TouchableOpacity, Alert, TextStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Screen, Text, Button } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"
import { useNavigation } from "@react-navigation/native"
import { useState } from "react"

export const PracticeScreen = observer(function PracticeScreen() {
  const { practiceStore } = useStores()
  const navigation = useNavigation()
  const [selectedChars, setSelectedChars] = useState<{ [key: string]: boolean }>({})
  const [results, setResults] = useState<{ [key: string]: boolean }>({})

  const handleCharacterPress = (char: string, index: number) => {
    const key = `${practiceStore.currentRound}-${index}`
    const isTarget = char === practiceStore.currentCharacter
    
    // Mark as selected and show result
    setSelectedChars(prev => ({ ...prev, [key]: true }))
    setResults(prev => ({ ...prev, [key]: isTarget }))
  }

  const handleNextRound = () => {
    const currentChars = practiceStore.getCurrentRoundCharacters()
    const foundCount = currentChars.filter((char, index) => {
      const key = `${practiceStore.currentRound}-${index}`
      return selectedChars[key] && results[key]
    }).length
    
    practiceStore.markCharacterFound(foundCount)
    practiceStore.nextRound()
    
    // Reset selections for next round
    setSelectedChars({})
    setResults({})
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

  if (!practiceStore.isSessionActive) {
    return (
      <Screen preset="scroll" safeAreaEdges={["top"]} style={$container}>
        <Text text="Find the Character Game" style={$title} />
        <Button
          text="Start Game"
          onPress={() => practiceStore.startNewGame()}
          style={[$startButton]}
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
        style={[$button, $nextButton]}
        disabled={Object.keys(selectedChars).length === 0}
        textStyle={$whiteText}
      />
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.md,
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.lg,
}

const $score: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
}

const $targetContainer: ViewStyle = {
  alignItems: "center",
  flex: 1,
  height: 400,
  justifyContent: "center",

}

const $instruction: TextStyle = {
  fontSize: 20,
}

const $targetChar: TextStyle = {
  fontSize: 48,
  fontWeight: "bold",
  marginTop: spacing.md,
  height: 100,
  width: 100,
  backgroundColor: colors.palette.accent500,
  textAlign: "center",
  textAlignVertical: "center",
  justifyContent: "center",
  alignItems: "center",
  paddingTop: 50,
  color: 'white',
}

const $characterGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: spacing.md,
  height: 100,
  width: '100%',
  backgroundColor: 'blue',
  paddingTop: 20,
}

const $characterButton: ViewStyle = {
  width: 60,
  height: 60,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  paddingBottom: 5,
}

const $characterText: TextStyle = {
  fontSize: 32,
  fontWeight: "bold",
  paddingTop: 20,
}

const $button: ViewStyle = {
  minWidth: 100,
}

const $startButton: ViewStyle = {
  minWidth: 300,
  backgroundColor: 'green',
}

const $endButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
}

const $title: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: spacing.xxl,
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
  marginTop: spacing.lg,
  backgroundColor: colors.palette.accent500,
} 

const $whiteText: TextStyle = {
  fontSize: 20,
  color: 'white',
}