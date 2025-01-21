import React, { useState, useEffect } from "react"
import { View, ViewStyle, TextStyle, Image, ScrollView, Alert } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import * as ImagePicker from 'expo-image-picker'
import { useStores } from "app/models"
import * as FileSystem from 'expo-file-system'

export const ObjectSettingsScreen = observer(function ObjectSettingsScreen() {
  const { objectStore } = useStores()
  const [isLoading, setIsLoading] = useState(false)

  const requestPermissions = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to take photos of objects.',
          [{ text: 'OK' }]
        )
        return false
      }
      return true
    } catch (error) {
      console.error('Error requesting permissions:', error)
      return false
    }
  }

  useEffect(() => {
    const setup = async () => {
      const hasPermissions = await requestPermissions()
      if (hasPermissions) {
        await setupObjectsDirectory()
        await objectStore.loadObjects()
      }
    }
    setup()
  }, [])

  const setupObjectsDirectory = async () => {
    const dirPath = `${FileSystem.documentDirectory}objects`
    const dirInfo = await FileSystem.getInfoAsync(dirPath)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirPath, {
        intermediates: true
      })
      console.log('Created objects directory at:', dirPath)
    }
  }

  const saveImageToFileSystem = async (uri: string): Promise<string> => {
    try {
      const fileName = `object_${Date.now()}.jpg`
      const dirPath = `${FileSystem.documentDirectory}objects`
      const newPath = `${dirPath}/${fileName}`
      
      // Copy image to permanent location
      await FileSystem.copyAsync({
        from: uri,
        to: newPath
      })

      console.log('Image saved successfully to:', newPath)
      // Return the full file:// URI for consistent path handling
      return `file://${newPath}`
    } catch (error) {
      console.error('Error saving image:', error)
      throw error
    }
  }

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true)
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      })

      if (!result.canceled && result.assets[0]) {
        const permanentUri = await saveImageToFileSystem(result.assets[0].uri)
        console.log('Permanent URI:', permanentUri)
        
        Alert.prompt(
          "Name this object",
          "Enter the name for this object that you want to practice pronouncing:",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Save",
              onPress: async (name?: string) => {
                if (name) {
                  objectStore.addObject({
                    id: Date.now().toString(),
                    uri: permanentUri,
                    name: name.trim(),
                    attempts: 0,
                    correctAttempts: 0
                  })
                }
              }
            }
          ],
          "plain-text"
        )
      }
    } catch (error) {
      console.error('Error taking photo:', error)
      Alert.alert('Error', 'Failed to take photo. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePhoto = async (id: string) => {
    Alert.alert(
      "Delete Object",
      "Are you sure you want to delete this object?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const object = objectStore.objects.find(obj => obj.id === id)
            if (object) {
              try {
                // Remove file:// prefix for FileSystem operations
                const filePath = object.uri.replace('file://', '')
                const fileInfo = await FileSystem.getInfoAsync(filePath)
                
                if (fileInfo.exists) {
                  await FileSystem.deleteAsync(filePath, { idempotent: true })
                  console.log('Successfully deleted file at:', filePath)
                } else {
                  console.log('File does not exist:', filePath)
                }
                
                objectStore.removeObject(id)
              } catch (error) {
                console.error('Error deleting image:', error)
                Alert.alert('Error', 'Failed to delete object. Please try again.')
              }
            }
          }
        }
      ]
    )
  }

  return (
    <Screen preset="scroll" style={$screenContainer}>
      <Text text="Object List" preset="subheading" style={$title} />
      
      <Button
        text="Take Photo of New Object"
        onPress={handleTakePhoto}
        style={$addButton}
        disabled={isLoading}
      />

      <ScrollView style={$photoList}>
        {objectStore.objects.map(photo => {
          console.log('Rendering photo:', photo.uri)
          return (
            <View key={photo.id} style={$photoItem}>
              <Image 
                source={{ uri: photo.uri }}
                style={$photoImage} 
                resizeMode="cover"
                onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
              />
              <View style={$photoDetails}>
                <Text text={photo.name} style={$photoName} />
                <Button
                  text="Delete"
                  onPress={() => handleDeletePhoto(photo.id)}
                  style={$deleteButton}
                  preset="default"
                />
              </View>
            </View>
          )
        })}
      </ScrollView>
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
  padding: spacing.md,
}

const $title: TextStyle = {
  marginBottom: spacing.lg,
  textAlign: "center",
}

const $addButton: ViewStyle = {
  marginBottom: spacing.md,
}

const $photoList: ViewStyle = {
  flex: 1,
}

const $photoItem: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  padding: spacing.sm,
  marginBottom: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
}

const $photoImage: any = {
  width: 60,
  height: 60,
  borderRadius: 4,
  marginRight: spacing.md,
  backgroundColor: colors.palette.neutral300,
}

const $photoDetails: ViewStyle = {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const $photoName: TextStyle = {
  flex: 1,
  marginRight: spacing.sm,
}

const $deleteButton: ViewStyle = {
  minWidth: 80,
  backgroundColor: colors.palette.angry500,
} 