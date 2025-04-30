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
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Debug logging for store state
  useEffect(() => {
    console.log("Store State:", {
      isActive: store.isActive,
      assignedSetsLength: store.assignedSets?.length,
      currentObjectsLength: store.currentObjects?.length,
      wordChoicesLength: store.wordChoices?.length,
      reorderedObjectsLength: reorderedObjects.length,
      reorderedWordsLength: reorderedWords.length,
    })
  }, [store.isActive, store.assignedSets, store.currentObjects, store.wordChoices, reorderedObjects, reorderedWords])

  // Debug logging for instructions state
  useEffect(() => {
    console.log("Instructions State:", {
      hasAssignedSets: Boolean(store.assignedSets?.length),
      assignedSetsLength: store.assignedSets?.length,
      isActive: store.isActive,
      hasError: Boolean(store.error),
      currentObjectsLength: store.currentObjects?.length,
      wordChoicesLength: store.wordChoices?.length,
    })
  }, [store.assignedSets?.length, store.isActive, store.error, store.currentObjects?.length, store.wordChoices?.length])

  // Clear incorrect pair highlight after delay
  useEffect(() => {
    if (incorrectPair) {
      const timer = setTimeout(() => {
        setIncorrectPair(null)
      }, 500) // Show red highlight for 500ms
      return () => clearTimeout(timer)
    }
  }, [incorrectPair])

  // Reset matches and selections when objects or word choices change
  useEffect(() => {
    console.log("New Round Effect:", {
      currentObjectsLength: store.currentObjects.length,
      wordChoicesLength: store.wordChoices.length,
      isTransitioning: store.isTransitioning
    })

    // Clear matches and selections when transitioning or when objects/words change
    if (store.isTransitioning || !store.currentObjects.length || !store.wordChoices.length) {
      setMatches([])
      setSelectedWord(null)
      setSelectedImage(null)
      setIncorrectPair(null)
      setIsTransitioning(true)
      
      // Configure transition animation
      LayoutAnimation.configureNext({
        duration: 500,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      })

      // Reset transition state after animation
      setTimeout(() => {
        setIsTransitioning(false)
      }, 500)
      return
    }

    // Initialize reordered arrays with current state
    setReorderedObjects([...store.currentObjects])
    setReorderedWords([...store.wordChoices])
  }, [store.currentObjects.length, store.wordChoices.length, store.isTransitioning])

  // Effect to start session when screen becomes active
  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen Focus Effect:", {
        assignedSetsLength: store.assignedSets?.length,
        isActive: store.isActive,
      })
      
      if (store.assignedSets?.length > 0 && !store.isActive) {
        console.log("Starting session on focus")
        store.startSession()
      }

      return () => {
        // Clean up function
        console.log("Screen losing focus")
      }
    }, [store])
  )

  // Effect to initialize first round
  useEffect(() => {
    console.log("Initialize Effect:", {
      assignedSetsLength: store.assignedSets?.length,
      hasAssignedSets: Boolean(store.assignedSets && store.assignedSets.length > 0),
      currentObjectsLength: store.currentObjects?.length,
      wordChoicesLength: store.wordChoices?.length,
      error: store.error,
    })

    // Only start practice if we have assigned sets and aren't already active
    if (store.assignedSets?.length > 0 && !store.isActive) {
      console.log("Starting practice with assigned sets:", store.assignedSets?.length)
      store.startSession()
    }
    
    return () => {
      if (store.isActive) {
        console.log("Cleaning up session")
        store.endSession()
      }
    }
  }, [store.assignedSets?.length])

  // Reorder objects and words when matches change
  useEffect(() => {
    if (!store.currentObjects.length || !store.wordChoices.length) return

    // Create arrays for matched and unmatched items
    const matchedPairs: { object: typeof store.currentObjects[0]; word: typeof store.wordChoices[0] }[] = []
    const unmatchedObjects: typeof store.currentObjects[0][] = []
    const unmatchedWords: typeof store.wordChoices[0][] = []

    // Separate matched and unmatched items
    store.currentObjects.forEach(obj => {
      const wordChoice = store.wordChoices.find(w => w.matchedToId === obj.id)
      if (wordChoice) {
        matchedPairs.push({ object: obj, word: wordChoice })
      } else {
        unmatchedObjects.push(obj)
      }
    })

    store.wordChoices.forEach(word => {
      if (!word.matchedToId) {
        unmatchedWords.push(word)
      }
    })

    // Combine matched pairs first, then unmatched items
    setReorderedObjects([
      ...matchedPairs.map(p => p.object),
      ...unmatchedObjects
    ])
    setReorderedWords([
      ...matchedPairs.map(p => p.word),
      ...unmatchedWords
    ])
  }, [store.currentObjects.length, store.wordChoices.length, matches.length])

  // Handle match attempts
  const handleSelect = (id: string, type: "word" | "image") => {
    console.log("\n=== New Selection ===")
    console.log("Selection:", { id, type })

    // Check if this item is already matched
    const isAlreadyMatched = matches.some(m => m.wordId === id || m.imageId === id)
    console.log("Already matched?", isAlreadyMatched)
    if (isAlreadyMatched) return

    if (type === "word" && !selectedImage) {
      console.log("Setting selected word:", id)
      setSelectedWord(id)
      setIncorrectPair(null)
    } else if (type === "image" && !selectedWord) {
      console.log("Setting selected image:", id)
      setSelectedImage(id)
      setIncorrectPair(null)
    }

    const wordId = type === "word" ? id : selectedWord
    const imageId = type === "image" ? id : selectedImage

    console.log("Attempting match with:", { wordId, imageId })

    if (wordId && imageId) {
      const isCorrect = store.tryMatch(wordId, imageId)
      console.log("Match attempt result:", { wordId, imageId, isCorrect })

      if (isCorrect) {
        console.log("Correct match - updating UI")
        const newMatchIndex = matches.length

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
        
        setMatches([...matches, { wordId, imageId, isCorrect: true, rowIndex: newMatchIndex }])
        setSelectedWord(null)
        setSelectedImage(null)
        setIncorrectPair(null)
      } else {
        console.log("Incorrect match - showing red highlight")
        setIncorrectPair({ wordId, imageId })
        setSelectedWord(null)
        setSelectedImage(null)
        
        // Clear incorrect pair after a delay
        setTimeout(() => {
          setIncorrectPair(null)
        }, 1000)
      }
    }
  }

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
  if (!store.assignedSets?.length) {
    console.log("Rendering instructions screen - NO SETS:", {
      assignedSets: store.assignedSets,
      assignedSetsLength: store.assignedSets?.length,
      isActive: store.isActive
    })
    return (
      <Screen style={$container} contentContainerStyle={$centerContent}>
        <View style={$noSetsContainer}>
          <View style={$iconContainer}>
            <Text style={$emoji}>📚</Text>
          </View>
          <Text style={[$errorText, { marginBottom: spacing.medium }]}>
            No Object Sets Selected
          </Text>
          <Text style={[$instructionText, { marginBottom: spacing.small }]}>
            To get started:
          </Text>
          <View style={$instructionList}>
            <Text style={$instructionItem}>1. Tap the Settings tab below</Text>
            <Text style={$instructionItem}>2. Select one or more object sets</Text>
            <Text style={$instructionItem}>3. Return here to practice</Text>
          </View>
        </View>
      </Screen>
    )
  }

  // Show error state
  if (store.error) {
    console.log("Rendering error screen:", { error: store.error })
    return (
      <Screen style={$container} preset="fixed" safeAreaEdges={["top"]}>
        <View style={[$contentContainer, { justifyContent: "center" }]}>
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
        </View>
      </Screen>
    )
  }

  // Show loading state
  if (!store.currentObjects?.length || !store.wordChoices?.length) {
    console.log("Rendering loading screen:", {
      currentObjectsLength: store.currentObjects?.length,
      wordChoicesLength: store.wordChoices?.length
    })
    return (
      <Screen style={$container} preset="fixed" safeAreaEdges={["top"]}>
        <View style={[$contentContainer, { justifyContent: "center" }]}>
          <View style={$noSetsContainer}>
            <View style={$iconContainer}>
              <Text text="⌛" style={$emoji} />
            </View>
            <Text 
              text="Loading practice items..." 
              preset="subheading" 
              style={[$errorText, { marginBottom: spacing.medium }]} 
            />
          </View>
        </View>
      </Screen>
    )
  }

  // If we have no reordered objects/words yet but have current objects, initialize them
  if ((!reorderedObjects?.length || !reorderedWords?.length) && store.currentObjects?.length > 0 && store.wordChoices?.length > 0) {
    console.log("Initializing reordered arrays")
    setReorderedObjects([...store.currentObjects])
    setReorderedWords(store.wordChoices.map(choice => ({
      id: choice.id,
      word: choice.word,
      isMatched: false,
      matchedToId: undefined,
      wasCorrectMatch: false
    })))
  }

  console.log("Rendering main content:", {
    reorderedObjectsLength: reorderedObjects.length,
    reorderedWordsLength: reorderedWords.length,
    matchesLength: matches.length,
    currentObjects: store.currentObjects.length,
    wordChoices: store.wordChoices.length,
    assignedSets: store.assignedSets.length,
    isActive: store.isActive
  })

  return (
    <Screen style={$container} preset="scroll">
      <View style={$contentContainer}>
        <View style={$scoreContainer}>
          <Text 
            text={`Session ${store.totalSessions} • Round ${store.currentRound + 1} • Score: ${store.correctAnswers}/${store.totalAttempts} (${store.accuracy}%)`} 
            style={$scoreText} 
          />
        </View>

        {isTransitioning && (
          <View style={$transitionOverlay}>
            <View style={$transitionContent}>
              <Text text="Great job!" style={$transitionText} />
              <Text text="Next round starting..." style={$transitionSubtext} />
            </View>
          </View>
        )}

        {selectedWord || selectedImage ? (
          <View style={$instructions}>
            <Text 
              text={selectedWord ? "Now tap the matching picture" : "Now tap the matching word"}
              style={[$instructionText, { color: colors.palette.neutral600 }]} 
            />
          </View>
        ) : null}

        <View style={$mainContent}>
          {/* Left column - Images */}
          <View style={$column}>
            {reorderedObjects.map((object, index) => {
              console.log("Rendering image:", { objectId: object.id, index })
              const match = matches.find(m => m.imageId === object.id)
              const isIncorrect = incorrectPair?.imageId === object.id
              return (
                <Pressable
                  key={object.id}
                  style={[
                    $cardWrapper,
                    match?.isCorrect && $correctRow
                  ]}
                  disabled={match?.isCorrect}
                  onPress={() => handleSelect(object.id, "image")}
                >
                  <View
                    style={[
                      $imageContainer,
                      selectedImage === object.id && $selected,
                      match?.isCorrect && $correctMatch,
                      // Only show incorrect if this is the last attempted incorrect pair
                      incorrectPair && incorrectPair.imageId === object.id && !match?.isCorrect && $incorrectMatch
                    ]}
                  >
                    <Image
                      source={object.isDefault ? object.uri : { uri: object.uri }}
                      style={$imageStyle}
                      resizeMode="contain"
                    />
                  </View>
                </Pressable>
              )
            })}
          </View>

          {/* Right column - Words */}
          <View style={$column}>
            {reorderedWords.map((choice, index) => {
              console.log("Rendering word:", { wordId: choice.id, word: choice.word, index })
              const match = matches.find(m => m.wordId === choice.id)
              const isIncorrect = incorrectPair?.wordId === choice.id
              return (
                <Pressable
                  key={choice.id}
                  style={[
                    $cardWrapper,
                    match?.isCorrect && $correctRow
                  ]}
                  disabled={match?.isCorrect}
                  onPress={() => handleSelect(choice.id, "word")}
                >
                  <View
                    style={[
                      $wordContainer,
                      selectedWord === choice.id && $selected,
                      match?.isCorrect && $correctMatch,
                      // Only show incorrect if this is the last attempted incorrect pair
                      incorrectPair && incorrectPair.wordId === choice.id && !match?.isCorrect && $incorrectMatch
                    ]}
                  >
                    <Text text={choice.word} style={$wordText} />
                  </View>
                </Pressable>
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
  padding: spacing.medium,
  backgroundColor: colors.background,
}

const $centerContent: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}

const $contentContainer: ViewStyle = {
  flex: 1,
  padding: spacing.medium,
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  backgroundColor: colors.background,
  zIndex: 2,
}

const $scoreContainer: ViewStyle = {
  alignItems: "center",
  marginVertical: spacing.small,
  width: "90%",
  maxWidth: 600,
  padding: spacing.small,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.medium,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}

const $instructions: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.small,
  padding: spacing.medium,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.medium,
  width: "90%",
  maxWidth: 600,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}

const $instructionText: TextStyle = {
  fontSize: 16,
  color: colors.textDim,
  textAlign: "center",
}

const $mainContent: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "flex-start",
  width: "100%",
  gap: spacing.medium,
  paddingHorizontal: spacing.medium,
  flex: 1,
  maxWidth: 800,
}

const $column: ViewStyle = {
  alignItems: "center",
  justifyContent: "flex-start",
  width: "48%",
  gap: spacing.small,
}

const $cardWrapper: ViewStyle = {
  width: "100%",
  aspectRatio: 1,
  padding: spacing.tiny,
  borderRadius: spacing.medium,
  minHeight: 120,
  maxHeight: 200,
}

const $cardBase: ViewStyle = {
  width: "100%",
  height: "100%",
  borderRadius: spacing.medium,
  padding: spacing.medium,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
}

const $imageContainer: ViewStyle = {
  ...$cardBase,
  backgroundColor: colors.palette.neutral200,
}

const $wordContainer: ViewStyle = {
  ...$cardBase,
  backgroundColor: colors.palette.neutral100,
}

const $imageStyle: ImageStyle = {
  width: "80%",
  height: "80%",
  resizeMode: "contain",
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

const $correctRow: ViewStyle = {
  backgroundColor: colors.palette.success100,
  borderRadius: spacing.medium,
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
  width: "90%",
  maxWidth: 600,
}

const $errorText: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.small,
  color: colors.error,
}

const $errorSubtext: TextStyle = {
  textAlign: "center",
  color: colors.textDim,
}

const $scoreText: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  textAlign: "center",
}

const $emoji: TextStyle = {
  fontSize: 48,
}

const $transitionOverlay: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.background,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
}

const $transitionContent: ViewStyle = {
  alignItems: 'center',
  padding: spacing.large,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.medium,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}

const $transitionText: TextStyle = {
  fontSize: 24,
  fontWeight: 'bold',
  color: colors.text,
  marginBottom: spacing.small,
}

const $transitionSubtext: TextStyle = {
  fontSize: 16,
  color: colors.textDim,
}

const $testText: TextStyle = {
  color: 'blue',
  fontSize: 24,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: spacing.medium,
} 