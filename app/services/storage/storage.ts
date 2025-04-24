import AsyncStorage from "@react-native-async-storage/async-storage"
import RNFS from "react-native-fs"
import { ObjectSet } from "app/models/ObjectSetModel"
import { Object } from "app/models/ObjectModel"

const STORAGE_KEYS = {
  OBJECT_SETS: "objectSets",
  OBJECTS: "objects",
  PERFORMANCE_DATA: "performanceData",
  SYNC_META: "syncMeta"
}

interface SyncMeta {
  lastSyncTime: number
  pendingUploads: {
    objectSets: string[]
    objects: string[]
  }
  conflicts: {
    objectSets: string[]
    objects: string[]
  }
  serverVersion: number
}

interface PerformanceData {
  objectSetId: string
  timestamp: number
  correct: number
  incorrect: number
  skipped: number
  duration: number
  objects: Array<{
    objectId: string
    correct: boolean
    responseTime: number
  }>
}

class StorageService {
  async saveObjectSet(set: ObjectSet): Promise<void> {
    try {
      const existingSets = await this.getObjectSets()
      const setIndex = existingSets.findIndex(s => s.id === set.id)
      
      if (setIndex >= 0) {
        existingSets[setIndex] = set
      } else {
        existingSets.push(set)
      }

      await AsyncStorage.setItem(STORAGE_KEYS.OBJECT_SETS, JSON.stringify(existingSets))
      
      // Only mark for sync if it's not a local set
      if (!set.isLocal) {
        await this.markForSync("objectSets", set.id)
      }
    } catch (error) {
      console.error("Error saving object set:", error)
      throw error
    }
  }

  async getObjectSet(id: string): Promise<ObjectSet | null> {
    try {
      const sets = await this.getObjectSets()
      return sets.find(set => set.id === id) || null
    } catch (error) {
      console.error("Error getting object set:", error)
      return null
    }
  }

  async getObjectSets(): Promise<ObjectSet[]> {
    try {
      const sets = await AsyncStorage.getItem(STORAGE_KEYS.OBJECT_SETS)
      return sets ? JSON.parse(sets) : []
    } catch (error) {
      console.error("Error getting object sets:", error)
      return []
    }
  }

  async savePerformanceData(data: PerformanceData): Promise<void> {
    try {
      const existingData = await this.getPerformanceData(data.objectSetId)
      existingData.push(data)
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.PERFORMANCE_DATA}_${data.objectSetId}`,
        JSON.stringify(existingData)
      )
    } catch (error) {
      console.error("Error saving performance data:", error)
      throw error
    }
  }

  async getPerformanceData(objectSetId: string): Promise<PerformanceData[]> {
    try {
      const data = await AsyncStorage.getItem(
        `${STORAGE_KEYS.PERFORMANCE_DATA}_${objectSetId}`
      )
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error getting performance data:", error)
      return []
    }
  }

  async clearPerformanceData(objectSetId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${STORAGE_KEYS.PERFORMANCE_DATA}_${objectSetId}`)
    } catch (error) {
      console.error("Error clearing performance data:", error)
      throw error
    }
  }

  async saveImage(uri: string, imageId: string): Promise<string> {
    try {
      const fileName = `${imageId}.jpg`
      const imagePath = `${RNFS.DocumentDirectoryPath}/images/${fileName}`
      
      // Create images directory if it doesn't exist
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/images`)
      
      // If uri is remote, download it
      if (uri.startsWith('http')) {
        await RNFS.downloadFile({
          fromUrl: uri,
          toFile: imagePath,
        }).promise
      } else {
        // If uri is local, copy it
        await RNFS.copyFile(uri, imagePath)
      }
      
      return imagePath
    } catch (error) {
      console.error("Error saving image:", error)
      throw error
    }
  }

  async markForSync(type: "objectSets" | "objects", id: string) {
    const meta = await this.getSyncMeta()
    if (!meta.pendingUploads[type].includes(id)) {
      meta.pendingUploads[type].push(id)
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_META, JSON.stringify(meta))
    }
  }

  async markAsConflict(type: "objectSets" | "objects", id: string) {
    const meta = await this.getSyncMeta()
    if (!meta.conflicts[type].includes(id)) {
      meta.conflicts[type].push(id)
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_META, JSON.stringify(meta))
    }
  }

  async resolveConflict(type: "objectSets" | "objects", id: string) {
    const meta = await this.getSyncMeta()
    meta.conflicts[type] = meta.conflicts[type].filter(conflictId => conflictId !== id)
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_META, JSON.stringify(meta))
  }

  async updateServerVersion(version: number) {
    const meta = await this.getSyncMeta()
    meta.serverVersion = version
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_META, JSON.stringify(meta))
  }

  async getSyncMeta(): Promise<SyncMeta> {
    const meta = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_META)
    if (!meta) {
      return {
        lastSyncTime: 0,
        pendingUploads: {
          objectSets: [],
          objects: []
        },
        conflicts: {
          objectSets: [],
          objects: []
        },
        serverVersion: 0
      }
    }
    return JSON.parse(meta)
  }

  async clearSyncMeta() {
    await AsyncStorage.setItem(
      STORAGE_KEYS.SYNC_META,
      JSON.stringify({
        lastSyncTime: 0,
        pendingUploads: {
          objectSets: [],
          objects: []
        },
        conflicts: {
          objectSets: [],
          objects: []
        },
        serverVersion: 0
      })
    )
  }
}

export const storage = new StorageService() 