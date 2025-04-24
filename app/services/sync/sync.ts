import NetInfo from "@react-native-community/netinfo"
import { storage } from "../storage/storage"
import { api } from "../api"
import { ObjectSet } from "../../models/ObjectSetModel"
import { Object } from "../../models/ObjectModel"
import { generateQRCode } from "../qr/qrGenerator"

interface SyncResult {
  success: boolean
  error?: string
  syncedData?: {
    objectSets: number
    objects: number
    performanceData: number
  }
  qrCode?: string
}

class SyncService {
  private isSyncing = false

  async generateSyncQRCode(objectSetId: string): Promise<string> {
    const objectSet = await storage.getObjectSet(objectSetId)
    if (!objectSet) {
      throw new Error("Object set not found")
    }

    // Generate a temporary code and store it with the object set
    const tempCode = await generateQRCode({
      type: "performance_sync",
      setId: objectSet.id,
      timestamp: Date.now()
    })
    
    await storage.updateObjectSet({
      ...objectSet,
      temporaryCode: tempCode
    })

    return tempCode
  }

  async syncPerformanceData(objectSetId: string): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        error: "Sync already in progress"
      }
    }

    try {
      this.isSyncing = true

      // Check network connectivity
      const netInfo = await NetInfo.fetch()
      if (!netInfo.isConnected) {
        return {
          success: false,
          error: "No network connection"
        }
      }

      const objectSet = await storage.getObjectSet(objectSetId)
      if (!objectSet) {
        return {
          success: false,
          error: "Object set not found"
        }
      }

      // Only sync non-local sets
      if (objectSet.isLocal) {
        return {
          success: false,
          error: "Cannot sync local-only object set"
        }
      }

      // Get performance data for this set
      const performanceData = await storage.getPerformanceData(objectSetId)
      
      // Upload anonymized performance data
      const response = await api.apisauce.post("/performance-data", {
        setId: objectSetId,
        temporaryCode: objectSet.temporaryCode,
        data: performanceData
      })

      if (!response.ok) {
        throw new Error("Failed to sync performance data")
      }

      // Clear temporary code after successful sync
      await storage.updateObjectSet({
        ...objectSet,
        temporaryCode: undefined
      })

      // Clear synced performance data
      await storage.clearPerformanceData(objectSetId)

      return {
        success: true,
        syncedData: {
          objectSets: 0,
          objects: 0,
          performanceData: performanceData.length
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }
    } finally {
      this.isSyncing = false
    }
  }

  async downloadManagedSet(setId: string): Promise<SyncResult> {
    try {
      const response = await api.apisauce.get(`/object-sets/${setId}`)
      if (!response.ok || !response.data) {
        throw new Error("Failed to download managed set")
      }

      const objectSet = response.data as ObjectSet
      await storage.saveObjectSet({
        ...objectSet,
        isLocal: false
      })

      return {
        success: true,
        syncedData: {
          objectSets: 1,
          objects: objectSet.objects.length,
          performanceData: 0
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }
    }
  }
}

export const sync = new SyncService() 