import React, { FC, useEffect, useState } from "react"
import { ViewStyle, View, TextStyle, Image, ImageStyle, Pressable, LayoutAnimation } from "react-native"
import { Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { Instance } from "mobx-state-tree"
import { ObjectModel } from "app/models/ObjectModel"
import { useFocusEffect } from "@react-navigation/native"

interface MatchedPair {
  wordId: string
  imageId: string
  isCorrect: boolean
  rowIndex: number
}

export const RecognitionPracticeScreen: FC = observer(function RecognitionPracticeScreen() {
  const { recognitionPractice: store } = useStores()
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [matches, setMatches] = useState<MatchedPair[]>([])
  const [reorderedObjects, setReorderedObjects] = useState<Instance<typeof ObjectModel>[]>([])
  const [reorderedWords, setReorderedWords] = useState<{
    id: string
    word: string
    isMatched: boolean
    matchedToId?: string
    wasCorrectMatch: boolean
  }[]>([])
  const [incorrectPair, setIncorrectPair] = useState<{ wordId: string; imageId: string } | null>(null)

  // Clear incorrect pair highlight after delay
  useEffect(() => {
    if (incorrectPair) {
      const timer = setTimeout(() => {
        setIncorrectPair(null)
      }, 500) // Show red highlight for 500ms
      return () => clearTimeout(timer)
    }
  }, [incorrectPair])

  const handleSelect = (id: string, type: "word" | "image") => {
    if (type === "word" && !selectedImage) {
      setSelectedWord(id)
    } else if (type === "image" && !selectedWord) {
      setSelectedImage(id)
    }

    const wordId = type === "word" ? id : selectedWord
    const imageId = type === "image" ? id : selectedImage

    if (wordId && imageId) {
      const isCorrect = store.tryMatch(wordId, imageId)
      const newMatchIndex = matches.length

      if (!isCorrect) {
        // Show temporary red highlight for incorrect match
        setIncorrectPair({ wordId, imageId })
        setSelectedWord(null)
        setSelectedImage(null)
        return
      }

      // Configure animation
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

      // Reorder the objects and words to match
      const newObjects = [...reorderedObjects]
      const newWords = [...reorderedWords]
      
      const objectIndex = newObjects.findIndex(obj => obj.id === imageId)
      const wordIndex = newWords.findIndex(w => w.id === wordId)
      
      // Swap positions to align matched pairs
      if (objectIndex !== newMatchIndex) {
        [newObjects[objectIndex], newObjects[newMatchIndex]] = [newObjects[newMatchIndex], newObjects[objectIndex]]
      }
      if (wordIndex !== newMatchIndex) {
        [newWords[wordIndex], newWords[newMatchIndex]] = [newWords[newMatchIndex], newWords[wordIndex]]
      }

      setReorderedObjects(newObjects)
      setReorderedWords(newWords)
      
      const newMatch: MatchedPair = {
        wordId,
        imageId,
        isCorrect: true,
        rowIndex: newMatchIndex
      }
      
      setMatches([...matches, newMatch])
      setSelectedWord(null)
      setSelectedImage(null)

      // If all items are matched, prepare for next round
      if (matches.length + 1 === store.currentObjects.length) {
        setTimeout(() => {
          setMatches([])
          store.generateNewRound()
        }, 1000)
      }
    }
  }

  // Effect to handle new rounds
  useEffect(() => {
    if (!store.isTransitioning && store.currentObjects.length > 0 && store.wordChoices.length > 0) {
      setMatches([])
      setReorderedObjects([...store.currentObjects])
      setReorderedWords(store.wordChoices.map(choice => ({
        id: choice.id,
        word: choice.word,
        isMatched: false,
        matchedToId: undefined,
        wasCorrectMatch: false
      })))
    }
  }, [store.isTransitioning, store.currentObjects.length, store.wordChoices.length])

  // Effect to start session when screen becomes active
  useFocusEffect(
    React.useCallback(() => {
      console.log("Debug - Screen focused, checking state:", {
        assignedSetsLength: store.assignedSets?.length,
        isActive: store.isActive,
      })
      
      if (store.assignedSets?.length > 0 && !store.isActive) {
        console.log("Debug - Starting session on focus")
        store.startSession()
      }
    }, [store])
  )

  // Effect to initialize first round
  useEffect(() => {
    console.log("Debug - Store state:", {
      assignedSetsLength: store.assignedSets?.length,
      hasAssignedSets: Boolean(store.assignedSets && store.assignedSets.length > 0),
      currentObjectsLength: store.currentObjects?.length,
      wordChoicesLength: store.wordChoices?.length,
      error: store.error,
    })

    const startPractice = () => {
      console.log("Debug - Starting practice with assigned sets:", store.assignedSets?.length)
      if (store.assignedSets.length > 0) {
        console.log("Debug - Attempting to start session")
        store.startSession()
      }
    }
    
    startPractice()
    
    return () => {
      console.log("Debug - Cleaning up session")
      store.endSession()
    }
  }, [store.assignedSets.length])

  const isMatched = (id: string) => {
    return matches.some(m => m.wordId === id || m.imageId === id)
  }

  const getMatchStatus = (id: string) => {
    const match = matches.find(m => m.wordId === id || m.imageId === id)
    return match?.isCorrect
  }

  const getRowStyle = (index: number) => {
    const match = matches.find(m => m.rowIndex === index)
    if (match) {
      return match.isCorrect ? $correctRow : null
    }
    return null
  }

  // Show instructions if no sets are assigned
  if (!store.assignedSets || store.assignedSets.length === 0) {
    console.log("Debug - Rendering no sets screen:", {
      assignedSets: store.assignedSets,
      length: store.assignedSets?.length,
    })
    return (
      <Screen style={$container} contentContainerStyle={$centerContent}>
        <View style={$noSetsContainer}>
          <View style={$iconContainer}>
            <Text text="📚" style={$emoji} />
          </View>
          <Text 
            text="No Object Sets Selected" 
            preset="subheading" 
            style={[$errorText, { marginBottom: spacing.medium }]} 
          />
          <Text 
            text="To get started:" 
            style={[$instructionText, { marginBottom: spacing.small }]} 
          />
          <View style={$instructionList}>
            <Text text="1. Tap the Settings tab below" style={$instructionItem} />
            <Text text="2. Select one or more object sets" style={$instructionItem} />
            <Text text="3. Return here to practice" style={$instructionItem} />
          </View>
        </View>
      </Screen>
    )
  }

  if (store.error) {
    return (
      <Screen style={$container}>
        <View style={$errorContainer}>
          <View style={$iconContainer}>
            <Text text="⚠️" style={$emoji} />
          </View>
          <Text text={store.error} preset="subheading" style={$errorText} />
          <Text 
            text="Please add more objects to your sets in Settings or select additional object sets" 
            style={$errorSubtext} 
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen style={$container} preset="scroll">
      <View style={$contentContainer}>
        <View style={$scoreContainer}>
          <Text text={`Score: ${store.correctAnswers}/${store.totalAttempts}`} style={$scoreText} />
        </View>

        <View style={$instructions}>
          <Text text="Tap any word or picture to start matching" style={$instructionText} />
          {selectedWord && (
            <Text 
              text="Now tap the matching picture" 
              style={[$instructionText, { color: colors.palette.neutral600 }]} 
            />
          )}
          {selectedImage && (
            <Text 
              text="Now tap the matching word" 
              style={[$instructionText, { color: colors.palette.neutral600 }]} 
            />
          )}
        </View>

        <View style={$mainContent}>
          {/* Left column - Images */}
          <View style={$column}>
            {reorderedObjects.map((object, index) => {
              const match = matches.find(m => m.imageId === object.id)
              const isIncorrect = incorrectPair?.imageId === object.id
              return (
                <View key={object.id} style={[$row, match?.isCorrect && $correctRow]}>
                  <Pressable
                    style={[
                      $imageContainer,
                      selectedImage === object.id && $selected,
                      match?.isCorrect && $correctMatch,
                      isIncorrect && $incorrectMatch
                    ]}
                    disabled={match?.isCorrect}
                    onPress={() => handleSelect(object.id, "image")}
                  >
                    <Image
                      source={object.isDefault ? object.uri : { uri: object.uri }}
                      style={$imageStyle}
                      resizeMode="contain"
                    />
                  </Pressable>
                </View>
              )
            })}
          </View>

          {/* Right column - Words */}
          <View style={$column}>
            {reorderedWords.map((choice, index) => {
              const match = matches.find(m => m.wordId === choice.id)
              const isIncorrect = incorrectPair?.wordId === choice.id
              return (
                <View key={choice.id} style={[$row, match?.isCorrect && $correctRow]}>
                  <Pressable
                    style={[
                      $wordContainer,
                      selectedWord === choice.id && $selected,
                      match?.isCorrect && $correctMatch,
                      isIncorrect && $incorrectMatch
                    ]}
                    disabled={match?.isCorrect}
                    onPress={() => handleSelect(choice.id, "word")}
                  >
                    <Text text={choice.word} style={$wordText} />
                  </Pressable>
                </View>
              )
            })}
          </View>
        </View>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $contentContainer: ViewStyle = {
  flex: 1,
  padding: spacing.medium,
}

const $scoreContainer: ViewStyle = {
  alignItems: "center",
  marginVertical: spacing.medium,
}

const $scoreText: TextStyle = {
  fontSize: 24,
  fontWeight: "600",
  color: colors.text,
}

const $instructions: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.large,
  padding: spacing.medium,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.medium,
}

const $instructionText: TextStyle = {
  fontSize: 16,
  fontWeight: "500",
  textAlign: "center",
  marginBottom: spacing.tiny,
}

const $mainContent: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  gap: spacing.extraLarge,
}

const $column: ViewStyle = {
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "center",
  gap: spacing.medium,
}

const $row: ViewStyle = {
  width: "100%",
  padding: spacing.tiny,
  borderRadius: spacing.medium,
}

const $correctRow: ViewStyle = {
  backgroundColor: colors.palette.success100,
}

const $incorrectRow: ViewStyle = {
  backgroundColor: colors.palette.angry100,
}

const $imageContainer: ViewStyle = {
  width: "100%",
  aspectRatio: 1,
  backgroundColor: colors.palette.neutral200,
  borderRadius: spacing.medium,
  padding: spacing.small,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 2,
  borderColor: "transparent",
}

const $imageStyle: ImageStyle = {
  width: "100%",
  height: "100%",
}

const $wordContainer: ViewStyle = {
  width: "100%",
  aspectRatio: 1,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.medium,
  padding: spacing.medium,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
  borderWidth: 2,
  borderColor: "transparent",
}

const $wordText: TextStyle = {
  fontSize: 20,
  fontWeight: "600",
  textAlign: "center",
  color: colors.text,
}

const $selected: ViewStyle = {
  borderColor: colors.palette.secondary500,
  backgroundColor: colors.palette.neutral100,
}

const $correctMatch: ViewStyle = {
  borderColor: colors.palette.success300,
  backgroundColor: colors.palette.success100,
}

const $incorrectMatch: ViewStyle = {
  borderColor: colors.palette.angry500,
  backgroundColor: colors.palette.angry100,
}

const $noSetsContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.large,
  backgroundColor: colors.palette.neutral100,
  margin: spacing.large,
  borderRadius: spacing.medium,
}

const $iconContainer: ViewStyle = {
  marginBottom: spacing.medium,
}

const $emoji: TextStyle = {
  fontSize: 48,
}

const $instructionList: ViewStyle = {
  alignItems: "flex-start",
  width: "100%",
  paddingHorizontal: spacing.large,
}

const $instructionItem: TextStyle = {
  fontSize: 16,
  lineHeight: 24,
  marginBottom: spacing.small,
  color: colors.textDim,
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
}

const $centerContent: ViewStyle = {
  flex: 1,
  justifyContent: "center",
} 