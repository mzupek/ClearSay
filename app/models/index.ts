import { RootStore } from "./RootStore"
import { useStores, RootStoreProvider, useInitialRootStore, getRootStore } from "./helpers/useStores"

// Export everything individually to avoid property configuration issues
export { RootStore }
export { useStores }
export { RootStoreProvider }
export { useInitialRootStore }
export { getRootStore }

// Export type separately
export type { RootStore as RootStoreType } from "./RootStore"
