import { Instance, types } from "mobx-state-tree"
import * as storage from "app/utils/storage"
import { defaultImages } from "./ObjectStore"

export const ObjectSetStore = types
  .model("ObjectSetStore")
  .props({
    sets: types.array(types.model({
      id: types.identifier,
      name: types.string,
      objectIds: types.array(types.string),
      isActive: types.optional(types.boolean, false),
      isDefault: types.optional(types.boolean, false)
    }))
  })
  .views(self => ({
    get setList() {
      return self.sets.slice()
    },
    getSetById(id: string) {
      return self.sets.find(set => set.id === id)
    },
    get activeSets() {
      return self.sets.filter(set => set.isActive)
    }
  }))
  .actions(self => ({
    replaceSets(newSets: any[]) {
      self.sets.replace(newSets)
    },
    addSet(set: { id: string; name: string; objectIds: string[]; isActive?: boolean; isDefault?: boolean }) {
      const newSet = {
        ...set,
        isActive: set.isActive ?? false,
        isDefault: set.isDefault ?? false
      }
      self.sets.push(newSet)
      this.saveSets()
    },
    removeSet(id: string) {
      const index = self.sets.findIndex(set => set.id === id)
      if (index !== -1 && !self.sets[index].isDefault) {
        self.sets.splice(index, 1)
        this.saveSets()
      }
    },
    toggleSetActive(id: string) {
      const set = self.sets.find(set => set.id === id)
      if (set) {
        set.isActive = !set.isActive
        this.saveSets()
      }
    },
    addObjectToSet(setId: string, objectId: string) {
      const set = self.sets.find(set => set.id === setId)
      if (set && !set.objectIds.includes(objectId)) {
        set.objectIds.push(objectId)
        this.saveSets()
      }
    },
    removeObjectFromSet(setId: string, objectId: string) {
      const set = self.sets.find(set => set.id === setId)
      if (set) {
        const index = set.objectIds.indexOf(objectId)
        if (index !== -1) {
          set.objectIds.splice(index, 1)
          this.saveSets()
        }
      }
    },
    async saveSets() {
      try {
        await storage.save("objectSets", self.setList)
      } catch (error) {
        console.error('Error saving object sets:', error)
      }
    },
    async loadSets() {
      try {
        const savedSets = await storage.load("objectSets")
        if (savedSets && savedSets.length > 0) {
          this.replaceSets(savedSets)
        } else {
          // Create default set with all default objects
          const defaultObjectIds = defaultImages.objects.map(obj => obj.id)
          this.addSet({
            id: "default_set",
            name: "Default Objects",
            objectIds: defaultObjectIds,
            isActive: false,
            isDefault: true
          })
        }
      } catch (error) {
        console.error('Error loading object sets:', error)
      }
    }
  }))

export interface ObjectSetStore extends Instance<typeof ObjectSetStore> {}