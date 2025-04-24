import { Instance, types } from "mobx-state-tree"
import * as storage from "app/utils/storage"
import { defaultImages } from "./ObjectStore"

const SetObjectModel = types
  .model("SetObject")
  .props({
    id: types.string,
    order: types.optional(types.number, 0)
  })

export const ObjectSetStore = types
  .model("ObjectSetStore")
  .props({
    sets: types.array(types.model({
      id: types.identifier,
      name: types.string,
      description: types.optional(types.string, ""),
      category: types.optional(types.string, ""),
      tags: types.optional(types.array(types.string), []),
      objects: types.array(SetObjectModel),
      settings: types.optional(
        types.model({
          isActive: types.optional(types.boolean, false),
          isDefault: types.optional(types.boolean, false),
          practiceMode: types.optional(
            types.enumeration(["sequential", "random", "adaptive"]),
            "random"
          )
        }),
        {}
      ),
      dateCreated: types.optional(types.Date, () => new Date()),
      dateModified: types.optional(types.Date, () => new Date())
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
      return self.sets.filter(set => set.settings.isActive)
    },
    getSetsByCategory(category: string) {
      return self.sets.filter(set => set.category === category)
    },
    getSetsByTag(tag: string) {
      return self.sets.filter(set => set.tags.includes(tag))
    }
  }))
  .actions(self => ({
    replaceSets(newSets: any[]) {
      self.sets.replace(newSets)
    },
    addSet(setData: {
      id: string
      name: string
      description?: string
      category?: string
      tags?: string[]
      objects?: { id: string; order?: number }[]
      settings?: {
        isActive?: boolean
        isDefault?: boolean
        practiceMode?: "sequential" | "random" | "adaptive"
      }
    }) {
      const newSet = {
        ...setData,
        description: setData.description || "",
        category: setData.category || "",
        tags: setData.tags || [],
        objects: (setData.objects || []).map((obj, index) => ({
          id: obj.id,
          order: obj.order ?? index
        })),
        settings: {
          isActive: setData.settings?.isActive ?? false,
          isDefault: setData.settings?.isDefault ?? false,
          practiceMode: setData.settings?.practiceMode ?? "random"
        },
        dateCreated: new Date(),
        dateModified: new Date()
      }
      self.sets.push(newSet)
      this.saveSets()
    },
    updateSet(
      id: string,
      updates: {
        name?: string
        description?: string
        category?: string
        tags?: string[]
        settings?: {
          isActive?: boolean
          isDefault?: boolean
          practiceMode?: "sequential" | "random" | "adaptive"
        }
      }
    ) {
      const set = self.getSetById(id)
      if (set) {
        Object.assign(set, {
          ...updates,
          dateModified: new Date()
        })
        this.saveSets()
      }
    },
    addObjectToSet(setId: string, objectId: string, order?: number) {
      const set = self.getSetById(setId)
      if (set) {
        const maxOrder = Math.max(...set.objects.map(obj => obj.order), -1)
        set.objects.push({
          id: objectId,
          order: order ?? maxOrder + 1
        })
        set.dateModified = new Date()
        this.saveSets()
      }
    },
    removeObjectFromSet(setId: string, objectId: string) {
      const set = self.getSetById(setId)
      if (set) {
        const filteredObjects = set.objects.filter(obj => obj.id !== objectId)
        set.objects.replace(filteredObjects)
        set.dateModified = new Date()
        this.saveSets()
      }
    },
    reorderObjects(setId: string, objectIds: string[]) {
      const set = self.getSetById(setId)
      if (set) {
        const newObjects = objectIds.map((id, index) => ({
          id,
          order: index
        }))
        set.objects.replace(newObjects)
        set.dateModified = new Date()
        this.saveSets()
      }
    },
    async saveSets() {
      try {
        await storage.save("objectSets", self.sets.toJSON())
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
            objects: defaultObjectIds.map((id, index) => ({
              id,
              order: index
            })),
            settings: {
              isActive: false,
              isDefault: true,
              practiceMode: "random"
            }
          })
        }
      } catch (error) {
        console.error('Error loading object sets:', error)
      }
    }
  }))

export interface ObjectSetStore extends Instance<typeof ObjectSetStore> {}