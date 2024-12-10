import Voice, { SpeechResultsEvent } from '@react-native-voice/voice'

export const setupSpeechRecognition = () => {
  Voice.onSpeechStart = () => {
    console.log('Speech started')
  }

  Voice.onSpeechEnd = () => {
    console.log('Speech ended')
  }

  Voice.onSpeechResults = (e: SpeechResultsEvent) => {
    console.log('Speech results:', e.value)
    return e.value?.[0] || ''
  }

  Voice.onSpeechError = (e: any) => {
    console.error('Speech error:', e)
  }
}

export const startListening = async () => {
  try {
    console.log('Starting voice recognition...')
    
    // Add more granular logging
    console.log('Checking voice availability...')
    let isAvailable = false
    try {
      isAvailable = await Voice.isAvailable()
      console.log('Voice availability check result:', isAvailable)
    } catch (error) {
      console.error('Error checking voice availability:', error)
      throw new Error('Could not check voice availability')
    }

    if (!isAvailable) {
      console.error('Voice recognition is not available')
      throw new Error('Voice recognition not available')
    }
    
    console.log('Attempting to start voice recognition...')
    await Voice.start('en-US')
    console.log('Voice recognition started successfully')
  } catch (error) {
    console.error('Error in startListening:', error)
    throw error
  }
}

export const stopListening = async () => {
  try {
    await Voice.stop()
    console.log('Voice recognition stopped')
  } catch (error) {
    console.error('Error stopping voice recognition:', error)
    throw error
  }
}

export const destroyRecognizer = async () => {
  try {
    await Voice.destroy()
    console.log('Voice recognition destroyed')
  } catch (error) {
    console.error('Error destroying voice recognition:', error)
    throw error
  }
} 