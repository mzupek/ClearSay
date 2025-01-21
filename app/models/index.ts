import { RootStore } from "./RootStore"
import { useStores } from "./helpers/useStores"
import { RootStoreProvider } from "./helpers/useStores"
import { setupRootStore } from "./helpers/useStores"
import { useInitialRootStore } from "./helpers/useStores"

// Export everything individually to avoid configuration issues
export { RootStore }
export { useStores }
export { RootStoreProvider }
export { setupRootStore }
export { useInitialRootStore }

// Export type separately
export type { RootStore as RootStoreType } from "./RootStore"
