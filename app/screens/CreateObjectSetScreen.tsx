import React, { useState, useEffect } from "react"
import { View, ViewStyle, Image, ImageStyle, Alert, ScrollView, TouchableOpacity, TextStyle, ImageSourcePropType } from "react-native"
import { Screen, Text, Button, TextField, Icon } from "../components"
import { colors, spacing } from "../theme"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import * as ImagePicker from 'expo-image-picker'
import { ObjectModel } from "app/models/ObjectModel"
import { ObjectTabParamList } from "app/navigators/ObjectNavigator"

interface ObjectWithImage {
  id: string
  name: string
  uri: string
  isDefault: boolean
  imageSource: ImageSourcePropType
}

type NavigationProp = NativeStackNavigationProp<ObjectTabParamList, "CreateObjectSet">
type ScreenRouteProp = RouteProp<ObjectTabParamList, "CreateObjectSet">

export const CreateObjectSetScreen = observer(function CreateObjectSetScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<ScreenRouteProp>()
  const store = useStores()
  
  // Get edit mode parameters if they exist
  const editMode = route.params?.editMode || false
  const setId = route.params?.setId
  const initialSetData = route.params?.setData

  const [setName, setSetName] = useState(editMode && initialSetData ? initialSetData.name : "")
  const [setDescription, setSetDescription] = useState(editMode && initialSetData ? initialSetData.description : "")
  const [objects, setObjects] = useState<ObjectWithImage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load existing objects if in edit mode
  useEffect(() => {
    if (editMode && initialSetData?.objects) {
      const existingObjects = initialSetData.objects.map(obj => ({
        id: obj.id,
        name: obj.name,
        uri: obj.uri as string,
        isDefault: obj.isDefault,
        imageSource: obj.isDefault ? obj.uri : { uri: obj.uri as string }
      }))
      setObjects(existingObjects)
    }
  }, [editMode, initialSetData])

  // Update navigation title based on mode
  useEffect(() => {
    navigation.setOptions({
      title: editMode ? "Edit Object Set" : "Create New Set"
    })
  }, [editMode])

  const handleAddImage = async () => {
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

  const handleImageCapture = async (uri: string) => {
    Alert.prompt(
      "Name this object",
      "Enter the name for this object:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (name?: string) => {
            if (name) {
              const newObject: ObjectWithImage = {
                id: Date.now().toString(),
                name: name.trim(),
                uri,
                isDefault: false,
                imageSource: { uri }
              }
              setObjects([...objects, newObject])
            }
          }
        }
      ],
      "plain-text"
    )
  }

  const handleRemoveObject = (id: string) => {
    setObjects(objects.filter(obj => obj.id !== id))
  }

  const handleSaveSet = async () => {
    if (!setName.trim()) {
      Alert.alert("Error", "Please enter a name for the set")
      return
    }

    if (objects.length === 0) {
      Alert.alert("Error", "Please add at least one object to the set")
      return
    }

    try {
      setIsLoading(true)

      // First create or update the objects
      const objectIds = await Promise.all(
        objects.map(async (obj) => {
          if (obj.isDefault) return obj.id // Don't recreate default objects

          const objectData = {
            name: obj.name,
            uri: obj.uri,
            isDefault: false,
            category: "",
            tags: [],
            difficulty: "medium",
            notes: "",
            practiceMode: "sequential" as const,
            isActive: true
          }

          if (editMode) {
            // Update existing object if it exists
            const existingObject = store.objects.find(o => o.id === obj.id)
            if (existingObject) {
              store.updateObject(obj.id, objectData)
              return obj.id
            }
          }

          // Create new object
          const newObject = store.addObject(objectData)
          return newObject.id
        })
      )

      const setData = {
        name: setName.trim(),
        description: setDescription.trim(),
        objects: objectIds,
        isDefault: false,
        practiceMode: initialSetData?.practiceMode || "sequential" as const,
        isActive: initialSetData?.isActive ?? true
      }

      if (editMode && setId) {
        // Update existing set
        store.updateObjectSet(setId, setData)
      } else {
        // Create new set
        store.addObjectSet(setData)
      }

      navigation.goBack()
    } catch (error) {
      console.error('Error saving set:', error)
      Alert.alert('Error', 'Failed to save set. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={$container}
      safeAreaEdges={["bottom"]}
    >
      <View style={$formContainer}>
        <TextField
          label="Set Name"
          value={setName}
          onChangeText={setSetName}
          placeholder="Enter set name"
          style={$input}
        />
        <TextField
          label="Description (Optional)"
          value={setDescription}
          onChangeText={setSetDescription}
          placeholder="Enter set description"
          style={$input}
          multiline
        />
      </View>

      <View style={$objectsContainer}>
        <View style={$objectsHeader}>
          <Text text="Objects" preset="subheading" />
          <Button
            text="Add Object"
            onPress={handleAddImage}
            style={$addButton}
            textStyle={$whiteText}
          />
        </View>

        <ScrollView style={$objectsList}>
          {objects.map((obj) => (
            <View key={obj.id} style={$objectItem}>
              <Image source={obj.imageSource} style={$objectImage} />
              <View style={$objectInfo}>
                <Text text={obj.name} style={$objectName} />
              </View>
              <TouchableOpacity
                style={$removeButton}
                onPress={() => handleRemoveObject(obj.id)}
              >
                <Icon icon="x" color={colors.palette.neutral100} size={20} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={$footer}>
        <Button
          text={editMode ? "Save Changes" : "Create Set"}
          onPress={handleSaveSet}
          style={$saveButton}
          textStyle={$whiteText}
          disabled={isLoading || !setName.trim() || objects.length === 0}
        />
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $formContainer: ViewStyle = {
  padding: spacing.medium,
  gap: spacing.medium,
}

const $input: ViewStyle = {
  marginBottom: spacing.medium,
}

const $objectsContainer: ViewStyle = {
  flex: 1,
  padding: spacing.medium,
}

const $objectsHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.medium,
}

const $addButton: ViewStyle = {
  backgroundColor: colors.palette.accent500,
  minWidth: 100,
}

const $whiteText: TextStyle = {
  color: colors.palette.neutral100,
}

const $objectsList: ViewStyle = {
  flex: 1,
}

const $objectItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.small,
  marginBottom: spacing.small,
}

const $objectImage: ImageStyle = {
  width: 60,
  height: 60,
  borderRadius: 4,
}

const $objectInfo: ViewStyle = {
  flex: 1,
  marginLeft: spacing.medium,
}

const $objectName: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
}

const $removeButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: "center",
  alignItems: "center",
}

const $footer: ViewStyle = {
  padding: spacing.medium,
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral300,
}

const $saveButton: ViewStyle = {
  backgroundColor: colors.palette.accent500,
} 