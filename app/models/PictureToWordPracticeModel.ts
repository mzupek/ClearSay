import { Instance, types } from "mobx-state-tree"
import { ObjectModel } from "./ObjectModel"
import { ObjectSetModel } from "./ObjectSetModel"
import * as storage from "app/utils/storage"

const STORAGE_KEY = "pictureToWordPractice"

const WordChoice = types.model("WordChoice", {
  word: types.string,
  isCorrect: types.boolean,
  isMatched: types.optional(types.boolean, false),
  matchedToId: types.maybeNull(types.string)
})

export const PictureToWordPracticeModel = types
  .model("PictureToWordPractice")
  .props({
    isActive: types.optional(types.boolean, false),
    assignedSets: types.array(types.reference(ObjectSetModel)),
    currentObjects: types.array(types.reference(ObjectModel)),
    wordChoices: types.array(WordChoice),
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
    let disposer: (() => void) | undefined

    function setError(message: string | null) {
      self.error = message
    }

    function generateNewQuestion() {
      const objects = self.availableObjects
      if (objects.length < 3) {
        setError("Not enough objects available for practice")
        return false
      }

      // Select 3 random objects for practice
      const shuffledObjects = [...objects].sort(() => Math.random() - 0.5)
      const selectedObjects = shuffledObjects.slice(0, 3)
      
      // Create word choices from selected objects
      const choices = selectedObjects.map(obj => ({
        word: obj.name,
        isCorrect: true,
        isMatched: false,
        matchedToId: null
      }))

      // Shuffle the word choices
      const shuffledChoices = [...choices].sort(() => Math.random() - 0.5)

      self.currentObjects.replace(selectedObjects)
      self.wordChoices.replace(shuffledChoices)
      setError(null)
      return true
    }

    const saveToStorage = async () => {
      try {
        const data = {
          assignedSets: self.assignedSets.map(set => set.id),
          settings: self.settings,
          practiceMode: self.practiceMode
        }
        await storage.save(STORAGE_KEY, data)
      } catch (error) {
        console.error("Error saving practice data:", error)
      }
    }

    const loadFromStorage = async () => {
      try {
        const data = await storage.load(STORAGE_KEY)
        if (data) {
          // Restore assigned sets
          const assignedSetIds = data.assignedSets || []
          const validSets = assignedSetIds.filter((id: string) => 
            self.assignedSets.find(set => set.id === id)
          )
          self.assignedSets.replace(validSets)

          // Restore settings
          if (data.settings) {
            Object.assign(self.settings, data.settings)
          }

          // Restore practice mode
          if (data.practiceMode) {
            self.practiceMode = data.practiceMode
          }
        }
      } catch (error) {
        console.error("Error loading practice data:", error)
      }
    }

    return {
      afterCreate() {
        loadFromStorage()
      },

      beforeDestroy() {
        if (disposer) {
          disposer()
        }
      },

      setAssignedSets(sets: Instance<typeof ObjectSetModel>[]) {
        self.assignedSets.replace(sets)
        saveToStorage()
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
        self.currentObjects.clear()
        self.wordChoices.clear()
        setError(null)
        return generateNewQuestion()
      },

      endSession() {
        self.isActive = false
        self.currentObjects.clear()
        self.wordChoices.clear()
        setError(null)
      },

      recordAnswer(wasCorrect: boolean) {
        self.totalAttempts += 1
        if (wasCorrect) {
          self.correctAnswers += 1
        }
      },

      matchWord(wordId: string, objectId: string) {
        const wordChoice = self.wordChoices.find(w => w.word === wordId)
        const targetObject = self.currentObjects.find(obj => obj.id === objectId)
        
        if (wordChoice && targetObject) {
          const isCorrect = targetObject.name === wordChoice.word
          wordChoice.isMatched = true
          wordChoice.matchedToId = objectId
          return isCorrect
        }
        return false
      },

      updateSettings(updates: Partial<{
        numberOfChoices: number
        announceChoices: boolean
        announceCorrectness: boolean
      }>) {
        Object.assign(self.settings, updates)
        saveToStorage()
      },

      setPracticeMode(mode: "sequential" | "random" | "adaptive") {
        self.practiceMode = mode
        saveToStorage()
      },

      assignSet(set: Instance<typeof ObjectSetModel>) {
        if (!self.assignedSets.includes(set)) {
          self.assignedSets.push(set)
          saveToStorage()
        }
      },

      unassignSet(set: Instance<typeof ObjectSetModel>) {
        const index = self.assignedSets.findIndex(s => s === set)
        if (index !== -1) {
          self.assignedSets.splice(index, 1)
          saveToStorage()
        }
      }
    }
  }) 