import React, { useEffect } from "react"
import { View, Text, StyleSheet, Image } from "react-native"
import { observer } from "mobx-react-lite"
import { useStores } from "../models"
import { Button, Screen } from "../components"
import { colors, spacing } from "../theme"
import * as Speech from "expo-speech"

export const PictureToWordPracticeScreen = observer(function PictureToWordPracticeScreen() {
  const { pictureToWordPractice: store, settingsStore } = useStores()

  // Initialize screen when mounted
  useEffect(() => {
    // Reset any error state
    store.setError(null)
    // End any active session
    if (store.isActive) {
      store.endSession()
    }
    console.log("[Mount] Screen mounted, state reset")
  }, [])

  console.log("[Debug] Component Render State:", {
    isActive: store.isActive,
    assignedSetsLength: store.assignedSets.length,
    hasError: !!store.error,
    error: store.error,
    currentObjectsLength: store.currentObjects.length,
    wordChoicesLength: store.wordChoices.length,
    availableObjectsLength: store.availableObjects.length,
  })

  const handleStartSession = () => {
    console.log("Starting session...")
    if (store.assignedSets.length === 0) {
      console.log("No sets assigned")
      store.setError("Please assign an object set to practice with")
      return
    }

    const totalObjects = store.availableObjects.length
    console.log("Total objects:", totalObjects)
    if (totalObjects < 3) {
      console.log("Not enough objects")
      store.setError("Not enough objects to practice with. Please add more objects to your set.")
      return
    }

    console.log("Starting practice session")
    store.startSession()
  }

  const handleWordChoice = async (word: string, isCorrect: boolean) => {
    console.log("Word choice:", { word, isCorrect })
    store.recordAnswer(isCorrect)

    // Announce correctness if enabled
    if (store.settings.announceCorrectness) {
      await Speech.speak(isCorrect ? "Correct!" : "Try again", {
        voice: settingsStore.selectedVoiceId,
      })
    }

    // Generate next question after a short delay
    setTimeout(() => {
      const success = store.generateNewQuestion()
      if (!success) {
        store.setError("Practice session complete!")
      }
    }, 1000)
  }

  const announceChoices = async () => {
    if (!store.settings.announceChoices) return
    
    for (const choice of store.wordChoices) {
      await Speech.speak(choice.word, {
        voice: settingsStore.selectedVoiceId,
      })
    }
  }

  // Show error state
  console.log("[Debug] Checking error state:", { error: store.error })
  if (store.error) {
    console.log("[Render] Showing error screen")
    return (
      <Screen style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{store.error}</Text>
          <Text style={styles.errorSubtext}>Please add more objects to your sets in Settings</Text>
          <Button
            text="Start New Session"
            preset="default"
            style={styles.button}
            onPress={() => {
              store.setError(null)
              handleStartSession()
            }}
          />
        </View>
      </Screen>
    )
  }

  // Show instructions if no sets are assigned
  if (!store.assignedSets || store.assignedSets.length === 0) {
    console.log("Debug - Rendering no sets screen:", {
      assignedSets: store.assignedSets,
      length: store.assignedSets?.length,
    })
    return (
      <Screen style={styles.container} contentContainerStyle={styles.centerContent}>
        <View style={styles.noSetsContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.emoji}>📚</Text>
          </View>
          <Text 
            style={[styles.errorText, { marginBottom: spacing.medium }]}
          >No Object Sets Selected</Text>
          <Text 
            style={[styles.instructionText, { marginBottom: spacing.small }]}
          >To get started:</Text>
          <View style={styles.instructionList}>
            <Text style={styles.instructionItem}>1. Tap the Settings tab below</Text>
            <Text style={styles.instructionItem}>2. Select one or more object sets</Text>
            <Text style={styles.instructionItem}>3. Return here to practice</Text>
          </View>
        </View>
      </Screen>
    )
  }

  // Then check if no session is active
  console.log("[Debug] Checking active state:", { 
    isActive: store.isActive,
    availableObjects: store.availableObjects.length 
  })
  if (!store.isActive) {
    console.log("[Render] Showing start session screen")
    return (
      <Screen style={styles.container}>
        <View style={styles.startContainer}>
          <Text style={styles.title}>Picture to Word Practice</Text>
          <Text style={styles.subtitle}>
            {`${store.assignedSets.length} set(s) assigned with ${
              store.availableObjects.length
            } objects`}
          </Text>
          <Button
            text="Start Practice"
            preset="default"
            style={styles.button}
            onPress={handleStartSession}
          />
        </View>
      </Screen>
    )
  }

  // Show practice session
  if (store.currentObjects.length === 0) {
    console.log("No current objects")
    return null
  }

  const currentObject = store.currentObjects[0]
  console.log("Showing practice session")
  return (
    <Screen
      preset="fixed"
      contentContainerStyle={styles.container}
      safeAreaEdges={["top", "bottom"]}
    >
      <View style={styles.header}>
        <Text style={styles.score}>{`Score: ${store.correctAnswers}/${store.totalAttempts}`}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={
            currentObject.isDefault
              ? currentObject.uri
              : { uri: currentObject.uri }
          }
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.choicesContainer}>
        {store.wordChoices.map((choice, index) => (
          <Button
            key={index}
            text={choice.word}
            preset="default"
            style={styles.choiceButton}
            onPress={() => handleWordChoice(choice.word, choice.isCorrect)}
          />
        ))}
      </View>

      {store.settings.announceChoices && (
        <Button
          text="Announce Choices"
          preset="default"
          style={styles.announceButton}
          onPress={announceChoices}
        />
      )}
    </Screen>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.medium,
    backgroundColor: colors.background,
  },
  startContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.large,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: spacing.large,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: spacing.medium,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.medium,
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.large,
  },
  errorText: {
    textAlign: "center",
    marginBottom: spacing.small,
    color: colors.error,
  },
  errorSubtext: {
    textAlign: "center",
    color: colors.textDim,
    marginBottom: spacing.large,
  },
  button: {
    minWidth: 200,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  choicesContainer: {
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  choiceButton: {
    minHeight: 50,
  },
  announceButton: {
    backgroundColor: colors.palette.accent500,
  },
  instructionsContainer: {
    width: "100%",
    backgroundColor: colors.palette.neutral100,
    borderRadius: spacing.medium,
    padding: spacing.large,
    marginTop: spacing.medium,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.medium,
    textAlign: "center",
  },
  instructionsText: {
    fontSize: 16,
    color: colors.textDim,
    marginBottom: spacing.large,
    textAlign: "center",
  },
  stepContainer: {
    backgroundColor: colors.background,
    borderRadius: spacing.small,
    padding: spacing.large,
    width: "100%",
  },
  stepText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.small,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
  },
  noSetsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.large,
    backgroundColor: colors.palette.neutral100,
    margin: spacing.large,
    borderRadius: spacing.medium,
  },
  iconContainer: {
    marginBottom: spacing.medium,
  },
  emoji: {
    fontSize: 48,
  },
  instructionList: {
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: spacing.large,
  },
  instructionItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.small,
    color: colors.textDim,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textDim,
    textAlign: "center",
  },
}) 