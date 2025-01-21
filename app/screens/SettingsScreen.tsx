import React, { useEffect, useState } from "react"
import { ViewStyle, TextStyle, View, ScrollView } from "react-native"
import { Screen, Text, Button, ListItem } from "app/components"
import { colors, spacing } from "app/theme"
import { useStores } from "app/models"
import * as Speech from 'expo-speech'

export const SettingsScreen = () => {
  const { settingsStore } = useStores()
  const [isLoading, setIsLoading] = useState(true)
  const [testPlaying, setTestPlaying] = useState(false)

  useEffect(() => {
    initializeSettings()
  }, [])

  const initializeSettings = async () => {
    try {
      setIsLoading(true)
      // Load saved settings first
      await settingsStore.loadSettings()
      // Then load available voices
      await loadVoices()
    } catch (error) {
      console.error('Error initializing settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadVoices = async () => {
    try {
      setIsLoading(true)
      const voices = await Speech.getAvailableVoicesAsync()
      const enhancedVoices = voices
        .filter(v => v.language.includes('en')) // English voices only
        .map(v => ({
          id: v.identifier,
          name: v.name,
          quality: v.quality,
          isSelected: v.identifier === settingsStore.selectedVoiceId
        }))
      
      settingsStore.setAvailableVoices(enhancedVoices)
    } catch (error) {
      console.error('Error loading voices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceSelect = async (voiceId: string, voiceName: string) => {
    settingsStore.setSelectedVoice(voiceId, voiceName)
  }

  const handleTestVoice = async (voiceId: string) => {
    try {
      setTestPlaying(true)
      await Speech.speak("This is a test of the selected voice.", {
        language: 'en-US',
        voice: voiceId,
        pitch: 1.0,
        rate: 0.75,
        quality: Speech.VoiceQuality.Enhanced,
      })
    } catch (error) {
      console.error('Error testing voice:', error)
    } finally {
      setTestPlaying(false)
    }
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} style={$screenContainer}>
      <Text text="Voice Settings" style={$title} />
      
      {isLoading ? (
        <Text text="Loading voices..." style={$text} />
      ) : (
        <ScrollView style={$voiceList}>
          {settingsStore.availableVoices.map((voice: any) => (
            <ListItem
              key={voice.id}
              text={voice.name}
              subText={`Quality: ${voice.quality}`}
              rightIcon={voice.isSelected ? "check" : undefined}
              onPress={() => handleVoiceSelect(voice.id, voice.name)}
              RightComponent={
                <Button
                  preset="default"
                  text="Test"
                  disabled={testPlaying}
                  onPress={() => handleTestVoice(voice.id)}
                  style={$testButton}
                />
              }
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
  padding: spacing.large,
  backgroundColor: colors.background,
}

const $title: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: spacing.lg,
  color: colors.text,
}

const $text: TextStyle = {
  fontSize: 16,
  color: colors.text,
}

const $voiceList: ViewStyle = {
  flex: 1,
}

const $testButton: ViewStyle = {
  minWidth: 80,
  marginLeft: spacing.medium,
  marginBottom: spacing.medium,
} 