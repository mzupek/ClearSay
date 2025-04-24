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
    isLocal: types.optional(types.boolean, false)
  })
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
    }
  }))

export interface Object extends Instance<typeof ObjectModel> {} 