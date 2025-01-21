import React, { useState, useEffect } from "react"
import { View, ViewStyle, TextStyle, Image, ScrollView, Alert, Dimensions, Platform, ActionSheetIOS, ImageStyle } from "react-native"
import { Screen, Text, Button } from "app/components"
import { spacing } from "app/theme"
import { colors } from "app/theme/colors"
import { observer } from "mobx-react-lite"
import * as ImagePicker from 'expo-image-picker'
import { useStores } from "app/models"
import { useNavigation } from "@react-navigation/native"

const isIPad = Platform.OS === 'ios' && Platform.isPad

export const ObjectSettingsScreen = observer(function ObjectSettingsScreen() {
  const navigation = useNavigation()
  const { objectStore, objectSetStore } = useStores()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddImage = async () => {
    if (objectSetStore.sets.length === 0) {
      Alert.alert(
        "No Sets Available",
        "Please create an object set first before adding images.",
        [
          {
            text: "Create Set",
            onPress: () => navigation.navigate("ObjectSet")
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      )
      return
    }

    Alert.alert(
      "Add Image",
      "Choose how you want to add an image",
      [
        {
          text: "Take Photo",
          onPress: () => handleTakePhoto()
        },
        {
          text: "Choose from Library",
          onPress: () => handlePickImage()
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    )
  }

  const handleImageCapture = async (uri: string) => {
    // Show set selection dialog
    Alert.alert(
      "Select Set",
      "Choose which set to add this image to:",
      [
        ...objectSetStore.sets.map(set => ({
          text: set.name,
          onPress: () => promptForImageName(uri, set.id)
        })),
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    )
  }

  const promptForImageName = async (uri: string, setId: string) => {
    Alert.prompt(
      "Name this object",
      "Enter the name for this object:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (name?: string) => {
            if (name) {
              try {
                const base64 = await FileSystem.readAsStringAsync(uri, {
                  encoding: FileSystem.EncodingType.Base64,
                })
                const base64Uri = `data:image/jpeg;base64,${base64}`
                
                objectSetStore.addObjectToSet(setId, {
                  id: Date.now().toString(),
                  uri: base64Uri,
                  name: name.trim(),
                })
              } catch (error) {
                console.error('Error saving object:', error)
                Alert.alert('Error', 'Failed to save object. Please try again.')
              }
            }
          }
        }
      ],
      "plain-text"
    )
  }

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true)
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
      if (permissionResult.status !== 'granted') {
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
        await handleImageCapture(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error taking photo:', error)
      Alert.alert('Error', 'Failed to take photo. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePickImage = async () => {
    try {
      setIsLoading(true)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        allowsEditing: true,
        aspect: [1, 1],
      })

      if (!result.canceled && result.assets[0]) {
        await handleImageCapture(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to select image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToSet = (object: any) => {
    if (objectSetStore.sets.length === 0) {
      Alert.alert(
        "No Sets Available",
        "Please create an object set first.",
        [
          {
            text: "Create Set",
            onPress: () => navigation.navigate("ObjectSet")
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      )
      return
    }

    Alert.alert(
      "Select Set",
      "Choose which set to add this object to:",
      [
        ...objectSetStore.sets.map(set => ({
          text: set.name,
          onPress: () => {
            const newObject = {
              id: object.id,
              uri: object.uri,
              name: object.name,
              attempts: 0,
              correctAttempts: 0
            }
            objectSetStore.addObjectToSet(set.id, newObject)
            Alert.alert("Success", "Object added to set successfully!")
          }
        })),
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    )
  }

  const handleImageSelection = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      if (!result.canceled) {
        const uri = result.assets[0].uri
        Alert.prompt(
          "Name Object",
          "Enter a name for this object:",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Save",
              onPress: (name?: string) => {
                if (name) {
                  objectStore.addObject({
                    id: Date.now().toString(),
                    name: name.trim(),
                    uri: uri,
                    attempts: 0,
                    correctAttempts: 0
                  })
                }
              }
            }
          ]
        )
      }
    } catch (error) {
      console.error('Error selecting image:', error)
      Alert.alert('Error', 'Failed to select image')
    }
  }

  const handleDeletePhoto = (id: string) => {
    Alert.alert(
      "Delete Object",
      "Are you sure you want to delete this object?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => objectStore.removeObject(id)
        }
      ]
    )
  }

  useEffect(() => {
    objectStore.loadObjects()
  }, [])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <View style={$screenContainer}>
        <Text 
          text="Object Settings" 
          preset="heading" 
          style={$title}
        />
        
        <Button
          text="Manage Object Sets"
          onPress={() => navigation.navigate("ObjectSet")}
          style={[$manageButton]}
        />

        <Button
          text={Platform.isMacOS ? "Select Image" : "Add Photo"}
          onPress={handleImageSelection}
          style={$addButton}
          disabled={isLoading}
        />

        <ScrollView>
          <View style={$photoList}>
            {objectStore.objects.map((object) => (
              <View key={object.id} style={$photoItem}>
                <Image source={{ uri: object.uri }} style={$photoImage} />
                <View style={$photoDetails}>
                  <Text text={object.name} style={$photoName} />
                  <View style={$actionButtons}>
                    <Button
                      text="Add to Set"
                      onPress={() => handleAddToSet(object)}
                      style={[$actionButton, $addToSetButton]}
                    />
                    <Button
                      text="Delete"
                      onPress={() => handleDeletePhoto(object.id)}
                      style={[$actionButton, $deleteButton]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
  padding: spacing.medium,
}

const $title: TextStyle = {
  marginBottom: spacing.large,
  textAlign: "center",
}

const $addButton: ViewStyle = {
  marginBottom: spacing.medium,
  backgroundColor: 'green',
}

const $photoList: ViewStyle = {
  flex: 1,
}

const $photoItem: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  padding: spacing.small,
  marginBottom: spacing.medium,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
}

const $photoImage: ImageStyle = {
  width: 60,
  height: 60,
  borderRadius: 4,
  marginRight: spacing.medium,
}

const $photoDetails: ViewStyle = {
  flex: 1,
}

const $photoName: TextStyle = {
  marginBottom: spacing.extraSmall,
}

const $actionButtons: ViewStyle = {
  flexDirection: 'row',
  gap: spacing.extraSmall,
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
  marginBottom: spacing.medium,
  backgroundColor: colors.palette.secondary500,
}

const $setContainer: ViewStyle = {
  marginTop: spacing.extraLarge,
  padding: spacing.medium,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
}

const $setName: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: spacing.small,
}

const $imageGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.small,
}

const $imageContainer: ViewStyle = {
  width: 100,
  alignItems: "center",
}

const $image: ImageStyle = {
  width: 80,
  height: 80,
  borderRadius: 8,
}

const $imageName: TextStyle = {
  fontSize: 12,
  textAlign: "center",
  marginTop: spacing.extraSmall,
}