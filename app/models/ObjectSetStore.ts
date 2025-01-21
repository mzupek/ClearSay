import { Instance, types } from "mobx-state-tree"

const ObjectModel = types.model("Object", {
  id: types.identifier,
  uri: types.string,
  name: types.string,
  attempts: types.optional(types.number, 0),
  correctAttempts: types.optional(types.number, 0),
})

const ObjectSetModel = types.model("ObjectSet", {
  id: types.identifier,
  name: types.string,
  description: types.string,
  objects: types.array(ObjectModel),
  isActive: types.optional(types.boolean, false),
})

export const ObjectSetStore = types
  .model("ObjectSetStore")
  .props({
    sets: types.array(ObjectSetModel),
  })
  .views(self => ({
    get activeSets() {
      return self.sets.filter(set => set.isActive)
    },
    getSetById(id: string) {
      return self.sets.find(set => set.id === id)
    }
  }))
  .actions(self => ({
    addSet(name: string, description: string) {
      self.sets.push({
        id: Date.now().toString(),
        name,
        description,
        objects: [],
        isActive: true,
      })
    },
    removeSet(id: string) {
      const index = self.sets.findIndex(set => set.id === id)
      if (index !== -1) {
        self.sets.splice(index, 1)
      }
    },
    toggleSetActive(id: string) {
      const set = self.getSetById(id)
      if (set) {
        set.isActive = !set.isActive
      }
    },
    addObjectToSet(setId: string, object: { id: string; uri: string; name: string }) {
      const set = self.getSetById(setId)
      if (set) {
        set.objects.push(object)
      }
    }
  }))

export interface ObjectSetStore extends Instance<typeof ObjectSetStore> {}