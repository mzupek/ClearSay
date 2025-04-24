import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { ObjectModel } from "./ObjectModel"
import { ObjectSetModel } from "./ObjectSetModel"
import { NavigationContainerRef } from "@react-navigation/native"
import { defaultImages } from "./ObjectStore"
import { PracticeStoreModel } from "./PracticeStore"
import { SettingsStoreModel } from "./SettingsStore"

export const PracticeSessionModel = types
  .model("PracticeSessionModel", {
    isActive: types.optional(types.boolean, false),
    currentObjectId: types.maybe(types.string),
    currentSetId: types.maybe(types.string),
    correctAnswers: types.optional(types.number, 0),
    totalAttempts: types.optional(types.number, 0),
  })
  .views((self) => ({
    get score() {
      return {
        correct: self.correctAnswers,
        total: self.totalAttempts,
      }
    },
  }))
  .actions((self) => ({
    startSession(setId: string, objectId: string) {
      self.isActive = true
      self.currentSetId = setId
      self.currentObjectId = objectId
      self.correctAnswers = 0
      self.totalAttempts = 0
    },
    endSession() {
      self.isActive = false
      self.currentSetId = undefined
      self.currentObjectId = undefined
    },
    recordAnswer(correct: boolean) {
      self.totalAttempts += 1
      if (correct) self.correctAnswers += 1
    },
    setCurrentObject(objectId: string) {
      self.currentObjectId = objectId
    },
  }))

/**
 * A RootStore model.
 */
export const RootStoreModel = types
  .model("RootStore")
  .props({
    objects: types.array(ObjectModel),
    objectSets: types.array(ObjectSetModel),
    currentObjectSet: types.maybeNull(types.reference(ObjectSetModel)),
    currentObject: types.maybeNull(types.reference(ObjectModel)),
    navigationRef: types.maybe(types.frozen<NavigationContainerRef<any>>()),
    currentUser: types.maybe(types.frozen()),
    practiceSession: types.optional(PracticeSessionModel, {}),
    practiceStore: types.optional(PracticeStoreModel, {}),
    settingsStore: types.optional(SettingsStoreModel, {
      selectedVoiceId: "",
      selectedVoiceName: "",
      availableVoices: []
    })
  })
  .views((self) => ({
    get objectList() {
      return self.objects
    },
    get setList() {
      return self.objectSets
    },
    get activeSets() {
      return self.objectSets.filter((set) => set.isActive)
    }
  }))
  .actions((self) => ({
    afterCreate() {
      this.setupDefaultData()
    },
    setupDefaultData() {
      // Add default objects first
      const defaultObjectIds = defaultImages.objects.map((obj, index) => {
        const newObject = this.addObject({
          name: obj.name,
          uri: obj.uri,
          category: obj.category,
          isDefault: true,
          id: `default_${index + 1}` // Use the same IDs as defined in defaultImages
        })
        return newObject.id
      })

      // Create default set with object references
      if (self.objectSets.length === 0) {
        const defaultSet = this.addObjectSet({
          name: "Default Objects",
          description: "A collection of common objects for practice",
          isDefault: true,
          practiceMode: "sequential",
          isActive: true,
          objects: []
        })

        // Add objects to set after creation
        defaultObjectIds.forEach(id => {
          this.addObjectToSet(defaultSet.id, id)
        })
      }
    },
    setCurrentObjectSet(objectSet: Instance<typeof ObjectSetModel> | null) {
      self.currentObjectSet = objectSet
    },
    setCurrentObject(object: Instance<typeof ObjectModel> | null) {
      self.currentObject = object
    },
    setNavigationRef(ref: NavigationContainerRef<any>) {
      self.navigationRef = ref
    },
    setCurrentUser(user: any | null) {
      self.currentUser = user
    },
    addObject(object: Omit<SnapshotIn<typeof ObjectModel>, "id"> & { id?: string }) {
      const newObject = ObjectModel.create({
        id: object.id || String(Date.now()),
        ...object
      })
      self.objects.push(newObject)
      return newObject
    },
    updateObject(id: string, updates: Partial<SnapshotIn<typeof ObjectModel>>) {
      const object = self.objects.find(obj => obj.id === id)
      if (object) {
        Object.assign(object, updates)
      }
    },
    removeObject(id: string) {
      const index = self.objects.findIndex(obj => obj.id === id)
      if (index !== -1) {
        self.objects.splice(index, 1)
      }
    },
    addObjectSet(set: Omit<SnapshotIn<typeof ObjectSetModel>, "id">) {
      const newSet = ObjectSetModel.create({
        id: String(Date.now()),
        ...set
      })
      self.objectSets.push(newSet)
      return newSet
    },
    updateObjectSet(id: string, updates: Partial<SnapshotIn<typeof ObjectSetModel>>) {
      const set = self.objectSets.find(s => s.id === id)
      if (set) {
        Object.assign(set, updates)
      }
    },
    removeObjectSet(id: string) {
      const index = self.objectSets.findIndex(s => s.id === id)
      if (index !== -1) {
        self.objectSets.splice(index, 1)
      }
    },
    addObjectToSet(setId: string, objectId: string) {
      const set = self.objectSets.find(s => s.id === setId)
      if (set) {
        set.addObject(objectId)
      }
    },
    removeObjectFromSet(setId: string, objectId: string) {
      const set = self.objectSets.find(s => s.id === setId)
      if (set) {
        set.removeObject(objectId)
      }
    },
    reorderObjectsInSet(setId: string, objectIds: string[]) {
      const set = self.objectSets.find(s => s.id === setId)
      if (set) {
        set.reorderObjects(objectIds)
      }
    }
  }))

export interface RootStore extends Instance<typeof RootStoreModel> {}
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
export interface RootStoreSnapshotIn extends SnapshotIn<typeof RootStoreModel> {}