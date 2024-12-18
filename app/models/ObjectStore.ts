import { Instance, SnapshotOut, types } from "mobx-state-tree"
import AsyncStorage from "@react-native-async-storage/async-storage"

const STORAGE_KEY = "CLEARSAY_OBJECTS"

export interface PhotoItem {
  id: string
  uri: string
  name: string
  attempts: number
  correctAttempts: number
}

const PhotoItemModel = types.model("PhotoItem", {
  id: types.identifier,
  uri: types.string,
  name: types.string,
  attempts: types.optional(types.number, 0),
  correctAttempts: types.optional(types.number, 0),
})

export const ObjectStoreModel = types
  .model("ObjectStore")
  .props({
    objects: types.array(PhotoItemModel),
    currentObjectId: types.maybe(types.string),
    isSessionActive: types.optional(types.boolean, false),
    currentScore: types.optional(types.number, 0),
    totalAttempts: types.optional(types.number, 0),
    lastAttemptCorrect: types.optional(types.maybe(types.boolean), undefined),
  })
  .views((self) => ({
    get currentObject() {
      return self.currentObjectId 
        ? self.objects.find(obj => obj.id === self.currentObjectId)
        : undefined
    },
    get accuracy() {
      if (self.totalAttempts === 0) return 0
      return Math.round((self.currentScore / self.totalAttempts) * 100)
    },
    get remainingObjects() {
      return self.objects.filter(obj => obj.id !== self.currentObjectId)
    }
  }))
  .actions((self) => ({
    setObjects(objects: PhotoItem[]) {
      self.objects.replace(objects)
    },

    addObject(object: PhotoItem) {
      self.objects.push(object)
      this.saveObjects()
    },

    removeObject(id: string) {
      self.objects.replace(self.objects.filter(obj => obj.id !== id))
      this.saveObjects()
    },

    reset() {
      self.objects.clear()
      self.currentObjectId = undefined
      self.isSessionActive = false
      self.currentScore = 0
      self.totalAttempts = 0
      self.lastAttemptCorrect = undefined
    },

    startSession() {
      if (self.objects.length === 0) return false
      self.isSessionActive = true
      self.currentScore = 0
      self.totalAttempts = 0
      self.lastAttemptCorrect = undefined
      this.generateNewObject()
      return true
    },

    endSession() {
      self.isSessionActive = false
      self.currentObjectId = undefined
      self.lastAttemptCorrect = undefined
    },

    generateNewObject() {
      const remainingObjects = self.remainingObjects
      if (remainingObjects.length === 0) {
        // If no more objects, reshuffle by clearing current
        self.currentObjectId = undefined
        return this.generateNewObject()
      }
      
      const randomIndex = Math.floor(Math.random() * remainingObjects.length)
      self.currentObjectId = remainingObjects[randomIndex].id
      self.lastAttemptCorrect = undefined
    },

    markAttempt(objectId: string, correct: boolean) {
      const object = self.objects.find(obj => obj.id === objectId)
      if (object) {
        object.attempts += 1
        if (correct) object.correctAttempts += 1
      }
      
      self.totalAttempts += 1
      if (correct) self.currentScore += 1
      self.lastAttemptCorrect = correct
      
      this.saveObjects()
    },

    async loadObjects() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (stored) {
          const objects = JSON.parse(stored)
          this.setObjects(objects)
          console.log('Objects loaded:', objects.length)
        }
      } catch (error) {
        console.error('Error loading objects:', error)
      }
    },

    async saveObjects() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(self.objects.toJSON()))
        console.log('Objects saved:', self.objects.length)
      } catch (error) {
        console.error('Error saving objects:', error)
      }
    },
  }))

export interface ObjectStore extends Instance<typeof ObjectStoreModel> {}
export interface ObjectStoreSnapshot extends SnapshotOut<typeof ObjectStoreModel> {} 