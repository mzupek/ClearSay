import React, { useEffect, useState } from "react"
import { ViewStyle, TextStyle } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { Audio } from 'expo-av'
import * as Speech from 'expo-speech'

interface PermissionStatus {
  microphone: string
  speech: boolean
}

export const WelcomeScreen = ({ navigation }) => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    microphone: 'unknown',
    speech: false,
  })
  const [isChecking, setIsChecking] = useState(true)

  const checkPermissions = async () => {
    setIsChecking(true)
    try {
      // Check microphone permission
      const micPermission = await Audio.requestPermissionsAsync()
      console.log('Microphone permission:', micPermission.granted ? 'granted' : 'denied')
      
      // Check speech availability
      const isSpeaking = await Speech.isSpeakingAsync()
      console.log('Currently speaking:', isSpeaking)
      
      setPermissionStatus({
        microphone: micPermission.granted ? 'granted' : 'denied',
        speech: !isSpeaking,  // If not speaking, then speech is available
      })
    } catch (error) {
      console.error('Error checking permissions:', error)
      setPermissionStatus({
        microphone: 'unknown',
        speech: false,
      })
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkPermissions()
  }, [])

  const hasAllPermissions = () => {
    return permissionStatus.microphone === 'granted' && permissionStatus.speech
  }

  const handleContinue = () => {
    if (hasAllPermissions()) {
      navigation.replace('MainTabs')
    } else {
      checkPermissions()
    }
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} style={$screenContainer}>
      <Text text="Welcome to ClearSay" style={$title} />
      
      <Text 
        text="Practice your pronunciation with interactive exercises" 
        style={$subtitle} 
      />

      {isChecking ? (
        <Text text="Checking permissions..." style={$text} />
      ) : (
        <>
          <Text style={$permissionTitle} text="Required Permissions:" />
          
          <Text 
            style={[$text, permissionStatus.microphone === 'granted' && $granted]} 
            text={`Microphone: ${permissionStatus.microphone}`} 
          />
          
          <Text 
            style={[$text, permissionStatus.speech && $granted]} 
            text={`Speech Recognition: ${permissionStatus.speech ? 'available' : 'unavailable'}`} 
          />

          {!hasAllPermissions() && (
            <Text 
              style={$helpText} 
              text="Please grant microphone access and ensure speech recognition is available to use ClearSay" 
            />
          )}

          <Button
            text={hasAllPermissions() ? "Continue" : "Grant Permissions"}
            onPress={handleContinue}
            style={$button}
          />
        </>
      )}
    </Screen>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
  marginTop: spacing.xl,
  padding: spacing.lg,
  backgroundColor: colors.background,
}

const $title: TextStyle = {
  fontSize: 32,
  fontWeight: "bold",
  textAlign: "center",
  paddingTop: spacing.xl,
  marginBottom: spacing.lg,
  color: colors.text,
  minHeight: 50,
}

const $subtitle: TextStyle = {
  fontSize: 18,
  textAlign: "center",
  marginBottom: spacing.xl,
  color: colors.text,
}

const $permissionTitle: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: spacing.md,
  color: colors.text,
}

const $text: TextStyle = {
  fontSize: 16,
  marginBottom: spacing.sm,
  color: colors.text,
}

const $granted: TextStyle = {
  color: colors.palette.neutral500,
}

const $helpText: TextStyle = {
  fontSize: 14,
  color: colors.error,
  textAlign: "center",
  marginTop: spacing.md,
  marginBottom: spacing.lg,
}

const $button: ViewStyle = {
  marginTop: spacing.xl,
}
