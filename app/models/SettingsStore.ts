import { Instance, SnapshotOut, types } from "mobx-state-tree"
import AsyncStorage from "@react-native-async-storage/async-storage"

const STORAGE_KEY = "CLEARSAY_SETTINGS"

export const SettingsStoreModel = types
  .model("SettingsStore")
  .props({
    selectedVoiceId: types.optional(types.string, ""),
    selectedVoiceName: types.optional(types.string, "Default"),
    availableVoices: types.optional(types.array(types.frozen()), [])
  })
  .actions((self) => ({
    setSelectedVoice(voiceId: string, voiceName: string) {
      self.selectedVoiceId = voiceId
      self.selectedVoiceName = voiceName
      // Save settings when voice is selected
      this.saveSettings()
    },

    setAvailableVoices(voices: any[]) {
      self.availableVoices = voices
    },

    // Load settings from storage
    async loadSettings() {
      try {
        const settings = await AsyncStorage.getItem(STORAGE_KEY)
        if (settings) {
          const parsed = JSON.parse(settings)
          self.selectedVoiceId = parsed.selectedVoiceId
          self.selectedVoiceName = parsed.selectedVoiceName
          console.log('Settings loaded:', parsed)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    },

    // Save settings to storage
    async saveSettings() {
      try {
        const settings = {
          selectedVoiceId: self.selectedVoiceId,
          selectedVoiceName: self.selectedVoiceName,
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
        console.log('Settings saved:', settings)
      } catch (error) {
        console.error('Error saving settings:', error)
      }
    }
  }))

export interface SettingsStore extends Instance<typeof SettingsStoreModel> {}
export interface SettingsStoreSnapshot extends SnapshotOut<typeof SettingsStoreModel> {} 