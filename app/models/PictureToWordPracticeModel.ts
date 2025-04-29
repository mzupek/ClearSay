import { Instance, types } from "mobx-state-tree"
import { ObjectModel } from "./ObjectModel"
import { ObjectSetModel } from "./ObjectSetModel"

export const PictureToWordPracticeModel = types
  .model("PictureToWordPractice")
  .props({
    isActive: types.optional(types.boolean, false),
    assignedSets: types.array(types.reference(ObjectSetModel)),
    currentObject: types.maybeNull(types.reference(ObjectModel)),
    wordChoices: types.array(types.model({
      word: types.string,
      isCorrect: types.boolean
    })),
    correctAnswers: types.optional(types.number, 0),
    totalAttempts: types.optional(types.number, 0),
    settings: types.optional(types.model({
      numberOfChoices: types.optional(types.number, 3),
      announceChoices: types.optional(types.boolean, true),
      announceCorrectness: types.optional(types.boolean, true)
    }), {}),
    error: types.maybeNull(types.string),
    practiceMode: types.optional(
      types.enumeration(["sequential", "random", "adaptive"]),
      "random"
    )
  })
  .views((self) => ({
    get accuracy() {
      if (self.totalAttempts === 0) return 0
      return Math.round((self.correctAnswers / self.totalAttempts) * 100)
    },
    get availableObjects() {
      // Combine all objects from assigned sets
      const objects = new Set<Instance<typeof ObjectModel>>()
      self.assignedSets.forEach(set => {
        set.objects.forEach(obj => objects.add(obj))
      })
      return Array.from(objects)
    }
  }))
  .actions((self) => {
    function setError(message: string | null) {
      self.error = message
    }

    function generateNewQuestion() {
      const objects = self.availableObjects
      if (objects.length < 3) {
        setError("Not enough objects available for practice")
        return false
      }

      // Select object based on practice mode
      let targetObject: Instance<typeof ObjectModel>
      if (self.practiceMode === "sequential") {
        // In sequential mode, try to pick the next unpracticed object
        targetObject = objects.find(obj => !obj.metadata?.lastPracticed) || objects[0]
      } else if (self.practiceMode === "adaptive") {
        // In adaptive mode, prefer objects with lower success rates
        targetObject = objects.reduce((lowest, current) => 
          (current.metadata?.successRate || 0) < (lowest.metadata?.successRate || 0) ? current : lowest
        )
      } else {
        // In random mode or fallback, select randomly
        const targetIndex = Math.floor(Math.random() * objects.length)
        targetObject = objects[targetIndex]
      }

      self.currentObject = targetObject

      // Generate word choices
      const otherObjects = objects.filter(obj => obj !== targetObject)
      const shuffledObjects = [...otherObjects].sort(() => Math.random() - 0.5)
      const incorrectChoices = shuffledObjects.slice(0, self.settings.numberOfChoices - 1)

      // Create and shuffle all choices
      const choices = [
        { word: targetObject.name, isCorrect: true },
        ...incorrectChoices.map(obj => ({ word: obj.name, isCorrect: false }))
      ].sort(() => Math.random() - 0.5)

      self.wordChoices.replace(choices)
      setError(null)
      return true
    }

    return {
      setAssignedSets(sets: Instance<typeof ObjectSetModel>[]) {
        self.assignedSets.replace(sets)
      },

      generateNewQuestion,
      setError,

      startSession() {
        if (self.assignedSets.length === 0) {
          setError("No object sets assigned for practice")
          return false
        }
        
        const objects = self.availableObjects
        if (objects.length < 3) {
          setError("Not enough objects available for practice")
          return false
        }

        self.isActive = true
        self.correctAnswers = 0
        self.totalAttempts = 0
        setError(null)
        return generateNewQuestion()
      },

      endSession() {
        self.isActive = false
        self.currentObject = null
        self.wordChoices.clear()
        setError(null)
      },

      recordAnswer(wasCorrect: boolean) {
        self.totalAttempts += 1
        if (wasCorrect) {
          self.correctAnswers += 1
        }
        if (self.currentObject) {
          self.currentObject.updateMetadata(wasCorrect)
        }
      },

      updateSettings(updates: Partial<{
        numberOfChoices: number
        announceChoices: boolean
        announceCorrectness: boolean
      }>) {
        Object.assign(self.settings, updates)
      },

      setPracticeMode(mode: "sequential" | "random" | "adaptive") {
        self.practiceMode = mode
      }
    }
  }) 