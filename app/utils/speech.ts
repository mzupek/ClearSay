import * as Speech from 'expo-speech'

export const speakCharacter = async (character: string) => {
  try {
    // Simple speak with minimal options
    await Speech.speak(character, {
      language: 'en-US',
      rate: 0.8,
    })
  } catch (error) {
    console.error('Speech error:', error)
  }
}

export const stopSpeaking = async () => {
  try {
    await Speech.stop()
  } catch (error) {
    console.error('Stop speech error:', error)
  }
} 