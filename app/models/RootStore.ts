import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { AuthenticationStoreModel } from "./AuthenticationStore"
import { EpisodeStoreModel } from "./EpisodeStore"
import { PracticeStoreModel } from "./PracticeStore"
import { SettingsStoreModel } from "./SettingsStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types
  .model("RootStore")
  .props({
    authenticationStore: types.optional(AuthenticationStoreModel, {}),
    episodeStore: types.optional(EpisodeStoreModel, {}),
    practiceStore: types.optional(PracticeStoreModel, {}),
    settingsStore: types.optional(SettingsStoreModel, {}),
  })
  .actions((self) => ({
    reset() {
      self.authenticationStore.reset()
      self.episodeStore.reset()
      self.practiceStore.reset()
    },
  }))

export interface RootStore extends Instance<typeof RootStoreModel> {}
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}