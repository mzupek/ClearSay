import { Instance, types } from "mobx-state-tree"
import { ObjectStore } from "./ObjectStore"
import { ObjectSetStore } from "./ObjectSetStore"
import { PracticeStore } from "./PracticeStore"

const SettingsStore = types
  .model("SettingsStore")
  .props({
    loaded: types.optional(types.boolean, false)
  })
  .actions(self => ({
    loadSettings() {
      self.loaded = true
      return Promise.resolve()
    }
  }))

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
    settingsStore: types.optional(SettingsStore, { loaded: false })
  })

export interface RootStore extends Instance<typeof RootStore> {}