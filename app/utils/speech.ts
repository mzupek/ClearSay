import * as Speech from 'expo-speech'

const pluralizeCharacter = (char: string) => {
  // Special cases for some characters that might need different pluralization
  switch (char) {
    case 'S':
      return "S's" // Pronounce as "esses"
    case 'X':
      return "X's" // Pronounce as "exes"
    case 'I':
      return "I's" // Pronounce as "eyes"
    case 'A':
      return "A's" // Pronounce as "ays"
    case 'Y':
      return "Y's" // Pronounce as "whys"
    default:
      // For numbers and other letters, just add 's'
      return `${char}'s`
  }
}

export const speak = async (text: string, character?: string) => {
  try {
    const isSpeaking = await Speech.isSpeakingAsync()
    if (isSpeaking) {
      await Speech.stop()
    }

    // If character is provided, use pluralized version
    const finalText = character 
      ? text.replace(character, pluralizeCharacter(character))
      : text

    await Speech.speak(finalText, {
      language: 'en',
      pitch: 1,
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