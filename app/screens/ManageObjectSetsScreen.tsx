import React, { FC, useState } from "react"
import { ViewStyle, View, TouchableOpacity, Image, ImageStyle, FlatList, TextStyle, RefreshControl, Alert } from "react-native"
import { Button, Screen, Text } from "../components"
import { colors, spacing } from "../theme"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { ObjectSet, ObjectSetModel } from "app/models/ObjectSetModel"
import { ObjectModel } from "app/models/ObjectModel"
import { Instance } from "mobx-state-tree"
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList, InteractiveType } from "app/navigators/AppNavigator"
import { ObjectTabParamList } from "../navigators/ObjectNavigator"

interface CreateObjectSetParams {
  editMode?: boolean
  setId?: string
  setData?: {
    name: string
    description: string
    objects: Instance<typeof ObjectModel>[]
    category: string
    practiceMode: "sequential" | "random" | "adaptive"
    isActive: boolean
  }
}

type NavigationProp = NativeStackNavigationProp<AppStackParamList>
type Props = NativeStackScreenProps<AppStackParamList, "ManageObjectSets">

type ObjectSetType = Instance<typeof ObjectSetModel>

export const ManageObjectSetsScreen = observer(function ManageObjectSetsScreen(props: Props) {
  const { pictureToWordPractice, recognitionPractice, objectSets } = useStores()
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute()
  const [refreshing, setRefreshing] = useState(false)
  const [, forceUpdate] = useState({})

  // Get the interactive type from route params
  const interactiveType = (route.params as { interactiveType?: InteractiveType })?.interactiveType

  // Function to get assigned sets based on interactive type
  const getAssignedSets = () => {
    if (interactiveType === "Recognition") {
      return recognitionPractice.assignedSets || []
    }
    return pictureToWordPractice.assignedSets || []
  }

  // Function to assign sets based on interactive type
  const assignSet = (set: ObjectSetType) => {
    if (interactiveType === "Recognition") {
      recognitionPractice.setAssignedSets([...recognitionPractice.assignedSets, set])
      // Start a new practice session with the first object
      if (set.objects.length > 0) {
        recognitionPractice.startSession()
      }
    } else {
      pictureToWordPractice.assignSet(set)
    }
    Alert.alert("Success", `${set.name} has been assigned for practice.`)
    forceUpdate({})
  }

  // Function to unassign sets based on interactive type
  const unassignSet = (set: ObjectSetType) => {
    if (interactiveType === "Recognition") {
      recognitionPractice.setAssignedSets(recognitionPractice.assignedSets.filter(s => s.id !== set.id))
      recognitionPractice.endSession()
    } else {
      pictureToWordPractice.unassignSet(set)
    }
    forceUpdate({})
  }

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshData = async () => {
        setRefreshing(true)
        try {
          forceUpdate({})
        } finally {
          setRefreshing(false)
        }
      }
      refreshData()
    }, [])
  )

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    try {
      forceUpdate({})
    } finally {
      setRefreshing(false)
    }
  }, [])

  const handleCreateNewSet = () => {
    navigation.navigate("CreateObjectSet", {
      editMode: false
    })
  }

  const handleEditSet = (set: ObjectSetType) => {
    navigation.navigate("CreateObjectSet", {
      editMode: true,
      setId: set.id,
      setData: {
        name: set.name,
        description: set.description || "",
        objects: set.objects ? Array.from(set.objects) : [],
        category: set.category || "",
        practiceMode: (set.practiceMode || "sequential") as "sequential" | "random" | "adaptive",
        isActive: set.isActive ?? true
      }
    })
  }

  const renderSetItem = ({ item: set }: { item: ObjectSetType }) => {
    const setObjects = Array.from(set.objects || []).slice(0, 8)
    const assignedSets = getAssignedSets()
    const isAssigned = assignedSets.some(assignedSet => assignedSet.id === set.id)
    
    return (
      <View style={$setCard}>
        <View style={$setHeader}>
          <View style={$headerLeft}>
            <Text text={set.name} preset="subheading" style={$setName} />
            <Text text={`${set.objects?.length || 0} objects`} style={$objectCount} />
          </View>
          <View style={$headerRight}>
            <Text 
              text={set.isDefault ? "Default Set" : "Custom Set"} 
              style={[$setType, set.isDefault && $defaultSetType]} 
            />
            {isAssigned && (
              <Text 
                text="Assigned" 
                style={[$setType, $assignedType]} 
              />
            )}
          </View>
        </View>

        <View style={$metadataRow}>
          <Text text={`Mode: ${set.practiceMode}`} style={$metadata} />
          <Text text={`Category: ${set.category || 'General'}`} style={$metadata} />
        </View>
        
        <View style={$objectGrid}>
          {setObjects.map(object => {
            if (!object || !object.id) return null
            return (
              <View key={object.id} style={$objectPreview}>
                <Image 
                  source={object.isDefault ? object.uri : { uri: object.uri }}
                  style={$objectImage} 
                  resizeMode="contain"
                />
                <Text text={object.name} style={$objectName} numberOfLines={1} />
              </View>
            )
          })}
        </View>

        <View style={$buttonRow}>
          <Button
            text="Edit"
            preset="default"
            style={$button}
            onPress={() => handleEditSet(set)}
          />
          <Button
            text={isAssigned ? "Unassign" : "Assign"}
            preset="default"
            style={$button}
            onPress={() => isAssigned ? unassignSet(set) : assignSet(set)}
          />
        </View>
      </View>
    )
  }

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$container}
      safeAreaEdges={["bottom"]}
    >
      <View style={$toolbar}>
        <Button
          text="Create New Set"
          preset="default"
          style={$createButton}
          onPress={handleCreateNewSet}
        />
        <Button
          text="Import Set"
          preset="default"
          style={$importButton}
        />
      </View>

      <FlatList
        data={objectSets.slice()}
        renderItem={renderSetItem}
        keyExtractor={item => item.id}
        contentContainerStyle={$listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
          />
        }
      />
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $listContent: ViewStyle = {
  padding: spacing.medium,
  gap: spacing.medium,
}

const $setCard: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.medium,
  gap: spacing.medium,
}

const $setHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $headerLeft: ViewStyle = {
  flex: 1,
}

const $headerRight: ViewStyle = {
  alignItems: "flex-end",
}

const $setName: ViewStyle = {
  flex: 1,
}

const $objectCount: TextStyle = {
  color: colors.textDim,
}

const $objectGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  gap: spacing.tiny,
  padding: spacing.tiny,
}

const $objectPreview: ViewStyle = {
  width: "23%", // Slightly less than 25% to account for gap
  alignItems: "center",
  padding: spacing.tiny,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  marginBottom: spacing.tiny,
}

const $objectImage: ImageStyle = {
  width: 50,
  height: 50,
  marginBottom: spacing.tiny,
}

const $objectName: TextStyle = {
  fontSize: 10,
  textAlign: "center",
  width: "100%",
}

const $buttonRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: spacing.small,
}

const $button: ViewStyle = {
  minWidth: 100,
}

const $setType: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
}

const $defaultSetType: TextStyle = {
  color: colors.palette.accent500,
}

const $metadataRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.small,
}

const $metadata: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
}

const $description: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
  marginTop: spacing.small,
}

const $toolbar: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  padding: spacing.medium,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral300,
}

const $createButton: ViewStyle = {
  flex: 1,
  marginRight: spacing.small,
}

const $importButton: ViewStyle = {
  flex: 1,
  marginLeft: spacing.small,
}

const $assignedType: TextStyle = {
  backgroundColor: colors.palette.neutral200,
  color: colors.palette.neutral600,
} 