import { Instance, types } from "mobx-state-tree"

export const ObjectModel = types
  .model("Object")
  .props({
    id: types.identifier,
    name: types.string,
    uri: types.union(types.string, types.frozen()),
    pronunciation: types.optional(types.string, ""),
    tags: types.optional(types.array(types.string), []),
    difficulty: types.optional(types.enumeration(["easy", "medium", "hard"]), "medium"),
    category: types.optional(types.string, ""),
    notes: types.optional(types.string, ""),
    isDefault: types.optional(types.boolean, false),
    practiceMode: types.optional(
      types.enumeration(["sequential", "random", "adaptive"]),
      "sequential"
    ),
    isActive: types.optional(types.boolean, true),
    lastModified: types.optional(types.number, 0),
    syncStatus: types.optional(
      types.enumeration(["synced", "pending", "conflict"]),
      "synced"
    ),
    version: types.optional(types.number, 1),
    isLocal: types.optional(types.boolean, false),
    metadata: types.optional(types.model({
      attempts: types.optional(types.number, 0),
      correctAttempts: types.optional(types.number, 0),
      lastPracticed: types.maybe(types.Date),
      successRate: types.optional(types.number, 0)
    }), {})
  })
  .views(self => ({
    get successRate() {
      return self.metadata.attempts > 0 
        ? (self.metadata.correctAttempts / self.metadata.attempts) * 100 
        : 0
    }
  }))
  .actions(self => ({
    markForSync() {
      self.syncStatus = "pending"
      self.lastModified = Date.now()
      self.version += 1
    },
    markAsSynced() {
      self.syncStatus = "synced"
    },
    markAsConflict() {
      self.syncStatus = "conflict"
    },
    updateMetadata(correct: boolean) {
      self.metadata.attempts += 1
      if (correct) {
        self.metadata.correctAttempts += 1
      }
      self.metadata.lastPracticed = new Date()
      self.metadata.successRate = self.successRate
      self.lastModified = Date.now()
    }
  }))

export interface Object extends Instance<typeof ObjectModel> {} 