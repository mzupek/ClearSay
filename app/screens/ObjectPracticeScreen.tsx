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
  const { objectStore, objectSetStore } = useStores()
  const navigation = useNavigation<NavigationProps>()
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [currentObject, setCurrentObject] = useState<any>(null)
  const [showingAnswer, setShowingAnswer] = useState(false)
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 })
  const [currentSetId, setCurrentSetId] = useState<string | null>(null)

  const getActiveObjects = () => {
    const activeSets = objectSetStore.activeSets
    const activeObjectIds = new Set(activeSets.flatMap(set => set.objectIds))
    return objectStore.objects.filter(obj => activeObjectIds.has(obj.id))
  }

  const handleManageSets = () => {
    const sets = objectSetStore.setList
    Alert.alert(
      "Manage Practice Sets",
      "Which sets would you like to practice with?\n\nCurrently active sets:\n" + 
      objectSetStore.activeSets.map(set => `• ${set.name}`).join('\n'),
      [
        { text: "Close", style: "cancel" },
        {
          text: "Select Sets",
          onPress: () => {
            // Show multi-select dialog for sets
            Alert.alert(
              "Select Sets",
              "Tap sets to toggle them on/off:",
              sets.map(set => ({
                text: `${set.name} (${set.isActive ? "✓" : "×"})`,
                onPress: () => {
                  objectSetStore.toggleSetActive(set.id)
                  // Refresh the selection dialog
                  handleManageSets()
                }
              })),
              { cancelable: true }
            )
          }
        }
      ]
    )
  }

  const startPractice = () => {
    const activeSets = objectSetStore.activeSets
    if (activeSets.length === 0) {
      Alert.alert(
        "No Active Sets",
        "Please select at least one object set to practice."
      )
      return
    }

    if (activeSets.length === 1) {
      const activeSet = activeSets[0]
      setCurrentSetId(activeSet.id)
      const setObjects = activeSet.objectIds
        .map(id => objectStore.objects.find(obj => obj.id === id))
        .filter(Boolean)
      
      if (setObjects.length === 0) {
        Alert.alert(
          "Empty Set",
          "The selected set has no objects. Please add objects to the set."
        )
        return
      }

      const shuffledObjects = [...setObjects].sort(() => Math.random() - 0.5)
      setSessionScore({ correct: 0, total: 0 })
      setCurrentObject(shuffledObjects[0])
      setIsSessionActive(true)
      setShowingAnswer(false)
    } else {
      Alert.alert(
        "Select Set",
        "Which set would you like to practice?",
        activeSets.map(set => ({
          text: set.name,
          onPress: () => {
            setCurrentSetId(set.id)
            const setObjects = set.objectIds
              .map(id => objectStore.objects.find(obj => obj.id === id))
              .filter(Boolean)
            
            if (setObjects.length === 0) {
              Alert.alert(
                "Empty Set",
                "The selected set has no objects. Please add objects to the set."
              )
              return
            }

            const shuffledObjects = [...setObjects].sort(() => Math.random() - 0.5)
            setSessionScore({ correct: 0, total: 0 })
            setCurrentObject(shuffledObjects[0])
            setIsSessionActive(true)
            setShowingAnswer(false)
          }
        }))
      )
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
    if (!currentObject || !currentSetId) return

    const currentSet = objectSetStore.getSetById(currentSetId)
    if (!currentSet) return

    objectStore.updateObjectScore(
      currentObject.id,
      correct,
      currentSet.id,
      currentSet.name
    )

    setSessionScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }))

    const nextIndex = objectStore.objects.indexOf(currentObject) + 1
    if (nextIndex < objectStore.objects.length) {
      setCurrentObject(objectStore.objects[nextIndex])
      setShowingAnswer(false)
    } else {
      Alert.alert(
        "Practice Complete",
        `Session complete!\nTotal correct: ${sessionScore.correct + (correct ? 1 : 0)}\nTotal attempts: ${sessionScore.total + 1}`,
        [
          {
            text: "OK",
            onPress: () => {
              setIsSessionActive(false)
              setCurrentObject(null)
              setShowingAnswer(false)
              setSessionScore({ correct: 0, total: 0 })
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
    <Screen preset="scroll">
      <View style={$container}>
        <View style={$header}>
          <Text preset="heading" text="Object Practice" style={$title} />
          <Button
            text="⬅️ Exit"
            onPress={handleExitSession}
            style={[$button, $exitButton]}
            textStyle={$whiteText}
          />
        </View>
        
        {!isSessionActive ? (
          <View style={$startContainer}>
            {/* <Text preset="heading" text="Practice Objects" style={$title} /> */}
            <View style={$buttonContainer}>
              <Button
                text="Start Practice ➡️"
                onPress={startPractice}
                style={[$button, $practiceButton]}
                textStyle={$whiteText}
              />
              <Button
                text="Select Object Sets ☑️"
                onPress={handleManageSets}
                style={[$button, $ordersetsButton]}
                textStyle={$whiteText}
              />
            </View>
          </View>
        ) : (
          <View style={$practiceContainer}>
            {currentObject && (
              <>
                <View style={$flashCard}>
                  <Image 
                    source={currentObject.isDefault ? currentObject.uri : { uri: currentObject.uri.uri }}
                    style={$image}
                    resizeMode="cover"
                  />
                  <Text text={currentObject.name} style={$wordText} />
                  <Text 
                    text={`Session Score: ${sessionScore.correct}/${sessionScore.total}`} 
                    style={$scoreText}
                  />
                </View>
                <View style={$actionButtons}>
                  <Button
                    text="Say Word 🎤"
                    onPress={handleSpeak}
                    style={[$button, $sayButton]}
                    textStyle={$whiteText}
                  />
                  <Button
                    text="Spell Word 🐝"
                    onPress={handleSpellWord}
                    style={[$button, $spellButton]}
                    textStyle={$whiteText}
                  />
                </View>
                <View style={$responseButtons}>
                  <Button
                    text="Got it Wrong ❌"
                    onPress={() => handleAnswerResponse(false)}
                    style={[$button, $wrongButton]}
                    textStyle={$whiteText}
                  />
                  <Button
                    text="Got it Right ✅"
                    onPress={() => handleAnswerResponse(true)}
                    style={[$button, $rightButton]}
                    textStyle={$whiteText}
                  />
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
  // alignItems: 'center',
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  // alignItems: "center",
  marginBottom: spacing.large,
}

const $title: ViewStyle = {
  marginBottom: spacing.large,
  marginRight: spacing.large,
}

const $buttonContainer: ViewStyle = {
  gap: spacing.medium,
  marginTop: spacing.large,
}

const $startContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  gap: spacing.medium,
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
  gap: spacing.small,
  alignItems: 'center',
  flexDirection: 'row',
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
  gap: spacing.small,
  alignItems: 'center',
}

const $wrongButton: ViewStyle = {
  backgroundColor: 'darkred',
}

const $rightButton: ViewStyle = {
  backgroundColor: 'darkgreen',
}

const $selectSetsButton: ViewStyle = {
  backgroundColor: colors.palette.neutral700,
}

const $exitButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
  padding: spacing.medium,
  borderRadius: 10,
}

const $scoreText: TextStyle = {
  fontSize: 16,
  color: colors.text,
  marginTop: spacing.small,
}

const $button: ViewStyle = {
  padding: 10,
  // minWidth: 200,
}

const $sayButton: ViewStyle = {
  backgroundColor: colors.palette.accent500,
}

const $spellButton: ViewStyle = {
  backgroundColor: 'blue',
}

const $whiteText: TextStyle = {
  color: 'white', 
  fontWeight: 'bold',
  fontSize: 22,
  lineHeight: 24,
}

const $practiceButton: ViewStyle = {
  backgroundColor: 'green',
  borderRadius: 10,
  padding: 10,
  minHeight: 80,
  shadowColor: 'black',
  shadowOffset: { width: 5, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 5,
  elevation: 5,
  minWidth: '85%',
}

const $ordersetsButton: ViewStyle = {
  backgroundColor: colors.palette.accent500,
  borderRadius: 10,
  padding: 10,
  minHeight: 80,
  shadowColor: 'black',
  shadowOffset: { width: 5, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 5,
  elevation: 5,
  minWidth: '85%',
}

const $checkIcon: ImageStyle = {
  width: 24,
  height: 24,
  marginLeft: spacing.small,
  tintColor: 'white',
  
}
