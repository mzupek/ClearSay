import { Instance, types } from "mobx-state-tree"
import * as storage from "app/utils/storage"

export const ObjectStore = types
  .model("ObjectStore")
  .props({
    objects: types.array(types.model({
      id: types.identifier,
      name: types.string,
      uri: types.string,
      attempts: types.optional(types.number, 0),
      correctAttempts: types.optional(types.number, 0),
    }))
  })
  .views(self => ({
    get objectList() {
      return self.objects.slice()
    }
  }))
  .actions(self => ({
    addObject(object: { id: string; name: string; uri: string; attempts?: number; correctAttempts?: number }) {
      const newObject = {
        ...object,
        attempts: object.attempts || 0,
        correctAttempts: object.correctAttempts || 0,
      }
      self.objects.push(newObject)
      this.saveObjects()
    },
    removeObject(id: string) {
      const index = self.objects.findIndex(obj => obj.id === id)
      if (index !== -1) {
        self.objects.splice(index, 1)
        this.saveObjects()
      }
    },
    async saveObjects() {
      try {
        await storage.save("objects", self.objectList)
      } catch (error) {
        console.error('Error saving objects:', error)
      }
    },
    replaceObjects(newObjects: Array<any>) {
      self.objects.replace(newObjects)
    },
    async loadObjects() {
      try {
        const savedObjects = await storage.load("objects") || []
        if (savedObjects.length > 0) {
          self.replaceObjects(savedObjects)
        }
      } catch (error) {
        console.error('Error loading objects:', error)
      }
    },
    startSession() {
      return {
        objects: self.objects.slice(),
        currentIndex: 0
      }
    }
  }))

export interface ObjectStore extends Instance<typeof ObjectStore> {}