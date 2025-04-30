import { Instance, types } from "mobx-state-tree"
import { ObjectModel } from "./ObjectModel"
import { ObjectSetModel } from "./ObjectSetModel"
import { format, startOfDay, endOfDay } from "date-fns"

const WordChoice = types.model("WordChoice", {
  id: types.string,
  word: types.string,
  isMatched: types.optional(types.boolean, false),
  matchedToId: types.maybe(types.string),
  wasCorrectMatch: types.optional(types.boolean, false)
})

const SessionRecord = types.model("SessionRecord", {
  id: types.identifier,
  accuracy: types.number,
  totalAttempts: types.number,
  correctAnswers: types.number,
  timestamp: types.number,
  date: types.string,
})

export const RecognitionPracticeModel = types
  .model("RecognitionPractice")
  .props({
    isActive: types.optional(types.boolean, false),
    assignedSets: types.array(types.reference(ObjectSetModel)),
    currentObjects: types.array(types.reference(ObjectModel)),
    wordChoices: types.array(WordChoice),
    correctAnswers: types.optional(types.number, 0),
    totalAttempts: types.optional(types.number, 0),
    allTimeCorrectAnswers: types.optional(types.number, 0),
    allTimeAttempts: types.optional(types.number, 0),
    totalSessions: types.optional(types.number, 0),
    currentRound: types.optional(types.number, 0),
    sessionHistory: types.optional(types.array(SessionRecord), []),
    settings: types.optional(types.model({
      numberOfItems: types.optional(types.number, 3),
      announceChoices: types.optional(types.boolean, true),
      announceCorrectness: types.optional(types.boolean, true)
    }), { numberOfItems: 3 }),
    error: types.maybeNull(types.string),
    practiceMode: types.optional(
      types.enumeration(["sequential", "random", "adaptive"]),
      "random"
    ),
    isTransitioning: types.optional(types.boolean, false),
    availableObjectPool: types.optional(types.array(types.reference(ObjectModel)), [])
  })
  .views((self) => ({
    get accuracy() {
      if (self.totalAttempts === 0) return 0
      return Math.round((self.correctAnswers / self.totalAttempts) * 100)
    },
    get allTimeAccuracy() {
      if (self.allTimeAttempts === 0) return 0
      return Math.round((self.allTimeCorrectAnswers / self.allTimeAttempts) * 100)
    },
    get availableObjects() {
      const objects = new Set<Instance<typeof ObjectModel>>()
      self.assignedSets.forEach(set => {
        set.objects.forEach(obj => objects.add(obj))
      })
      return Array.from(objects)
    },
    get isRoundComplete() {
      return self.wordChoices.every(choice => choice.isMatched)
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
      
      return stats
    }
  }))
  .actions((self) => {
    let transitionTimer: NodeJS.Timeout | null = null

    function setError(message: string | null) {
      self.error = message
    }

    function clearTransitionTimer() {
      if (transitionTimer) {
        clearTimeout(transitionTimer)
        transitionTimer = null
      }
    }

    function generateNewRound() {
      console.log("=== Starting New Round ===")
      console.log("Current State:", {
        session: self.totalSessions,
        round: self.currentRound,
        score: `${self.correctAnswers}/${self.totalAttempts}`,
        accuracy: self.accuracy,
      })

      // Shuffle the object pool more thoroughly
      const shuffledPool = [...self.availableObjectPool]
      for (let i = shuffledPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]]
      }

      // Select objects for this round
      self.currentObjects.clear()
      self.currentObjects.replace(shuffledPool.slice(0, 3))
      console.log("Selected Objects:", self.currentObjects.map(obj => ({ id: obj.id, name: obj.name })))

      // Shuffle word choices independently
      const shuffledWords = [...self.currentObjects]
      for (let i = shuffledWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]]
      }

      self.wordChoices.clear()
      self.wordChoices.replace(shuffledWords.map((obj) => ({
        id: obj.id,
        word: obj.name,
        isMatched: false,
        matchedToId: undefined,
        wasCorrectMatch: false,
      })))

      console.log("Shuffled Word Choices:", self.wordChoices.map(w => ({ id: w.id, word: w.word })))
      console.log("=== Round Setup Complete ===\n")
    }

    return {
      setAssignedSets(sets: Instance<typeof ObjectSetModel>[]) {
        self.assignedSets.replace(sets)
      },

      generateNewRound() {
        console.log("=== Starting New Round ===")
        console.log("Current State:", {
          session: self.totalSessions,
          round: self.currentRound,
          score: `${self.correctAnswers}/${self.totalAttempts}`,
          accuracy: self.accuracy,
        })

        // Shuffle the object pool more thoroughly
        const shuffledPool = [...self.availableObjectPool]
        for (let i = shuffledPool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]]
        }

        // Select objects for this round
        self.currentObjects.clear()
        self.currentObjects.replace(shuffledPool.slice(0, 3))
        console.log("Selected Objects:", self.currentObjects.map(obj => ({ id: obj.id, name: obj.name })))

        // Shuffle word choices independently
        const shuffledWords = [...self.currentObjects]
        for (let i = shuffledWords.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]]
        }

        self.wordChoices.clear()
        self.wordChoices.replace(shuffledWords.map((obj) => ({
          id: obj.id,
          word: obj.name,
          isMatched: false,
          matchedToId: undefined,
          wasCorrectMatch: false,
        })))

        console.log("Shuffled Word Choices:", self.wordChoices.map(w => ({ id: w.id, word: w.word })))
        console.log("=== Round Setup Complete ===\n")
      },

      skipCurrentRound() {
        if (!self.isTransitioning) {
          this.startNewRound()
        }
      },

      startSession() {
        console.log("Starting session with sets:", self.assignedSets.length)
        if (self.assignedSets.length === 0) {
          setError("No object sets assigned for practice")
          return false
        }
        
        const objects = self.availableObjects
        console.log("Available objects:", objects.length)
        if (objects.length < 3) {
          setError("Not enough objects available for practice")
          return false
        }

        // Clear any existing state
        self.currentObjects.clear()
        self.wordChoices.clear()
        self.availableObjectPool.clear()

        // Initialize with fresh state
        self.availableObjectPool.replace([...objects].sort(() => Math.random() - 0.5))
        self.isActive = true
        self.correctAnswers = 0
        self.totalAttempts = 0
        self.totalSessions += 1
        self.isTransitioning = false
        setError(null)

        // Generate first round immediately
        const success = this.generateNewRound()
        console.log("First round generated:", success, {
          currentObjects: self.currentObjects.length,
          wordChoices: self.wordChoices.length
        })
        return success
      },

      endSession() {
        clearTransitionTimer()
        // Record the session before updating all-time stats
        const session = {
          id: Date.now().toString(),
          accuracy: self.accuracy,
          totalAttempts: self.totalAttempts,
          correctAnswers: self.correctAnswers,
          timestamp: Date.now(),
          date: format(new Date(), 'yyyy-MM-dd')
        }
        self.sessionHistory.push(session)

        // Update all-time stats
        self.allTimeAttempts += self.totalAttempts
        self.allTimeCorrectAnswers += self.correctAnswers
        self.isActive = false
        self.currentObjects.clear()
        self.wordChoices.clear()
        self.isTransitioning = false
        self.availableObjectPool.clear()
        setError(null)
      },

      startNewRound() {
        self.currentRound += 1
        this.startTransition()
        // Increase transition duration for smoother effect
        setTimeout(() => {
          this.completeTransition()
        }, 1000)
      },

      startTransition() {
        if (!self.isTransitioning) {
          self.isTransitioning = true
        }
      },

      completeTransition() {
        this.generateNewRound()
        self.isTransitioning = false
      },

      tryMatch(wordId: string, objectId: string) {
        console.log("\n=== Attempting Match ===")
        console.log("Current state:", {
          session: self.totalSessions,
          round: self.currentRound,
          score: `${self.correctAnswers}/${self.totalAttempts}`,
          accuracy: self.accuracy,
        })

        const wordChoice = self.wordChoices.find(w => w.id === wordId)
        console.log("Found wordChoice:", { wordChoice })
        if (!wordChoice || wordChoice.isMatched) return false

        self.totalAttempts += 1
        const matchingObject = self.currentObjects.find(obj => obj.id === objectId)
        console.log("Found matchingObject:", { object: matchingObject })
        const isCorrect = matchingObject && wordChoice.word === matchingObject.name

        console.log("Match result:", { wordId, objectId, isCorrect })

        if (isCorrect) {
          wordChoice.isMatched = true
          wordChoice.matchedToId = objectId
          wordChoice.wasCorrectMatch = true
          self.correctAnswers += 1
          console.log("Updated score:", {
            accuracy: self.accuracy,
            correct: self.correctAnswers,
            total: self.totalAttempts
          })

          const object = self.currentObjects.find(obj => obj.id === objectId)
          if (object) {
            object.updateMetadata(true)
          }

          const allMatched = self.wordChoices.every((w) => w.isMatched)
          console.log("All matches complete?", allMatched)
          if (allMatched) {
            // Add a small delay before starting transition to show success
            setTimeout(() => {
              this.startNewRound()
            }, 500)
          }
        }

        return isCorrect
      },

      updateSettings(updates: Partial<{
        numberOfItems: number
        announceChoices: boolean
        announceCorrectness: boolean
      }>) {
        Object.assign(self.settings, updates)
      },

      setPracticeMode(mode: "sequential" | "random" | "adaptive") {
        self.practiceMode = mode
      },

      setError,

      loadPersistedStats(stats: { 
        allTimeAttempts: number
        allTimeCorrectAnswers: number
        totalSessions: number
        sessionHistory: any[]
      }) {
        self.allTimeAttempts = stats.allTimeAttempts
        self.allTimeCorrectAnswers = stats.allTimeCorrectAnswers
        self.totalSessions = stats.totalSessions
        if (stats.sessionHistory) {
          self.sessionHistory.replace(stats.sessionHistory)
        }
      },

      recordCorrectAttempt() {
        self.totalAttempts += 1
        self.correctAnswers += 1
        this.generateNewRound()
      },

      recordIncorrectAttempt() {
        self.totalAttempts += 1
        this.generateNewRound()
      }
    }
  }) 