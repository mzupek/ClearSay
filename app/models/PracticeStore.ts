import { Instance, SnapshotOut, types } from "mobx-state-tree"

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
    remainingCharacters: types.optional(types.array(types.string), []),
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
      this.initializeCharacterPool()
    },

    initializeCharacterPool() {
      // Define our character pool
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
      const numbers = "0123456789".split("")
      const allCharacters = [...letters, ...numbers]
      
      // Fisher-Yates shuffle
      const shuffled = [...allCharacters]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      
      self.remainingCharacters.replace(shuffled)
      console.log("Initialized character pool:", shuffled)
    },

    generateNewCharacter() {
      // If we're out of characters, reshuffle
      if (self.remainingCharacters.length === 0) {
        this.initializeCharacterPool()
      }
      
      // Take the next character from our shuffled array
      const nextCharacter = self.remainingCharacters.pop()
      if (nextCharacter) {
        self.currentCharacter = nextCharacter
        self.lastAttemptCorrect = undefined
        console.log("Generated new character:", nextCharacter, 
                   "Remaining:", self.remainingCharacters.length)
      }
    },

    clearCharacter() {
      self.currentCharacter = ""
    },

    endSession() {
      self.isSessionActive = false
      self.currentCharacter = ""
      self.lastAttemptCorrect = undefined
      self.remainingCharacters.clear()
    },

    markAttempt(correct: boolean) {
      self.totalAttempts += 1
      if (correct) self.currentScore += 1
      self.lastAttemptCorrect = correct
    },
  }))

export interface PracticeStore extends Instance<typeof PracticeStoreModel> {}
export interface PracticeStoreSnapshot extends SnapshotOut<typeof PracticeStoreModel> {} 