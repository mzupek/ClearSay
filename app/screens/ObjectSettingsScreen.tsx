import React, { useState, useEffect } from "react"
import { View, ViewStyle, TextStyle, Image, ScrollView, Alert, Platform, ActionSheetIOS } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import * as ImagePicker from 'expo-image-picker'
import { useStores } from "app/models"
import * as FileSystem from 'expo-file-system'
import { useNavigation } from "@react-navigation/native"

export const ObjectSettingsScreen = observer(function ObjectSettingsScreen() {
  const { objectStore, objectSetStore } = useStores()
  const navigation = useNavigation()
  const [isLoading, setIsLoading] = useState(false)

  const handleImageSelection = async () => {
    if (Platform.OS === 'ios' && !Platform.isMacOS) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
         if (buttonIndex === 1) {
            await pickImage()
          }
        }
      )
    } else {
      await pickImage()
    }
  }

  const takePhoto = async () => {
    try {
      setIsLoading(true)
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to take photos.')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        allowsEditing: true,
        aspect: [1, 1],
      })

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error taking photo:', error)
      Alert.alert('Error', 'Failed to take photo. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const pickImage = async () => {
    try {
      setIsLoading(true)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        allowsEditing: true,
        aspect: [1, 1],
      })

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to select image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const processImage = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      const base64Uri = `data:image/jpeg;base64,${base64}`
      
      Alert.prompt(
        "Name this object",
        "Enter the name for this object that you want to practice pronouncing:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: async (name?: string) => {
              if (name) {
                objectStore.addObject({
                  id: Date.now().toString(),
                  uri: base64Uri,
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
    } catch (error) {
      console.error('Error processing image:', error)
      Alert.alert('Error', 'Failed to process image. Please try again.')
    }
  }

  const handleDeletePhoto = (id: string) => {
    Alert.alert(
      "Delete Object",
      "Are you sure you want to delete this object?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => objectStore.removeObject(id)
        }
      ]
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <View style={$screenContainer}>
        <Text 
          text="Object Settings" 
          preset="heading" 
          style={$title}
        />
        
        <Button
          text={Platform.isMacOS ? "Select Image" : "Add Photo"}
          onPress={handleImageSelection}
          style={$addButton}
          disabled={isLoading}
        />

        <ScrollView>
          {objectStore.objects.map(photo => (
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
          ))}
        </ScrollView>
      </View>
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
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
}

const $photoDetails: ViewStyle = {
  flex: 1,
  alignItems: 'flex-start',
}

const $photoName: TextStyle = {
  marginBottom: spacing.xs,
}

const $actionButtons: ViewStyle = {
  flexDirection: 'row',
  gap: spacing.xs,
  alignSelf: 'flex-end',
}

const $actionButton: ViewStyle = {
  minWidth: 100,
}

const $addToSetButton: ViewStyle = {
  backgroundColor: colors.palette.secondary500,
  
}

const $deleteButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
}

const $manageButton: ViewStyle = {
  marginBottom: spacing.md,
  backgroundColor: colors.palette.secondary500,
}
const $whiteText: TextStyle = {
  color: 'white',
  fontSize: 20,
}