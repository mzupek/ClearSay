import { types } from "mobx-state-tree"
import { shuffle } from "app/utils/shuffle"
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns"

const SessionRecord = types.model("SessionRecord", {
  id: types.identifier,
  character: types.string,
  accuracy: types.number,
  totalFound: types.number,
  totalTargets: types.number,
  timestamp: types.number,
  date: types.string,
})

export const PracticeStore = types
  .model("PracticeStore")
  .props({
    currentCharacter: types.optional(types.string, ""),
    currentRound: types.optional(types.number, 1),
    charactersFound: types.optional(types.number, 0),
    totalTargetCharacters: types.optional(types.number, 0),
    isSessionActive: types.optional(types.boolean, false),
    characterPool: types.optional(types.array(types.string), []),
    sessionHistory: types.array(SessionRecord),
    lastPositions: types.optional(types.array(types.number), []),
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
    generateCharacterSet(targetChar: string) {
      const allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("")
      const otherChars = allChars.filter(char => char !== targetChar)
      
      // Create 10 rounds of 5 characters each
      const rounds: string[][] = []
      
      for (let i = 0; i < 10; i++) {
        let roundChars: string[] = []
        
        // Get last position of target character
        const lastPos = self.lastPositions[i] || -1
        
        // Generate 5 positions, avoiding the last position
        let availablePositions = [0, 1, 2, 3, 4]
        if (lastPos !== -1) {
          availablePositions = availablePositions.filter(pos => pos !== lastPos)
        }
        
        // Randomly select position for target character
        const targetPos = availablePositions[Math.floor(Math.random() * availablePositions.length)]
        
        // Fill other positions with random characters
        for (let j = 0; j < 5; j++) {
          if (j === targetPos) {
            roundChars[j] = targetChar
          } else {
            const randomChar = shuffle(otherChars)[0]
            roundChars[j] = randomChar
          }
        }
        
        // Store the position for next game
        self.lastPositions[i] = targetPos
        rounds.push(roundChars)
      }
      
      // Flatten and return all rounds
      return rounds.flat()
    },

    startNewGame() {
      self.isSessionActive = true
      self.currentRound = 1
      self.charactersFound = 0
      self.totalTargetCharacters = 0
      
      // Use Fisher-Yates to select new character
      const allChars = shuffle("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(""))
      self.currentCharacter = allChars[0]
      
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
    },

    recordSession() {
      self.sessionHistory.push({
        id: Date.now().toString(),
        character: self.currentCharacter,
        accuracy: self.accuracy(),
        totalFound: self.charactersFound,
        totalTargets: self.totalTargetCharacters,
        timestamp: Date.now(),
        date: format(new Date(), 'yyyy-MM-dd')
      })
    }
  }))

type PracticeStoreType = Instance<typeof PracticeStore>
export interface PracticeStore extends PracticeStoreType {}