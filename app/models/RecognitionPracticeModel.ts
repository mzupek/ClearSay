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
      if (self.isTransitioning) return false

      if (self.availableObjectPool.length < 3) {
        const allObjects = self.availableObjects
        if (allObjects.length === 0) {
          return false
        }
        self.availableObjectPool.replace([...allObjects].sort(() => Math.random() - 0.5))
      }

      const selectedObjects = self.availableObjectPool.slice(0, 3)
      
      self.availableObjectPool.replace([
        ...self.availableObjectPool.slice(3),
        ...selectedObjects
      ])

      self.wordChoices.clear()
      self.currentObjects.clear()

      self.currentObjects.replace(selectedObjects)

      const choices = selectedObjects.map(obj => ({
        id: obj.id,
        word: obj.name,
        isMatched: false,
        matchedToId: undefined,
        wasCorrectMatch: false
      })).sort(() => Math.random() - 0.5)

      self.wordChoices.replace(choices)
      setError(null)
      return true
    }

    return {
      setAssignedSets(sets: Instance<typeof ObjectSetModel>[]) {
        self.assignedSets.replace(sets)
      },

      generateNewRound() {
        if (self.isTransitioning) return false

        if (self.availableObjectPool.length < 3) {
          const allObjects = self.availableObjects
          if (allObjects.length === 0) {
            return false
          }
          self.availableObjectPool.replace([...allObjects].sort(() => Math.random() - 0.5))
        }

        const selectedObjects = self.availableObjectPool.slice(0, 3)
        
        self.availableObjectPool.replace([
          ...self.availableObjectPool.slice(3),
          ...selectedObjects
        ])

        self.wordChoices.clear()
        self.currentObjects.clear()

        self.currentObjects.replace(selectedObjects)

        const choices = selectedObjects.map(obj => ({
          id: obj.id,
          word: obj.name,
          isMatched: false,
          matchedToId: undefined,
          wasCorrectMatch: false
        })).sort(() => Math.random() - 0.5)

        self.wordChoices.replace(choices)
        setError(null)
        return true
      },

      skipCurrentRound() {
        if (!self.isTransitioning) {
          this.startTransition()
          transitionTimer = setTimeout(() => {
            this.completeTransition()
          }, 500) // Faster transition for skips
        }
      },

      startSession() {
        if (self.assignedSets.length === 0) {
          setError("No object sets assigned for practice")
          return false
        }
        
        const objects = self.availableObjects
        if (objects.length === 0) {
          setError("Not enough objects available for practice")
          return false
        }

        self.availableObjectPool.replace([...objects].sort(() => Math.random() - 0.5))
        self.isActive = true
        self.correctAnswers = 0
        self.totalAttempts = 0
        self.totalSessions += 1
        setError(null)
        return this.generateNewRound()
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

      startTransition() {
        if (self.isTransitioning) return
        self.isTransitioning = true
      },

      completeTransition() {
        const success = this.generateNewRound()
        if (success) {
          self.isTransitioning = false
        } else {
          this.endSession()
        }
      },

      tryMatch(wordId: string, objectId: string) {
        const wordChoice = self.wordChoices.find(w => w.id === wordId)
        if (!wordChoice || wordChoice.isMatched) return false

        self.totalAttempts += 1
        const isCorrect = wordChoice.id === objectId

        if (isCorrect) {
          wordChoice.isMatched = true
          wordChoice.matchedToId = objectId
          wordChoice.wasCorrectMatch = true
          self.correctAnswers += 1

          const object = self.currentObjects.find(obj => obj.id === objectId)
          if (object) {
            object.updateMetadata(true)
          }

          const allMatchesComplete = self.wordChoices.every(w => w.isMatched)

          if (allMatchesComplete && !self.isTransitioning) {
            this.startTransition()
            transitionTimer = setTimeout(() => {
              this.completeTransition()
            }, 1000)
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