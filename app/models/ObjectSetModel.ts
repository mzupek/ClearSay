import { Instance, types } from "mobx-state-tree"
import { ObjectModel } from "./ObjectModel"

export const ObjectSetModel = types
  .model("ObjectSet")
  .props({
    id: types.identifier,
    name: types.string,
    description: types.optional(types.string, ""),
    category: types.optional(types.string, ""),
    objects: types.array(types.reference(ObjectModel)),
    isDefault: types.optional(types.boolean, false),
    practiceMode: types.optional(
      types.enumeration(["sequential", "random", "adaptive"]),
      "sequential"
    ),
    isLocal: types.optional(types.boolean, false),
    isActive: types.optional(types.boolean, false),
    lastModified: types.optional(types.number, 0),
    syncStatus: types.optional(
      types.enumeration(["synced", "pending", "conflict", "local"]),
      "synced"
    ),
    version: types.optional(types.number, 1),
    temporaryCode: types.maybe(types.string) // For QR code scanning
  })
  .views(self => ({
    get objectIds() {
      return self.objects.map(obj => obj.id)
    }
  }))
  .actions(self => ({
    addObject(objectId: string) {
      if (!self.objects.find(obj => obj.id === objectId)) {
        self.objects.push(objectId)
      }
    },
    removeObject(objectId: string) {
      const index = self.objects.findIndex(obj => obj.id === objectId)
      if (index !== -1) {
        self.objects.splice(index, 1)
      }
    },
    reorderObjects(objectIds: string[]) {
      self.objects.replace(objectIds)
    },
    toggleActive() {
      self.isActive = !self.isActive
    },
    markForSync() {
      if (!self.isLocal) {
        self.syncStatus = "pending"
        self.lastModified = Date.now()
        self.version += 1
      }
    },
    markAsSynced() {
      if (!self.isLocal) {
        self.syncStatus = "synced"
      }
    },
    markAsConflict() {
      if (!self.isLocal) {
        self.syncStatus = "conflict"
      }
    },
    setTemporaryCode(code: string) {
      self.temporaryCode = code
    },
    clearTemporaryCode() {
      self.temporaryCode = undefined
    }
  }))

export interface ObjectSet extends Instance<typeof ObjectSetModel> {} 