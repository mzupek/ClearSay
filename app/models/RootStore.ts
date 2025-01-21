import { Instance, types } from "mobx-state-tree"
import { ObjectStore } from "./ObjectStore"
import { ObjectSetStore } from "./ObjectSetStore"
import { PracticeStore } from "./PracticeStore"
import { SettingsStore } from "./SettingsStore"

/**
 * A RootStore model.
 */
export const RootStore = types
  .model("RootStore")
  .props({
    objectStore: types.optional(ObjectStore, { objects: [] }),
    objectSetStore: types.optional(ObjectSetStore, { sets: [] }),
    practiceStore: types.optional(PracticeStore, {
      isSessionActive: false,
      currentRound: 1,
      currentCharacter: "",
      characterPool: [],
      charactersFound: 0,
      totalTargetCharacters: 0,
      sessionHistory: []
    }),
    settingsStore: types.optional(SettingsStore, {})
  })
  .actions(self => ({
    afterCreate() {
      self.objectStore.loadObjects()
      self.objectSetStore.loadSets()
      self.settingsStore.loadSettings()
    }
  }))

export interface RootStore extends Instance<typeof RootStore> {}