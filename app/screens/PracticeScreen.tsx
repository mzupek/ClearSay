import { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, TextStyle } from "react-native"
import { Button, Screen, Text, Icon } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"
import { speakCharacter, stopSpeaking } from "app/utils/speech"
import { setupSpeechRecognition, startListening, stopListening, destroyRecognizer } from "app/utils/speechRecognition"
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice'
import * as Speech from 'expo-speech'
import { useNavigation } from "@react-navigation/native"

export const PracticeScreen = observer(function PracticeScreen() {
  const navigation = useNavigation()
  const { practiceStore } = useStores()
  const { settingsStore } = useStores()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [instruction, setInstruction] = useState("Press Play to hear the character")
  const [listenError, setListenError] = useState<string | null>(null)

  // Initialize the practice session
  useEffect(() => {
    console.log('Initializing practice screen...')
    
    // Start session
    practiceStore.startSession()
    
    // Setup speech recognition
    Voice.onSpeechStart = () => {
      console.log('Speech started')
      setIsListening(true)
      setListenError(null)
    }

    Voice.onSpeechEnd = () => {
      console.log('Speech ended')
      setIsListening(false)
    }

    Voice.onSpeechError = (e: any) => {
      console.error('Speech error:', e)
      setListenError(e.error?.message || 'Error listening')
      setIsListening(false)
    }

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      console.log('Speech results:', e.value)
      if (!e.value || e.value.length === 0) {
        setListenError('No speech detected')
        setInstruction("Didn't catch that. Try again!")
        return
      }

      const spokenText = e.value[0].toLowerCase().trim()
      const currentChar = practiceStore.currentCharacter.toLowerCase().trim()
      
      console.log('Spoken:', spokenText, 'Expected:', currentChar)
      
      // Enhanced matching logic
      const isCorrect = checkPronunciation(spokenText, currentChar)
      
      practiceStore.markAttempt(isCorrect)
      
      setInstruction(isCorrect ? "Correct! Well done!" : "Not quite. Try again!")
      
      setIsListening(false)
      stopListening()
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up practice screen...')
      practiceStore.endSession()
      destroyRecognizer().catch(error => {
        console.error('Error destroying recognizer:', error)
      })
    }
  }, []) // Empty dependency array means this only runs once on mount

  // Generate initial character after session is started
  useEffect(() => {
    if (practiceStore.isSessionActive && !practiceStore.currentCharacter) {
      console.log('Generating initial character...')
      practiceStore.generateNewCharacter()
    }
  }, [practiceStore.isSessionActive])

  console.log("isSessionActive:", practiceStore.isSessionActive)

  const handlePlaySound = async () => {
    try {
      console.log('Playing character:', practiceStore.currentCharacter)
      setIsPlaying(true)
      setInstruction("Playing character...")
      
      await Speech.speak(practiceStore.currentCharacter, {
        language: 'en-US',
        voice: settingsStore.selectedVoiceId || undefined,
        pitch: 1.0,
        rate: 0.75,
        quality: Speech.VoiceQuality.Enhanced,
        onDone: () => {
          console.log('Finished playing:', practiceStore.currentCharacter)
          setIsPlaying(false)
          setInstruction("Now try saying it yourself!")
        },
        onError: () => {
          console.error('Error playing character:', practiceStore.currentCharacter)
          setIsPlaying(false)
          setInstruction("Error playing sound. Try again.")
        }
      })
    } catch (error) {
      console.error('Error playing sound:', error)
      setIsPlaying(false)
      setInstruction("Error playing sound. Try again.")
    }
  }

  // Optional: Log available voices on component mount
  useEffect(() => {
    const checkVoices = async () => {
      const voices = await Speech.getAvailableVoicesAsync()
      console.log('Available voices:', voices.map(v => ({
        id: v.identifier,
        name: v.name,
        quality: v.quality
      })))
    }
    checkVoices()
  }, [])

  const handleSpeakPress = async () => {
    try {
      setListenError(null)
      stopSpeaking()
      setIsListening(true)
      setInstruction("Listening... Say the character now!")
      
      await startListening()
    } catch (error) {
      console.error('Error in handleSpeakPress:', error)
      setListenError('Failed to start listening')
      setIsListening(false)
      setInstruction("Error listening. Try again.")
    }
  }

  const handleNextPress = () => {
    console.log('Next button pressed, generating new character...')
    practiceStore.generateNewCharacter()
    setInstruction("Press Play to hear the new character")
  }

  const getCharacterBoxStyle = () => {
    if (practiceStore.lastAttemptCorrect === undefined) return $characterBox
    return [
      $characterBox,
      practiceStore.lastAttemptCorrect ? $correctBox : $incorrectBox
    ]
  }

  // New helper function for pronunciation checking
  const checkPronunciation = (spoken: string, expected: string): boolean => {
    // Common letter pronunciations
    const letterVariations: Record<string, string[]> = {
      'a': ['a', 'ay', 'eh'],
      'b': ['b', 'be', 'bee'],
      'c': ['c', 'see', 'sea', 'si'],
      'd': ['d', 'de', 'dee'],
      'e': ['e', 'ee', 'eh'],
      'f': ['f', 'ef', 'eff'],
      'g': ['g', 'ge', 'gee'],
      'h': ['h', 'he', 'aitch'],
      'i': ['i', 'eye', 'ai'],
      'j': ['j', 'je', 'jay'],
      'k': ['k', 'ka', 'kay'],
      'l': ['l', 'el', 'ell'],
      'm': ['m', 'em', 'mm'],
      'n': ['n', 'en', 'nn'],
      'o': ['o', 'oh', 'ow'],
      'p': ['p', 'pe', 'pee'],
      'q': ['q', 'qu', 'que'],
      'r': ['r', 'ar', 'are'],
      's': ['s', 'es', 'ess'],
      't': ['t', 'te', 'tee'],
      'u': ['u', 'you', 'yu'],
      'v': ['v', 've', 'vee'],
      'w': ['w', 'we', 'double u'],
      'x': ['x', 'ex', 'eks'],
      'y': ['y', 'why', 'ye'],
      'z': ['z', 'ze', 'zee', 'zed']
    }

    // Clean up spoken text
    const cleanSpoken = spoken
      .replace(/letter /i, '')
      .replace(/the /i, '')
      .replace(/capital /i, '')
      .trim()

    // Get variations for the expected character
    const validVariations = letterVariations[expected] || [expected]

    // Check if spoken text matches any valid variation
    const isMatch = validVariations.some(variation => 
      cleanSpoken === variation || 
      cleanSpoken === `letter ${variation}` ||
      cleanSpoken === `the letter ${variation}`
    )

    console.log('Checking pronunciation:', {
      cleanSpoken,
      validVariations,
      isMatch
    })

    return isMatch
  }

  const handleExitSession = () => {
    practiceStore.endSession()
    navigation.navigate("Welcome")
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} style={$screenContainer}>
      <View style={$mainContainer}>
        

        {/* Score Section */}
        <View style={$scoreSection}>
          <Text text={`Score: ${practiceStore.currentScore}`} style={$scoreText} />
          <Text text={`Accuracy: ${practiceStore.accuracy}%`} style={$scoreText} />
        </View>

        {/* Character Section */}
        <View style={$characterSection}>
          <View style={getCharacterBoxStyle()}>
            <Text text={practiceStore.currentCharacter} style={$characterText} />
          </View>

          <Text text={instruction} style={$instruction} />

          {listenError && (
            <View style={$errorBox}>
              <Text text={listenError} style={{ color: colors.error }} />
            </View>
          )}

          <View style={$buttonSection}>
            <Button
              preset="default"
              onPress={handlePlaySound}
              disabled={isPlaying || isListening}
              LeftAccessory={() => (
                <Icon 
                  icon="play" 
                  size={24} 
                  color={isPlaying ? colors.palette.neutral300 : colors.palette.blue500}
                />
              )}
              text={isPlaying ? "Playing..." : "Play"}
              style={$button}
            />

            <Button
              preset="default"
              text={isListening ? "Listening..." : "Speak"}
              onPress={handleSpeakPress}
              disabled={isListening || isPlaying}
              style={$button}
            />

            <Button
              preset="default"
              text="Next"
              onPress={handleNextPress}
              disabled={isListening || isPlaying}
              style={$button}
            />

            <Button
              preset="default"
              text="Exit Session"
              onPress={handleExitSession}
              style={$exitButton}
            />
                 

          </View>
        </View>
      </View>
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
  height: "100%",
}

// const $welcomeContainer: ViewStyle = {
//   flex: 1,
//   backgroundColor: colors.background,
//   minHeight: "100%",
//   paddingHorizontal: 20,
// }

// const $contentContainer: ViewStyle = {
//   flex: 0.8,  // 80% of parent
//   paddingTop: 0,
//   alignItems: "center",
// }

// const $title: TextStyle = {
//   fontSize: 32,
//   color: colors.text,
//   marginBottom: 20,
//   minHeight: 50,
//   paddingTop: 20,
// }

// const $text: TextStyle = {
//   fontSize: 16,
//   color: colors.text,
//   marginBottom: 10,
// }

// const $buttonContainer: ViewStyle = {
//   flex: 0.2,  // 20% of parent
//   alignItems: "center",
//   justifyContent: "center",
// }

const $mainContainer: ViewStyle = {
  flex: 1,
  paddingHorizontal: 20,
}

const $characterSection: ViewStyle = {
  marginTop: 150,
  alignItems: "center",
}

const $characterBox: ViewStyle = {
  width: 200,
  height: 200,
  backgroundColor: colors.background,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 2,
  borderColor: colors.palette.neutral400,
  marginBottom: 20,
  borderRadius: 4,
}

const $characterText: TextStyle = {
  fontSize: 160,
  fontWeight: "bold",
  color: colors.text,
  textAlign: "center",
  height: 180,
  lineHeight: 180,
  includeFontPadding: false,
  padding: 0,
  margin: 0,
}

const $instruction: TextStyle = {
  textAlign: "center",
  marginBottom: 20,
}

const $button: ViewStyle = {
  minWidth: 100,  // Reduced width to fit three buttons
  marginHorizontal: 5,
}

const $scoreSection: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  // paddingVertical: spacing.md,
  marginTop: -40,
  minHeight: 20,
}

const $scoreText: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
}

const $correctBox: ViewStyle = {
  borderColor: colors.palette.neutral500,
  backgroundColor: colors.palette.neutral100,
}

const $incorrectBox: ViewStyle = {
  borderColor: colors.palette.neutral100,
  backgroundColor: colors.palette.neutral100,
}

const $ttsControls: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: spacing.md,
}

const $playButton: ViewStyle = {
  minWidth: 150,
  backgroundColor: colors.palette.neutral100,
}

const $playingButton: ViewStyle = {
  backgroundColor: colors.palette.neutral200
}

const $buttonSection: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.md,
}

const $screenContentContainer: ViewStyle = {
  flexGrow: 1,
  minHeight: "100%",
}

const $listeningBox: ViewStyle = {
  marginTop: spacing.md,
  padding: spacing.md,
  borderRadius: 6,
  backgroundColor: colors.palette.neutral100,
  alignItems: "center",
}

const $errorBox: ViewStyle = {
  marginTop: spacing.md,
  padding: spacing.md,
  borderRadius: 6,
  backgroundColor: colors.palette.neutral100,
  alignItems: "center",
}

const $exitButtonContainer: ViewStyle = {
  position: 'absolute',
  top: spacing.medium,
  left: spacing.medium,
  zIndex: 1,
}

const $exitButton: ViewStyle = {
  minWidth: 100,
  backgroundColor: colors.palette.neutral400,
} 