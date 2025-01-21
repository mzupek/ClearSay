import { createContext, useContext } from "react"
import { Instance } from "mobx-state-tree"
import { RootStore } from "../RootStore"

/**
 * The RootStoreContext provides a way to access
 * the RootStore in any screen or component.
 */
const rootStore = RootStore.create({
  objectStore: { objects: [] },
  objectSetStore: { sets: [] },
  practiceStore: {
    isSessionActive: false,
    currentRound: 1,
    currentCharacter: "",
    characterPool: [],
    charactersFound: 0,
    totalTargetCharacters: 0,
    sessionHistory: []
  }
})

const RootStoreContext = createContext<Instance<typeof RootStore>>(rootStore)

/**
 * You can use this Provider to specify a *different* RootStore
 * than the singleton version above if you need to. Generally speaking,
 * this Provider & custom RootStore instances would only be used in
 * testing scenarios.
 */
export const RootStoreProvider = RootStoreContext.Provider

/**
 * A hook that screens and other components can use to gain access to
 * our stores:
 *
 * const rootStore = useStores()
 *
 * or:
 *
 * const { someStore, someOtherStore } = useStores()
 */
export const useStores = () => {
  return rootStore // Return the store instance directly
}

// Export the store instance
export const store = rootStore

export const setupRootStore = () => {
  const rootStore = RootStore.create({
    objectStore: { objects: [] },
    objectSetStore: { sets: [] },
    practiceStore: {
      isSessionActive: false,
      currentRound: 1,
      currentCharacter: "",
      characterPool: [],
      charactersFound: 0,
      totalTargetCharacters: 0,
      sessionHistory: []
    }
  })
  return rootStore
}

export const useInitialRootStore = () => {
  const store = setupRootStore()
  return { rootStore: store, rehydrated: true }
}
