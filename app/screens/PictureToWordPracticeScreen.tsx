import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, Image, ImageStyle, TextStyle } from "react-native"
import { Button, Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { useStores } from "app/models"
import * as Speech from 'expo-speech'
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AppStackParamList } from "app/navigators/AppNavigator"
import { Instance } from "mobx-state-tree"
import { ObjectSetModel } from "app/models/ObjectSetModel"

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

export const PictureToWordPracticeScreen = observer(function PictureToWordPracticeScreen() {
  const store = useStores()
  const navigation = useNavigation<NavigationProp>()

  useEffect(() => {
    if (store.objectSets.length === 0) {
      return // Don't start practice if no sets are assigned
    }
    const success = store.pictureToWordPractice.startSession()
    if (!success) {
      // Show error message instead of navigating away
      store.pictureToWordPractice.setError("Not enough objects available for practice")
    }
    return () => {
      store.pictureToWordPractice.endSession()
    }
  }, [])

  const handleWordChoice = async (word: string, isCorrect: boolean) => {
    store.pictureToWordPractice.recordAnswer(isCorrect)

    // Announce correctness if enabled
    if (store.pictureToWordPractice.settings.announceCorrectness) {
      await Speech.speak(isCorrect ? "Correct!" : "Try again", {
        voice: store.settingsStore.selectedVoiceId,
      })
    }

    if (isCorrect) {
      // Generate next question after a short delay
      setTimeout(() => {
        const success = store.pictureToWordPractice.generateNewQuestion()
        if (!success) {
          // Show completion message instead of navigating away
          store.pictureToWordPractice.setError("Practice session complete!")
        }
      }, 1000)
    }
  }

  const announceChoices = async () => {
    if (!store.pictureToWordPractice.settings.announceChoices) return
    
    for (const choice of store.pictureToWordPractice.wordChoices) {
      await Speech.speak(choice.word, {
        voice: store.settingsStore.selectedVoiceId,
      })
    }
  }

  if (store.objectSets.length === 0) {
    return (
      <Screen style={$container}>
        <View style={$errorContainer}>
          <Text text="No object sets assigned for practice" preset="subheading" style={$errorText} />
          <Text text="Please go to Settings to assign object sets" style={$errorSubtext} />
        </View>
      </Screen>
    )
  }

  if (!store.pictureToWordPractice.currentObject || store.pictureToWordPractice.error) {
    return (
      <Screen style={$container}>
        <View style={$errorContainer}>
          <Text text={store.pictureToWordPractice.error || "Not enough objects available"} preset="subheading" style={$errorText} />
          <Text text="Please add more objects to your sets in Settings" style={$errorSubtext} />
          <Button
            text="Start New Session"
            preset="default"
            style={$button}
            onPress={() => {
              store.pictureToWordPractice.setError(null)
              store.pictureToWordPractice.startSession()
            }}
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$container}
      safeAreaEdges={["top", "bottom"]}
    >
      <View style={$header}>
        <Text text={`Score: ${store.pictureToWordPractice.correctAnswers}/${store.pictureToWordPractice.totalAttempts}`} preset="heading" />
      </View>

      <View style={$imageContainer}>
        <Image
          source={
            store.pictureToWordPractice.currentObject.isDefault
              ? store.pictureToWordPractice.currentObject.uri
              : { uri: store.pictureToWordPractice.currentObject.uri }
          }
          style={$image}
          resizeMode="contain"
        />
      </View>

      <View style={$choicesContainer}>
        {store.pictureToWordPractice.wordChoices.map((choice, index) => (
          <Button
            key={index}
            text={choice.word}
            preset="default"
            style={$choiceButton}
            onPress={() => handleWordChoice(choice.word, choice.isCorrect)}
          />
        ))}
      </View>

      {store.pictureToWordPractice.settings.announceChoices && (
        <Button
          text="Announce Choices"
          preset="default"
          style={$announceButton}
          onPress={announceChoices}
        />
      )}
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.medium,
  backgroundColor: colors.background,
}

const $header: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.medium,
}

const $errorContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.large,
}

const $errorText: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.small,
}

const $errorSubtext: TextStyle = {
  textAlign: "center",
  color: colors.textDim,
  marginBottom: spacing.large,
}

const $button: ViewStyle = {
  minWidth: 200,
}

const $imageContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.medium,
  marginBottom: spacing.medium,
}

const $image: ImageStyle = {
  width: "100%",
  height: "100%",
}

const $choicesContainer: ViewStyle = {
  gap: spacing.small,
  marginBottom: spacing.medium,
}

const $choiceButton: ViewStyle = {
  minHeight: 50,
}

const $announceButton: ViewStyle = {
  backgroundColor: colors.palette.accent500,
} 