import React, { useState, useEffect, useCallback } from "react"
import { View, ViewStyle, Image, ImageStyle, Alert, TextStyle } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { speak } from "app/utils/speech"
import { Instance } from "mobx-state-tree"
import { ObjectModel, ObjectSetModel } from "app/models"
import { RootStoreModel } from "app/models/RootStore"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ObjectTabParamList } from "app/navigators/ObjectNavigator"

type NavigationProps = NativeStackNavigationProp<ObjectTabParamList>
export type ObjectType = Instance<typeof ObjectModel>
export type ObjectSetType = Instance<typeof ObjectSetModel>
type RootStoreType = Instance<typeof RootStoreModel>

interface ObjectPracticeScreenProps extends NativeStackScreenProps<ObjectTabParamList, "ObjectPractice"> {}

export const ObjectPracticeScreen = observer(function ObjectPracticeScreen(props: ObjectPracticeScreenProps) {
  const store = useStores() as RootStoreType
  const navigation = useNavigation<NavigationProps>()
  const [isListening, setIsListening] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShowingAnswer, setIsShowingAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [lastSpokenText, setLastSpokenText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeObjects, setActiveObjects] = useState<ObjectType[]>([])
  const [activeSets, setActiveSets] = useState<ObjectSetType[]>([])

  const currentSet = store.currentObjectSet
  const practiceSession = store.practiceSession

  useEffect(() => {
    if (!currentSet && practiceSession.isActive) {
      practiceSession.endSession()
    }
  }, [currentSet])

  useEffect(() => {
    if (!currentSet) {
      // Find and set the default set if none is selected
      const defaultSet = store.objectSets.find(set => set.isDefault)
      if (defaultSet) {
        store.setCurrentObjectSet(defaultSet)
        return
      }
    }

    const firstObject = currentSet?.objects[0]
    if (firstObject) {
      practiceSession.startSession(currentSet.id, firstObject.id)
    }

    return () => {
      practiceSession.endSession()
    }
  }, [currentSet, store.objectSets])

  useEffect(() => {
    const objects = store.objects.filter((obj: ObjectType) => 
      activeSets.some((set: ObjectSetType) => set.objects.includes(obj))
    )
    setActiveObjects(objects)
  }, [activeSets, store.objects])

  const handleNextObject = useCallback(() => {
    if (!currentSet) return

    const currentIndex = currentSet.objects.findIndex((obj: ObjectType) => obj.id === practiceSession.currentObjectId)
    const nextObject = currentSet.objects[currentIndex + 1]

    if (nextObject) {
      practiceSession.setCurrentObject(nextObject.id)
      setIsShowingAnswer(false)
      setIsCorrect(null)
      setLastSpokenText("")
    } else {
      // End of practice session
      navigation.goBack()
    }
  }, [currentSet, practiceSession])

  const handleSpeechResult = useCallback((text: string) => {
    setLastSpokenText(text)
    const currentObject = currentSet?.objects.find((obj: ObjectType) => obj.id === practiceSession.currentObjectId)
    if (!currentObject) return

    const isAnswerCorrect = text.toLowerCase().includes(currentObject.name.toLowerCase())
    setIsCorrect(isAnswerCorrect)
    practiceSession.recordAnswer(isAnswerCorrect)
    setIsShowingAnswer(true)
  }, [currentSet, practiceSession])

  const handleManageSets = useCallback(() => {
    navigation.navigate("ObjectManager")
  }, [navigation])

  const startPractice = () => {
    const activeSets = store.objectSets.filter((set: ObjectSetType) => set.isActive)
    if (activeSets.length === 0) {
      Alert.alert(
        "No Active Sets",
        "Please select at least one object set to practice."
      )
      return
    }

    if (activeSets.length === 1) {
      const activeSet = activeSets[0]
      practiceSession.startSession(activeSet.id, activeSet.objects[0].id)
    } else {
      Alert.alert(
        "Select Set",
        "Which set would you like to practice?",
        activeSets.map((set: ObjectSetType) => ({
          text: set.name,
          onPress: () => {
            practiceSession.startSession(set.id, set.objects[0].id)
          }
        }))
      )
    }
  }

  const handleSpeak = async () => {
    if (currentSet && practiceSession.currentObjectId) {
      await speak(currentSet.objects.find((obj: ObjectType) => obj.id === practiceSession.currentObjectId)?.name || "")
    }
  }

  const handleSpellWord = async () => {
    if (currentSet && practiceSession.currentObjectId) {
      try {
        const word = currentSet.objects.find((obj: ObjectType) => obj.id === practiceSession.currentObjectId)?.name.toLowerCase() || ""
        const spellOut = word.split('').join('... ')
        await speak(spellOut)
      } catch (error) {
        console.error('Error spelling word:', error)
      }
    }
  }

  const handleAnswerResponse = (correct: boolean) => {
    if (!currentSet || !practiceSession.currentObjectId) return

    practiceSession.recordAnswer(correct)
    handleNextObject()
  }

  const handleExitSession = () => {
    if (practiceSession.isActive) {
      Alert.alert(
        "Exit Session",
        "Are you sure you want to end this practice session?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Exit", 
            style: "destructive",
            onPress: () => {
              practiceSession.endSession()
              navigation.getParent()?.navigate("Welcome")
            }
          }
        ]
      )
    } else {
      navigation.getParent()?.navigate("Welcome")
    }
  }

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$screenContentContainer}
      style={$root}
      safeAreaEdges={["top"]}
    >
      {!currentSet ? (
        <View style={$startContainer}>
          <Text 
            text="No Object Set Selected" 
            style={$noSetTitle} 
          />
          <Text 
            text="Please select an object set to begin practice" 
            style={$noSetMessage} 
          />
          <View style={$buttonContainer}>
            <Button
              text="Select Object Sets ☑️"
              onPress={handleManageSets}
              style={[$button, $ordersetsButton]}
              textStyle={$whiteText}
            />
          </View>
        </View>
      ) : !practiceSession.isActive ? (
        <View style={$startContainer}>
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
          {currentSet && practiceSession.currentObjectId && (
            <>
              <View style={$flashCard}>
                <View style={$imageContainer}>
                  <Image 
                    source={currentSet.objects.find((obj: ObjectType) => obj.id === practiceSession.currentObjectId)?.isDefault ? 
                      currentSet.objects.find((obj: ObjectType) => obj.id === practiceSession.currentObjectId)?.uri : 
                      { uri: currentSet.objects.find((obj: ObjectType) => obj.id === practiceSession.currentObjectId)?.uri }}
                    style={$image}
                    resizeMode="contain"
                  />
                </View>
                <View style={$textContainer}>
                  <Text text={currentSet.objects.find((obj: ObjectType) => obj.id === practiceSession.currentObjectId)?.name} style={$wordText} />
                  <Text 
                    text={`Session Score: ${practiceSession.score.correct}/${practiceSession.score.total}`}
                    style={$scoreText}
                  />
                </View>
              </View>
              <View style={$buttonsContainer}>
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
              </View>
            </>
          )}
        </View>
      )}
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  flex: 1,
}

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.tiny,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
}

const $startContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  gap: spacing.medium,
  paddingHorizontal: spacing.medium,
}

const $practiceContainer: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.medium,
}

const $flashCard: ViewStyle = {
  backgroundColor: colors.background,
  borderRadius: 16,
  padding: spacing.medium,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  alignItems: "center",
  width: "100%",
  maxWidth: 400,
  marginBottom: spacing.large,
  marginTop: -50,
}

const $imageContainer: ViewStyle = {
  width: "100%",
  aspectRatio: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  overflow: "hidden",
  marginBottom: spacing.medium,
}

const $textContainer: ViewStyle = {
  alignItems: "center",
  width: "100%",
  paddingVertical: spacing.small,
}

const $buttonsContainer: ViewStyle = {
  width: "100%",
  gap: spacing.medium,
  paddingBottom: spacing.large,
}

const $actionButtons: ViewStyle = {
  flexDirection: "row",
  gap: spacing.medium,
  justifyContent: "center",
  width: "100%",
  marginBottom: spacing.medium,
}

const $image: ImageStyle = {
  width: "80%",
  height: "80%",
}

const $wordText: TextStyle = {
  fontSize: 48,
  fontWeight: "bold",
  textAlign: "center",
  color: colors.text,
  includeFontPadding: false,
  lineHeight: 56,
}

const $responseButtons: ViewStyle = {
  flexDirection: "row",
  gap: spacing.medium,
  justifyContent: "center",
  width: "100%",
}

const $wrongButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
  flex: 1,
  minHeight: 50,
}

const $rightButton: ViewStyle = {
  backgroundColor: colors.palette.secondary500,
  flex: 1,
  minHeight: 50,
}

const $scoreText: TextStyle = {
  fontSize: 16,
  color: colors.text,
}

const $button: ViewStyle = {
  borderRadius: 12,
  paddingVertical: spacing.medium,
  paddingHorizontal: spacing.medium,
  minHeight: 50,
}

const $sayButton: ViewStyle = {
  backgroundColor: colors.palette.accent500,
  flex: 1,
}

const $spellButton: ViewStyle = {
  backgroundColor: colors.palette.secondary500,
  flex: 1,
}

const $whiteText: TextStyle = {
  color: colors.palette.neutral100,
  fontWeight: "bold",
  fontSize: 18,
  textAlign: "center",
}

const $practiceButton: ViewStyle = {
  backgroundColor: colors.palette.secondary500,
  borderRadius: 12,
  padding: spacing.medium,
  minHeight: 50,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  width: "100%",
}

const $ordersetsButton: ViewStyle = {
  backgroundColor: colors.palette.accent500,
  borderRadius: 12,
  padding: spacing.medium,
  minHeight: 50,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  width: "100%",
}

const $noSetTitle: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: spacing.small,
  color: colors.text,
}

const $noSetMessage: TextStyle = {
  fontSize: 16,
  textAlign: "center",
  marginBottom: spacing.large,
  color: colors.textDim,
}

const $title: TextStyle = {
  fontSize: 24,
  color: colors.text,
}

const $buttonContainer: ViewStyle = {
  gap: spacing.medium,
  marginTop: spacing.large,
  width: "100%",
  paddingHorizontal: spacing.large,
}
