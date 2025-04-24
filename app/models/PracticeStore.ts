import { types, Instance } from "mobx-state-tree"
import { shuffle } from "app/utils/shuffle"
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import * as storage from "app/utils/storage"
import { Dimensions } from "react-native"

const SessionRecord = types.model("SessionRecord", {
  id: types.identifier,
  character: types.string,
  accuracy: types.number,
  totalFound: types.number,
  totalTargets: types.number,
  incorrectAttempts: types.number,
  timestamp: types.number,
  date: types.string,
})

const fisherYatesShuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export const PracticeStoreModel = types
  .model("PracticeStore")
  .props({
    isSessionActive: types.optional(types.boolean, false),
    currentRound: types.optional(types.number, 1),
    currentCharacter: types.optional(types.string, "A"),
    correctAnswers: types.optional(types.number, 0),
    totalAttempts: types.optional(types.number, 0),
    incorrectAttempts: types.optional(types.number, 0),
    currentGrid: types.optional(types.array(types.string), []),
    targetPositions: types.optional(types.array(types.number), []),
    selectedPositions: types.map(types.model({
      selected: types.boolean,
      correct: types.boolean
    })),
    sessionHistory: types.optional(types.array(SessionRecord), []),
    usedCharacters: types.optional(types.array(types.string), [])
  })
  .views((self) => ({
    accuracy() {
      if (self.totalAttempts === 0) return 0
      return Math.round((self.correctAnswers / self.totalAttempts) * 100)
    },
    getCurrentRoundCharacters() {
      return self.currentGrid
    },
    isTargetPosition(index: number) {
      return self.targetPositions.includes(index)
    },
    getRemainingTargets() {
      return self.targetPositions.length
    },
    isPositionSelected(index: number) {
      const pos = self.selectedPositions.get(index.toString())
      return pos ? pos.selected : false
    },
    wasSelectionCorrect(index: number) {
      const pos = self.selectedPositions.get(index.toString())
      return pos ? pos.correct : false
    },
    getDateRangeStats(days: number) {
      const now = Date.now()
      const startDate = now - (days * 24 * 60 * 60 * 1000)
      const sessions = self.sessionHistory.filter(s => s.timestamp >= startDate)
      
      if (sessions.length === 0) return null

      const totalAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0)
      const uniqueChars = new Set(sessions.map(s => s.character))

      return {
        averageAccuracy: Math.round(totalAccuracy / sessions.length),
        sessions: sessions.length,
        characters: uniqueChars.size
      }
    },

    getDailyStats(days: number) {
      const now = Date.now()
      const stats = []
      
      for (let i = 0; i < days; i++) {
        const date = now - (i * 24 * 60 * 60 * 1000)
        const dayStart = startOfDay(date).getTime()
        const dayEnd = endOfDay(date).getTime()
        
        const daySessions = self.sessionHistory.filter(s => 
          s.timestamp >= dayStart && s.timestamp <= dayEnd
        )
        
        if (daySessions.length > 0) {
          const totalAccuracy = daySessions.reduce((sum, s) => sum + s.accuracy, 0)
          stats.push({
            date: format(date, 'MMM d'),
            accuracy: Math.round(totalAccuracy / daySessions.length),
            sessions: daySessions.length
          })
        } else {
          stats.push({
            date: format(date, 'MMM d'),
            accuracy: 0,
            sessions: 0
          })
        }
      }
      
      return stats.reverse()
    },

    getCharacterStats(char: string) {
      const sessions = self.sessionHistory.filter(s => s.character === char)
      
      if (sessions.length === 0) return null

      const totalAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0)
      const lastSession = sessions.reduce((latest, curr) => 
        curr.timestamp > latest.timestamp ? curr : latest
      )

      return {
        averageAccuracy: Math.round(totalAccuracy / sessions.length),
        sessions: sessions.length,
        lastPlayed: lastSession.timestamp
      }
    }
  }))
  .actions((self) => {
    function generateNewGrid() {
      const gridSize = 16 // 4x4 grid
      const targetCount = Math.floor(Math.random() * 2) + 3 // 3-4 targets
      const newGrid: string[] = new Array(gridSize).fill("")
      const newTargetPositions: number[] = []
      
      // First, place target characters in random positions
      while (newTargetPositions.length < targetCount) {
        const position = Math.floor(Math.random() * gridSize)
        if (!newTargetPositions.includes(position)) {
          newTargetPositions.push(position)
          newGrid[position] = self.currentCharacter
        }
      }
      
      // Fill remaining positions with random characters
      for (let i = 0; i < gridSize; i++) {
        if (!newTargetPositions.includes(i)) {
          let randomChar
          do {
            randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26))
          } while (randomChar === self.currentCharacter)
          newGrid[i] = randomChar
        }
      }
      
      self.currentGrid.replace(newGrid)
      self.targetPositions.replace(newTargetPositions)
      self.selectedPositions.clear()
    }

    function getRandomCharacter() {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
      const availableChars = alphabet.filter(char => !self.usedCharacters.includes(char))
      
      // If we've used all characters, reset the used characters array
      if (availableChars.length === 0) {
        self.usedCharacters.clear()
        return alphabet[Math.floor(Math.random() * alphabet.length)]
      }
      
      return availableChars[Math.floor(Math.random() * availableChars.length)]
    }

    return {
      startNewGame() {
        self.isSessionActive = true
        self.currentRound = 1
        self.currentCharacter = getRandomCharacter()
        self.usedCharacters.push(self.currentCharacter)
        self.correctAnswers = 0
        self.totalAttempts = 0
        self.incorrectAttempts = 0
        self.selectedPositions.clear()
        generateNewGrid()
      },
      endSession() {
        self.isSessionActive = false
        self.currentGrid.clear()
        self.targetPositions.clear()
        self.selectedPositions.clear()
        self.usedCharacters.clear()
      },
      nextRound() {
        if (self.currentRound < 10) {
          self.currentRound += 1
          const nextChar = getRandomCharacter()
          self.currentCharacter = nextChar
          self.usedCharacters.push(nextChar)
          self.selectedPositions.clear()
          generateNewGrid()
        }
      },
      markPosition(index: number, isCorrect: boolean) {
        self.selectedPositions.set(index.toString(), { selected: true, correct: isCorrect })
      },
      markCharacterFound(foundCount: number, incorrectCount: number) {
        self.correctAnswers += foundCount
        self.incorrectAttempts += incorrectCount
        self.totalAttempts += foundCount + incorrectCount
      },
      removeTargetPosition(index: number) {
        const posIndex = self.targetPositions.indexOf(index)
        if (posIndex !== -1) {
          self.targetPositions.splice(posIndex, 1)
        }
      },
      recordSession() {
        const session = {
          id: Date.now().toString(),
          character: self.currentCharacter,
          accuracy: self.accuracy(),
          totalFound: self.correctAnswers,
          totalTargets: self.totalAttempts,
          incorrectAttempts: self.incorrectAttempts,
          timestamp: Date.now(),
          date: format(new Date(), 'yyyy-MM-dd')
        }
        self.sessionHistory.push(session)
      }
    }
  })

export interface PracticeStoreType extends Instance<typeof PracticeStoreModel> {}
export interface PracticeStore extends PracticeStoreType {}