import { types } from "mobx-state-tree"
import { shuffle } from "app/utils/shuffle"

export const PracticeStoreModel = types
  .model("PracticeStore")
  .props({
    currentCharacter: types.optional(types.string, ""),
    currentRound: types.optional(types.number, 1),
    charactersFound: types.optional(types.number, 0),
    totalTargetCharacters: types.optional(types.number, 0),
    isSessionActive: types.optional(types.boolean, false),
    characterPool: types.optional(types.array(types.string), []),
  })
  .views(self => ({
    accuracy() {
      if (self.totalTargetCharacters === 0) return 0
      return Math.round((self.charactersFound / self.totalTargetCharacters) * 100)
    },
    isGameComplete() {
      return self.currentRound > 10
    },
    getCurrentRoundCharacters() {
      const startIndex = (self.currentRound - 1) * 5
      return self.characterPool.slice(startIndex, startIndex + 5)
    }
  }))
  .actions(self => ({
    generateCharacterSet(targetChar: string) {
      const allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("")
      const otherChars = allChars.filter(char => char !== targetChar)
      
      // Create 10 rounds of 5 characters each
      const rounds: string[][] = []
      
      for (let i = 0; i < 10; i++) {
        // Ensure one target character per round
        const roundChars = [
          targetChar,
          ...shuffle(otherChars).slice(0, 4)
        ]
        rounds.push(shuffle(roundChars))
      }
      
      // Flatten and return all rounds
      return rounds.flat()
    },

    startNewGame() {
      self.isSessionActive = true
      self.currentRound = 1
      self.charactersFound = 0
      self.totalTargetCharacters = 0
      self.currentCharacter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
        Math.floor(Math.random() * 36)
      ]
      self.characterPool = self.generateCharacterSet(self.currentCharacter)
    },

    markCharacterFound(found: number) {
      self.charactersFound += found
      self.totalTargetCharacters += self.getCurrentRoundCharacters()
        .filter(char => char === self.currentCharacter).length
    },

    nextRound() {
      if (self.currentRound < 10) {
        self.currentRound += 1
      } else {
        this.startNewGame()
      }
    },

    endSession() {
      self.isSessionActive = false
      self.currentRound = 1
      self.charactersFound = 0
      self.totalTargetCharacters = 0
      self.characterPool.clear()
    }
  })) 