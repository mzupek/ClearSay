import { Instance, types } from "mobx-state-tree"
import * as storage from "app/utils/storage"

export const defaultImages = {
  objects: [
    {
      id: "default_1",
      name: "bed",
      uri: require("../../assets/images/defaults/bed.png"),
      category: "furniture",
      isDefault: true
    },
    {
      id: "default_2",
      name: "chair",
      uri: require("../../assets/images/defaults/chair.png"),
      category: "furniture",
      isDefault: true
    },
    {
      id: "default_3",
      name: "purse",
      uri: require("../../assets/images/defaults/purse.png"),
      category: "furniture"
    },
    {
      id: "default_4",
      name: "cup",
      uri: require("../../assets/images/defaults/cup.png"),
      category: "kitchen"
    },
    {
      id: "default_5",
      name: "car",
      uri: require("../../assets/images/defaults/car.png"),
      category: "transport"
    },
    {
      id: "default_6",
      name: "glasses",
      uri: require("../../assets/images/defaults/glasses.png"),
      category: "clothing"
    },
    {
      id: "default_7",
      name: "hat",
      uri: require("../../assets/images/defaults/hat.png"),
      category: "clothing"
    },  
    {
      id: "default_8",
      name: "lamp",
      uri: require("../../assets/images/defaults/lamp.png"),
      category: "home"
    },
    {
      id: "default_9",
      name: "shoe",
      uri: require("../../assets/images/defaults/shoe.png"),
      category: "clothing"
    },
    {
      id: "default_10",
      name: "silverware",
      uri: require("../../assets/images/defaults/silverware.png"),
      category: "kitchen"
    },
    // ... add other default images here
  ]
}

const AttemptModel = types.model("Attempt", {
  timestamp: types.number,
  correct: types.boolean,
  setId: types.string,
  setName: types.string,
})

const ObjectModel = types
  .model("ObjectModel", {
    id: types.identifier,
    name: types.string,
    uri: types.frozen(),
    attempts: types.optional(types.number, 0),
    correctAttempts: types.optional(types.number, 0),
    category: types.optional(types.string, ""),
    isDefault: types.optional(types.boolean, false),
    attemptHistory: types.optional(types.array(AttemptModel), [])
  })
  .actions(self => ({
    addAttempt(correct: boolean, setId: string, setName: string) {
      self.attempts += 1
      if (correct) self.correctAttempts += 1
      self.attemptHistory.push({
        timestamp: Date.now(),
        correct,
        setId,
        setName,
      })
    }
  }))

export const ObjectStore = types
  .model("ObjectStore")
  .props({
    objects: types.array(ObjectModel)
  })
  .views(self => ({
    get objectList() {
      console.log("Current objects:", JSON.stringify(self.objects, null, 2))
      return self.objects.slice()
    }
  }))
  .actions(self => ({
    addObject(object: { id: string; name: string; uri: any; attempts?: number; correctAttempts?: number; category?: string; isDefault?: boolean }) {
      const newObject = {
        ...object,
        attempts: object.attempts || 0,
        correctAttempts: object.correctAttempts || 0,
        category: object.category || "",
        isDefault: object.isDefault || false
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
        console.log('Saving objects:', self.objects.slice())
        await storage.save("objects", self.objects.slice())
      } catch (error) {
        console.error('Error saving objects:', error)
      }
    },
    replaceObjects(newObjects: Array<any>) {
      self.objects.replace(newObjects)
    },
    async loadObjects() {
      try {
        const savedObjects = await storage.load("objects")
        console.log('Loaded objects:', savedObjects)
        if (savedObjects && savedObjects.length > 0) {
          self.replaceObjects(savedObjects)
        } else {
          console.log('Loading default images')
          // Load default images if no saved objects exist
          defaultImages.objects.forEach(obj => {
            console.log('Adding default object:', obj)
            this.addObject({
              ...obj,
              isDefault: true
            })
          })
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
    },
    updateObjectScore(id: string, correct: boolean, setId: string, setName: string) {
      const object = self.objects.find(obj => obj.id === id)
      if (object) {
        object.addAttempt(correct, setId, setName)
        this.saveObjects()
      }
    }
  }))

export interface ObjectStore extends Instance<typeof ObjectStore> {}