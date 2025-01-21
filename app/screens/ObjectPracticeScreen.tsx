import React, { useState } from "react"
import { View, ViewStyle, Image, ImageStyle, Alert, TextStyle } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { speak } from "app/utils/speech"

type NavigationProps = NativeStackNavigationProp<any>

export const ObjectPracticeScreen = observer(function ObjectPracticeScreen() {
  const { objectStore } = useStores()
  const navigation = useNavigation<NavigationProps>()
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [currentObject, setCurrentObject] = useState<any>(null)
  const [showingAnswer, setShowingAnswer] = useState(false)

  const hasObjects = objectStore.objects.length > 0

  const handleStartPractice = () => {
    if (hasObjects) {
      const session = objectStore.startSession()
      setCurrentObject(session.objects[session.currentIndex])
      setIsSessionActive(true)
      setShowingAnswer(false)
    }
  }

  const handleSpeak = async () => {
    if (currentObject) {
      await speak(currentObject.name)
    }
  }

  const handleSpellWord = async () => {
    if (currentObject) {
      try {
        const word = currentObject.name.toLowerCase()
        const spellOut = word.split('').join('... ')
        await speak(spellOut, { rate: 0.5 })
      } catch (error) {
        console.error('Error spelling word:', error)
      }
    }
  }

  const handleShowAnswer = () => {
    setShowingAnswer(true)
  }

  const handleAnswerResponse = (correct: boolean) => {
    if (!currentObject) return

    // Update score
    if (correct) {
      currentObject.correctAttempts++
    }
    currentObject.attempts++

    // Move to next object or end session
    const nextIndex = objectStore.objects.indexOf(currentObject) + 1
    if (nextIndex < objectStore.objects.length) {
      setCurrentObject(objectStore.objects[nextIndex])
      setShowingAnswer(false)
    } else {
      Alert.alert(
        "Practice Complete",
        "You've completed all objects!",
        [
          {
            text: "OK",
            onPress: () => {
              setIsSessionActive(false)
              setCurrentObject(null)
              setShowingAnswer(false)
            }
          }
        ]
      )
    }
  }

  const handleExitSession = () => {
    if (isSessionActive) {
      Alert.alert(
        "Exit Session",
        "Are you sure you want to end this practice session?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Exit", 
            style: "destructive",
            onPress: () => {
              setIsSessionActive(false)
              setCurrentObject(null)
              setShowingAnswer(false)
            }
          }
        ]
      )
    } else {
      navigation.navigate("Welcome")
    }
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <View style={$container}>
        <View style={$header}>
          <Text preset="heading" text="Object Practice" style={$title} />
          <Button
            text="Exit"
            onPress={handleExitSession}
            style={[$button, $exitButton]}
          />
        </View>
        
        {!isSessionActive ? (
          hasObjects ? (
            <View style={$buttonContainer}>
              <Button
                text="Start Practice"
                onPress={handleStartPractice}
                style={$button}
              />
              <Button
                text="Object Settings"
                onPress={() => navigation.navigate("ObjectSettings")}
                style={$button}
              />
            </View>
          ) : (
            <View style={$messageContainer}>
              <Text 
                text="No objects available. Add some objects in settings first."
                style={$message}
              />
              <Button
                text="Go to Settings"
                onPress={() => navigation.navigate("ObjectSettings")}
                style={[$settingsButton, $button]}
                textStyle={$blackText}
              />
            </View>
          )
        ) : (
          <View style={$practiceContainer}>
            {currentObject && (
              <>
                <View style={$flashCard}>
                  <Image source={{ uri: currentObject.uri }} style={$image} />
                  <Text text={currentObject.name} style={$wordText} />
                </View>
                <View style={$actionButtons}>
                  <Button
                    text="Say Word"
                    onPress={handleSpeak}
                    style={$button}
                  />
                  <Button
                    text="Spell Word"
                    onPress={handleSpellWord}
                    style={$button}
                  />
                  <View style={$responseButtons}>
                    <Button
                      text="Got it Wrong"
                      onPress={() => handleAnswerResponse(false)}
                      style={[$button, $wrongButton]}
                    />
                    <Button
                      text="Got it Right"
                      onPress={() => handleAnswerResponse(true)}
                      style={[$button, $rightButton]}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      </View>
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

const $title: ViewStyle = {
  marginBottom: spacing.large,
  textAlign: "center",
}

const $buttonContainer: ViewStyle = {
  gap: spacing.medium,
}

const $messageContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  gap: spacing.medium,
}

const $message: ViewStyle = {
  textAlign: "center",
}

const $button: ViewStyle = {
  minWidth: 200,
  alignSelf: "center",
}

const $practiceContainer: ViewStyle = {
  flex: 1,
  alignItems: "center",
  gap: spacing.large,
}

const $flashCard: ViewStyle = {
  backgroundColor: 'white',
  borderRadius: 16,
  padding: spacing.medium,
  shadowColor: 'black',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  alignItems: 'center',
  gap: spacing.medium,
}

const $actionButtons: ViewStyle = {
  gap: spacing.medium,
  alignItems: 'center',
}

const $image: ImageStyle = {
  width: 250,
  height: 250,
  borderRadius: 8,
}

const $wordText: TextStyle = {
  fontSize: 32,
  fontWeight: "bold",
  textAlign: 'center',
  lineHeight: 30
}

const $responseButtons: ViewStyle = {
  flexDirection: "row",
  gap: spacing.medium,
}

const $wrongButton: ViewStyle = {
  backgroundColor: colors.error,
}

const $rightButton: ViewStyle = {
  backgroundColor: colors.success,
}

const $settingsButton: ViewStyle = {
  backgroundColor: 'yellow',
  minWidth: 100,
}

const $exitButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
  padding: spacing.medium,
  borderRadius: 10,
}

const $whiteText: TextStyle = {
  color: 'white',
  fontSize: 24,
  fontWeight: "bold",
  lineHeight: 30
}

const $blackText: TextStyle = {
  color: 'black',
  fontSize: 24,
  fontWeight: "bold",
  lineHeight: 30
}