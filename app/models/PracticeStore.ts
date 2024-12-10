import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { speakCharacter } from "app/utils/speech"

/**
 * Practice store model for stroke recovery exercises
 */
export const PracticeStoreModel = types
  .model("PracticeStore")
  .props({
    currentCharacter: types.optional(types.string, ""),
    isSessionActive: types.optional(types.boolean, false),
    currentScore: types.optional(types.number, 0),
    totalAttempts: types.optional(types.number, 0),
    lastAttemptCorrect: types.optional(types.maybe(types.boolean), undefined),
  })
  .views((self) => ({
    get accuracy() {
      if (self.totalAttempts === 0) return 0
      return Math.round((self.currentScore / self.totalAttempts) * 100)
    }
  }))
  .actions((self) => ({
    startSession() {
      self.isSessionActive = true
      self.currentScore = 0
      self.totalAttempts = 0
      self.lastAttemptCorrect = undefined
      self.generateNewCharacter()
    },

    clearCharacter() {
      this.currentCharacter = ""
    },

    endSession() {
      self.isSessionActive = false
      self.currentCharacter = ""
      self.lastAttemptCorrect = undefined
    },

    async generateNewCharacter() {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      const randomIndex = Math.floor(Math.random() * characters.length)
      self.currentCharacter = characters[randomIndex]
      self.lastAttemptCorrect = undefined
      
      // Automatically play new character
      await speakCharacter(self.currentCharacter)
    },

    markAttempt(correct: boolean) {
      self.totalAttempts += 1
      if (correct) self.currentScore += 1
      self.lastAttemptCorrect = correct
    },
  }))

export interface PracticeStore extends Instance<typeof PracticeStoreModel> {}
export interface PracticeStoreSnapshot extends SnapshotOut<typeof PracticeStoreModel> {} 