import { Instance, types } from "mobx-state-tree"
import * as storage from "app/utils/storage"

const VoiceModel = types.model("Voice", {
  id: types.string,
  name: types.string,
  quality: types.string,
  isSelected: types.optional(types.boolean, false)
})

export const SettingsStore = types
  .model("SettingsStore")
  .props({
    selectedVoiceId: types.optional(types.string, ""),
    selectedVoiceName: types.optional(types.string, ""),
    availableVoices: types.optional(types.array(VoiceModel), [])
  })
  .actions(self => ({
    setSelectedVoice(voiceId: string, voiceName: string) {
      self.selectedVoiceId = voiceId
      self.selectedVoiceName = voiceName
      this.saveSettings()
    },

    setAvailableVoices(voices: any[]) {
      self.availableVoices.replace(voices)
      this.saveSettings()
    },

    setSettings(settings: any) {
      if (settings) {
        self.selectedVoiceId = settings.selectedVoiceId || ""
        self.selectedVoiceName = settings.selectedVoiceName || ""
        if (settings.availableVoices) {
          self.availableVoices.replace(settings.availableVoices)
        }
      }
    },

    async loadSettings() {
      try {
        const settings = await storage.load("settings")
        this.setSettings(settings)
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    },

    async saveSettings() {
      try {
        await storage.save("settings", {
          selectedVoiceId: self.selectedVoiceId,
          selectedVoiceName: self.selectedVoiceName,
          availableVoices: self.availableVoices.toJSON()
        })
      } catch (error) {
        console.error('Error saving settings:', error)
      }
    }
  }))

export interface SettingsStore extends Instance<typeof SettingsStore> {} 