import { createContext, useContext } from "react"
import { Instance } from "mobx-state-tree"
import { RootStoreModel } from "../RootStore"

/**
 * The RootStoreContext provides a way to access
 * the RootStore in any screen or component.
 */
const rootStore = RootStoreModel.create({
  objects: [],
  objectSets: [],
  currentObjectSet: null,
  currentObject: null,
  navigationRef: undefined,
  currentUser: undefined
})

const RootStoreContext = createContext<Instance<typeof RootStoreModel>>(rootStore)

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
export const useStores = () => useContext(RootStoreContext)

/**
 * Used for testing and hot reloading
 * @returns {Instance<typeof RootStoreModel>}
 */
export const setupRootStore = () => {
  return RootStoreModel.create({
    objects: [],
    objectSets: [],
    currentObjectSet: null,
    currentObject: null,
    navigationRef: undefined,
    currentUser: undefined
  })
}

export const useInitialRootStore = () => {
  const store = setupRootStore()
  return { rootStore: store, rehydrated: true }
}
