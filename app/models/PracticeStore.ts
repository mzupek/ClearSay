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

export const PracticeStore = types
  .model("PracticeStore")
  .props({
    isSessionActive: types.optional(types.boolean, false),
    currentRound: types.optional(types.number, 1),
    currentCharacter: types.optional(types.string, ""),
    lastCharacter: types.optional(types.string, ""),
    characterPool: types.optional(types.array(types.string), []),
    charactersFound: types.optional(types.number, 0),
    incorrectAttempts: types.optional(types.number, 0),
    totalTargetCharacters: types.optional(types.number, 0),
    sessionHistory: types.optional(types.array(types.frozen()), []),
    currentRoundCharacters: types.optional(types.array(types.string), []),
    remainingCharacters: types.optional(types.array(types.string), [])
  })
  .views(self => ({
    accuracy() {
      // Round accuracy: correct finds vs incorrect attempts
      const totalAttempts = self.charactersFound + self.incorrectAttempts
      if (totalAttempts === 0) return 0
      return Math.round((self.charactersFound / totalAttempts) * 100)
    },
    
    completionRate() {
      // Completion rate: found vs total targets
      if (self.totalTargetCharacters === 0) return 0
      return Math.round((self.charactersFound / self.totalTargetCharacters) * 100)
    },
    isGameComplete() {
      return self.currentRound > 10
    },
    getCurrentRoundCharacters() {
      return self.currentRoundCharacters
    },
    get averageAccuracy() {
      if (self.sessionHistory.length === 0) return 0
      const total = self.sessionHistory.reduce((sum, session) => sum + session.accuracy, 0)
      return Math.round(total / self.sessionHistory.length)
    },
    getCharacterStats(char: string) {
      const sessions = self.sessionHistory.filter(s => s.character === char)
      if (sessions.length === 0) return null
      const totalAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0)
      return {
        attempts: sessions.length,
        averageAccuracy: Math.round(totalAccuracy / sessions.length),
        lastAttempt: Math.max(...sessions.map(s => s.timestamp))
      }
    },
    getDateRangeStats(days: number) {
      const endDate = new Date()
      const startDate = subDays(endDate, days)
      
      const sessionsInRange = self.sessionHistory.filter(session => {
        const sessionDate = new Date(session.timestamp)
        return isWithinInterval(sessionDate, {
          start: startOfDay(startDate),
          end: endOfDay(endDate)
        })
      })

      if (sessionsInRange.length === 0) return null

      const accuracySum = sessionsInRange.reduce((sum, s) => sum + s.accuracy, 0)
      return {
        sessions: sessionsInRange.length,
        averageAccuracy: Math.round(accuracySum / sessionsInRange.length),
        characters: new Set(sessionsInRange.map(s => s.character)).size
      }
    },
    getDailyStats(days: number) {
      const stats: { date: string; accuracy: number; sessions: number }[] = []
      const endDate = new Date()
      
      for (let i = 0; i < days; i++) {
        const date = subDays(endDate, i)
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)
        
        const daySessions = self.sessionHistory.filter(session => {
          const sessionDate = new Date(session.timestamp)
          return isWithinInterval(sessionDate, { start: dayStart, end: dayEnd })
        })

        if (daySessions.length > 0) {
          const accuracySum = daySessions.reduce((sum, s) => sum + s.accuracy, 0)
          stats.push({
            date: format(date, 'MMM d'),
            accuracy: Math.round(accuracySum / daySessions.length),
            sessions: daySessions.length
          })
        }
      }
      
      return stats.reverse()
    }
  }))
  .actions(self => ({
    generateRoundCharacters() {
      const gridSize = 8
      // Full alphabet and numbers for both targets and distractors
      const allCharacters = [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
      ]
      const result: string[] = []
      
      // Add 2-4 target characters randomly
      const targetCount = Math.floor(Math.random() * 3) + 2 // 2-4 targets
      for (let i = 0; i < targetCount; i++) {
        result.push(self.currentCharacter)
      }
      
      // Fill remaining spots with distractors (excluding current character)
      const distractors = allCharacters.filter(char => char !== self.currentCharacter)
      while (result.length < gridSize) {
        const randomDistractor = distractors[Math.floor(Math.random() * distractors.length)]
        result.push(randomDistractor)
      }
      
      // Shuffle using Fisher-Yates and store
      self.currentRoundCharacters = fisherYatesShuffle(result)
      self.totalTargetCharacters = targetCount
    },

    startNewGame() {
      self.isSessionActive = true
      self.currentRound = 1
      self.charactersFound = 0
      self.incorrectAttempts = 0
      self.totalTargetCharacters = 0
      
      // Reset or initialize remaining characters if empty
      if (self.remainingCharacters.length === 0) {
        self.remainingCharacters.replace([
          "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
          "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
          "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
        ])
      }
      
      // Pick random character from remaining pool, avoiding last character
      let availableChars = self.remainingCharacters.filter(char => char !== self.lastCharacter)
      if (availableChars.length === 0) availableChars = self.remainingCharacters
      
      const randomIndex = Math.floor(Math.random() * availableChars.length)
      const selectedChar = availableChars[randomIndex]
      
      // Update current and last character
      self.lastCharacter = self.currentCharacter
      self.currentCharacter = selectedChar
      
      // Remove selected character from pool
      const poolIndex = self.remainingCharacters.indexOf(selectedChar)
      if (poolIndex > -1) {
        self.remainingCharacters.splice(poolIndex, 1)
      }
      
      this.generateRoundCharacters()
    },

    markCharacterFound(correct: number, incorrect: number) {
      self.charactersFound += correct
      self.incorrectAttempts += incorrect
      // Track total targets for completion rate
      const currentTargets = self.currentRoundCharacters.filter(
        char => char === self.currentCharacter
      ).length
      self.totalTargetCharacters += currentTargets
    },

    nextRound() {
      self.currentRound += 1
      this.generateRoundCharacters()
    },

    endSession() {
      self.isSessionActive = false
      self.currentRound = 1
      self.charactersFound = 0
      self.incorrectAttempts = 0
      self.totalTargetCharacters = 0
      self.characterPool.clear()
    },

    recordSession() {
      self.sessionHistory.push({
        id: Date.now().toString(),
        character: self.currentCharacter,
        accuracy: self.accuracy(),
        completionRate: self.completionRate(),
        totalFound: self.charactersFound,
        totalTargets: self.totalTargetCharacters,
        incorrectAttempts: self.incorrectAttempts,
        timestamp: Date.now(),
        date: format(new Date(), 'yyyy-MM-dd')
      })
      
      // If all characters have been practiced, reset the pool
      if (self.remainingCharacters.length === 0) {
        self.remainingCharacters.replace([
          "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
          "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
          "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
        ])
      }
    }
  }))

type PracticeStoreType = Instance<typeof PracticeStore>
export interface PracticeStore extends PracticeStoreType {}