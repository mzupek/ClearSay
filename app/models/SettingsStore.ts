import { types, Instance } from "mobx-state-tree"
import * as storage from "app/utils/storage"

const VoiceModel = types.model("Voice", {
  id: types.string,
  name: types.string,
  quality: types.string,
  isSelected: types.optional(types.boolean, false)
})

export const SettingsStoreModel = types
  .model("SettingsStore")
  .props({
    selectedVoiceId: types.optional(types.string, ""),
    selectedVoiceName: types.optional(types.string, ""),
    availableVoices: types.array(VoiceModel)
  })
  .actions((self) => ({
    setAvailableVoices(voices: any[]) {
      self.availableVoices.replace(voices)
    },

    setSelectedVoice(voiceId: string, voiceName: string) {
      self.selectedVoiceId = voiceId
      self.selectedVoiceName = voiceName
      
      // Update isSelected flag for all voices
      self.availableVoices.forEach(voice => {
        voice.isSelected = voice.id === voiceId
      })

      // Save to storage
      this.saveSettings()
    },

    async loadSettings() {
      try {
        const settings = await storage.load("settings")
        if (settings) {
          self.selectedVoiceId = settings.selectedVoiceId
          self.selectedVoiceName = settings.selectedVoiceName
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    },

    async saveSettings() {
      try {
        await storage.save("settings", {
          selectedVoiceId: self.selectedVoiceId,
          selectedVoiceName: self.selectedVoiceName
        })
      } catch (error) {
        console.error("Error saving settings:", error)
      }
    }
  }))

export interface SettingsStore extends Instance<typeof SettingsStoreModel> {} 