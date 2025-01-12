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
    currentObjectIndex: types.optional(types.number, -1),
    isSessionActive: types.optional(types.boolean, false),
  })
  .views(self => ({
    get currentObject() {
      return self.currentObjectIndex >= 0 ? self.objects[self.currentObjectIndex] : undefined
    },
    get currentScore() {
      return self.objects.reduce((sum, obj) => sum + obj.correctAttempts, 0)
    },
    get accuracy() {
      const totalAttempts = self.objects.reduce((sum, obj) => sum + obj.attempts, 0)
      if (totalAttempts === 0) return 0
      return Math.round((self.currentScore / totalAttempts) * 100)
    }
  }))
  .actions(self => ({
    resetScores() {
      self.objects.forEach(obj => {
        obj.attempts = 0
        obj.correctAttempts = 0
      })
    },
    startSession() {
      self.isSessionActive = true
      self.currentObjectIndex = Math.floor(Math.random() * self.objects.length)
    },
    endSession() {
      self.isSessionActive = false
      self.currentObjectIndex = -1
      self.resetScores()
    },
    nextObject() {
      if (self.objects.length <= 1) return
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * self.objects.length)
      } while (nextIndex === self.currentObjectIndex)
      self.currentObjectIndex = nextIndex
    },
    markAttempt(id: string, correct: boolean) {
      const object = self.objects.find(obj => obj.id === id)
      if (object) {
        object.attempts += 1
        if (correct) {
          object.correctAttempts += 1
        }
      }
    }
  }))

export interface ObjectStore extends Instance<typeof ObjectStoreModel> {}
export interface ObjectStoreSnapshot extends SnapshotOut<typeof ObjectStoreModel> {} 