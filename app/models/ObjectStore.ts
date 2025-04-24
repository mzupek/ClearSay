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

export const ObjectModel = types
  .model("Object")
  .props({
    id: types.identifier,
    name: types.string,
    uri: types.frozen(),
    pronunciation: types.optional(types.string, ""),
    tags: types.optional(types.array(types.string), []),
    difficulty: types.optional(
      types.enumeration(["easy", "medium", "hard"]), 
      "medium"
    ),
    category: types.optional(types.string, ""),
    notes: types.optional(types.string, ""),
    dateCreated: types.optional(types.Date, () => new Date()),
    dateModified: types.optional(types.Date, () => new Date()),
    metadata: types.optional(
      types.model({
        attempts: types.optional(types.number, 0),
        correctAttempts: types.optional(types.number, 0),
        lastPracticed: types.maybe(types.Date)
      }),
      {}
    ),
    isDefault: types.optional(types.boolean, false)
  })
  .views(self => ({
    get successRate() {
      return self.metadata.attempts > 0 
        ? (self.metadata.correctAttempts / self.metadata.attempts) * 100 
        : 0
    }
  }))
  .actions(self => ({
    updateMetadata(correct: boolean) {
      self.metadata.attempts += 1
      if (correct) self.metadata.correctAttempts += 1
      self.metadata.lastPracticed = new Date()
      self.dateModified = new Date()
    },
    updateDetails(details: {
      name?: string
      pronunciation?: string
      tags?: string[]
      difficulty?: "easy" | "medium" | "hard"
      category?: string
      notes?: string
    }) {
      Object.assign(self, {
        ...details,
        dateModified: new Date()
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
      return self.objects.slice()
    }
  }))
  .actions(self => ({
    replaceObjects(newObjects: any[]) {
      self.objects.replace(newObjects)
    },
    addObject(object: { 
      id: string
      name: string
      uri: any
      pronunciation?: string
      tags?: string[]
      difficulty?: "easy" | "medium" | "hard"
      category?: string
      notes?: string
      isDefault?: boolean 
    }) {
      const newObject = {
        ...object,
        pronunciation: object.pronunciation || "",
        tags: object.tags || [],
        difficulty: object.difficulty || "medium",
        category: object.category || "",
        notes: object.notes || "",
        metadata: {
          attempts: 0,
          correctAttempts: 0
        },
        isDefault: object.isDefault || false,
        dateCreated: new Date(),
        dateModified: new Date()
      }
      self.objects.push(newObject)
      this.saveObjects()
    },
    updateObject(
      id: string,
      updates: {
        name?: string
        pronunciation?: string
        tags?: string[]
        difficulty?: "easy" | "medium" | "hard"
        category?: string
        notes?: string
      }
    ) {
      const object = self.objects.find(obj => obj.id === id)
      if (object) {
        object.updateDetails(updates)
        this.saveObjects()
      }
    },
    removeObject(id: string) {
      const index = self.objects.findIndex(obj => obj.id === id)
      if (index !== -1) {
        self.objects.splice(index, 1)
        this.saveObjects()
      }
    },
    updateObjectScore(id: string, correct: boolean) {
      const object = self.objects.find(obj => obj.id === id)
      if (object) {
        object.updateMetadata(correct)
        this.saveObjects()
      }
    },
    async saveObjects() {
      try {
        await storage.save("objects", self.objects.toJSON())
      } catch (error) {
        console.error('Error saving objects:', error)
      }
    },
    async loadObjects() {
      try {
        const savedObjects = await storage.load("objects")
        if (savedObjects && savedObjects.length > 0) {
          this.replaceObjects(savedObjects)
        } else {
          // Load default images if no saved objects exist
          defaultImages.objects.forEach(obj => {
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
    }
  }))

export interface ObjectStore extends Instance<typeof ObjectStore> {}