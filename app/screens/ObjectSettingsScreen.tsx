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
                    uri: { uri },
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
    <Screen preset="scroll">
      <View style={$container}>
        <Text preset="heading" text="Object Settings" style={$title} />
        <View style={$buttonContainer}>
          <Button
            text="Add New Object"
            onPress={handleImageSelection}
            style={[$addButton]}
            textStyle={$whiteText}
          />
          <Button
            text="Manage Object Sets"
            onPress={() => navigation.navigate("ObjectSet")}
            style={$manageButton}
            textStyle={$whiteText}
          />
        </View>
        <ScrollView style={$scrollView}>
          {objectStore.objectList.map((obj) => (
            <View key={obj.id} style={$objectContainer}>
              <Image 
                source={obj.isDefault ? obj.uri : { uri: obj.uri.uri }}
                style={$objectImage}
                resizeMode="cover"
              />
              <View style={$textContainer}>
                <Text text={obj.name} style={$objectName} />
              </View>
              <Button
                text="Remove"
                onPress={() => objectStore.removeObject(obj.id)}
                style={[$removeButton]}
                textStyle={$whiteText}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.medium,
}

const $title: TextStyle = {
  marginBottom: spacing.large,
  textAlign: "center",
}

const $buttonContainer: ViewStyle = {
  flexDirection: "column",
  gap: spacing.small,
  marginBottom: spacing.medium,
}

const $button: ViewStyle = {
  marginBottom: spacing.medium,
  backgroundColor: colors.palette.neutral800,
}

const $scrollView: ViewStyle = {
  flex: 1,
}

const $objectContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.small,
  marginBottom: spacing.medium,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
}

const $textContainer: ViewStyle = {
  flex: 1,
  marginHorizontal: spacing.medium,
}

const $objectImage: ImageStyle = {
  width: 60,
  height: 60,
  borderRadius: 4,
}

const $objectName: TextStyle = {
  fontSize: 16,
}

const $removeButton: ViewStyle = {
  minWidth: 80,
  backgroundColor: colors.palette.angry500,
  padding:10
}

const $addButton: ViewStyle = {
  backgroundColor: 'darkgreen',
  minWidth: 100,
  shadowColor: 'black',
  shadowOffset: { width: 5, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 5,
  elevation: 5,
  borderRadius: 8,
}

const $manageButton: ViewStyle = {
  backgroundColor: colors.palette.accent500,
  minWidth: 100,
  shadowColor: 'black',
  shadowOffset: { width: 5, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 5,
  elevation: 5,
  borderRadius: 8,
}

const $whiteText: TextStyle = {
  color: 'white',
  fontSize: 22,
  lineHeight: 22,
} 