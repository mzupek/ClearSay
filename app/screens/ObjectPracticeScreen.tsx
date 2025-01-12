import React, { useState, useEffect } from "react"
import { View, ViewStyle, Image, Alert, Platform, TextStyle, Dimensions } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import * as Speech from 'expo-speech'
import { useNavigation } from "@react-navigation/native"

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

export const ObjectPracticeScreen = observer(function ObjectPracticeScreen() {
  const navigation = useNavigation()
  const { objectStore } = useStores()
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    checkObjects()
  }, [])

  const checkObjects = () => {
    if (objectStore.objects.length === 0) {
      Alert.alert(
        "No Objects Available",
        "Please add some objects in the settings before practicing.",
        [
          {
            text: "Go to Settings",
            onPress: () => {
              // Navigate to settings screen
              // Note: You'll need to add navigation prop or use navigation hook
              navigation.navigate("ObjectSettings")
            }
          }
        ]
      )
    } else if (!objectStore.isSessionActive) {
      startSession()
    }
  }

  const startSession = () => {
    if (objectStore.objects.length === 0) {
      return // Don't start if no objects
    }
    objectStore.startSession()
  }

  const handleSpeak = async () => {
    if (!objectStore.currentObject) return

    setIsPlaying(true)
    try {
      const options = {
        language: 'en',
        pitch: 1,
        rate: 0.75,
      }
      
      await Speech.speak(objectStore.currentObject.name, options)
      setIsPlaying(false)
    } catch (error) {
      console.error('Speech error:', error)
      setIsPlaying(false)
    }
  }

  const handleSpellOut = async () => {
    if (!objectStore.currentObject) return

    setIsPlaying(true)
    try {
      const word = objectStore.currentObject.name
      // First, spell out each letter
      for (let letter of word) {
        await Speech.speak(letter, {
          language: 'en',
          pitch: 1,
          rate: 0.75,
        })
        // Add a small pause between letters
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // Small pause before saying the full word
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Then say the full word
      await Speech.speak(word, {
        language: 'en',
        pitch: 1,
        rate: 0.75,
      })
      
      setIsPlaying(false)
    } catch (error) {
      console.error('Speech error:', error)
      setIsPlaying(false)
    }
  }

  const handleNext = () => {
    objectStore.nextObject()
  }

  const handleMarkAttempt = (correct: boolean) => {
    if (!objectStore.currentObject) return
    objectStore.markAttempt(objectStore.currentObject.id, correct)
    handleNext()
  }

  const handleEndSession = () => {
    Alert.alert(
      "End Session",
      "Are you sure you want to end this practice session? This will reset your score.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "End Session", 
          style: "destructive",
          onPress: () => {
            objectStore.endSession()
            navigation.goBack()
          }
        }
      ]
    )
  }

  // Render empty state
  if (objectStore.objects.length === 0) {
    return (
      <Screen preset="scroll" safeAreaEdges={["top"]} style={$container}>
        <View style={$emptyContainer}>
          <Text text="No Objects Available" style={$emptyTitle} />
          <Text 
            text="Add some objects in the settings to start practicing" 
            style={$emptyMessage} 
          />
          <Button
            text="Go to Settings"
            onPress={() => navigation.navigate("ObjectSettings")}
            style={$button}
          />
        </View>
      </Screen>
    )
  }

  // Render loading state
  if (!objectStore.currentObject) {
    return (
      <Screen preset="scroll" safeAreaEdges={["top"]} style={$container}>
        <View style={$emptyContainer}>
          <Text text="Loading..." style={$emptyTitle} />
          <Button
            text="Start Practice"
            onPress={startSession}
            style={$button}
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} style={$container}>
      <View style={$scoreContainer}>
        <Text text={`Score: ${objectStore.currentScore}`} style={$score} />
        <Text text={`Accuracy: ${objectStore.accuracy}%`} style={$score} />
        <Button
          text="End Session"
          onPress={handleEndSession}
          style={[$button, $endButton]}
          preset="default"
          textStyle={$ButtonText}
        />
      </View>

      <View style={$imageContainer}>
        <View style={$flashcard}>
          <Image
            source={{ uri: objectStore.currentObject.uri }}
            style={$image}
            resizeMode="contain"
          />
          <Text 
            text={objectStore.currentObject.name} 
            style={$flashcardText}
          />
        </View>
      </View>

      <View style={$buttonContainer}>
        <Button
          text={isPlaying ? "Playing..." : "Hear Word"}
          onPress={handleSpeak}
          style={$button}
          disabled={isPlaying}
        />

        <Button
          text={isPlaying ? "Spelling..." : "Spell Word"}
          onPress={handleSpellOut}
          style={$button}
          disabled={isPlaying}
        />

        <View style={$resultButtons}>
          <Button
            text="❌ Incorrect"
            onPress={() => handleMarkAttempt(false)}
            style={[$resultButton, $incorrectButton]}
            textStyle={$ButtonText}
          />
          <Button
            text="✓ Correct"
            onPress={() => handleMarkAttempt(true)}
            style={[$resultButton, $correctButton]}
            textStyle={$ButtonText}
          />
        </View>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.md,
  backgroundColor: colors.background,
}

const $title: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.lg,
}

const $scoreContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  marginBottom: spacing.lg,
}

const $score: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
}

const $imageContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  height: screenHeight * 0.5,
}

const $image: any = {
  width: Platform.isMacOS ? screenWidth * 0.4 : screenWidth * 0.8,
  height: Platform.isMacOS ? screenHeight * 0.4 : screenHeight * 0.4,
  borderRadius: 8,
}

const $buttonContainer: ViewStyle = {
  gap: spacing.md,
}

const $button: ViewStyle = {
  marginVertical: spacing.sm,
}

const $resultButtons: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: spacing.md,
}

const $resultButton: ViewStyle = {
  flex: 1,
}

const $correctButton: ViewStyle = {
  backgroundColor: 'green',
}

const $incorrectButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
}

const $emptyContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
}

const $emptyTitle: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: spacing.md,
  textAlign: "center",
}

const $emptyMessage: TextStyle = {
  fontSize: 16,
  textAlign: "center",
  marginBottom: spacing.lg,
  color: colors.textDim,
}

const $ButtonText: TextStyle = {
  fontSize: 20,
  textAlign: "center",
  color: '#fff',
}

const $endButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
  minWidth: 100,
}

const $flashcard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.md,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
  alignItems: "center",
}

const $flashcardText: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  marginTop: spacing.md,
  textAlign: "center",
  color: colors.text,
} 