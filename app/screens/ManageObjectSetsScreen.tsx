import React, { FC } from "react"
import { ViewStyle, View, TouchableOpacity, Image, ImageStyle, FlatList, TextStyle } from "react-native"
import { Button, Screen, Text } from "../components"
import { colors, spacing } from "../theme"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { ObjectSet } from "app/models/ObjectSetModel"
import { ObjectModel } from "app/models/ObjectModel"
import { Instance } from "mobx-state-tree"

export const ManageObjectSetsScreen: FC = observer(function ManageObjectSetsScreen() {
  const { objectSets, objects } = useStores()

  console.log("ManageObjectSetsScreen - objectSets:", objectSets.length)
  console.log("ManageObjectSetsScreen - objects:", objects.length)

  const renderSetItem = ({ item: set }: { item: ObjectSet }) => {
    try {
      const setObjects = Array.from(set.objects || []).slice(0, 8)
      
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
                  <Image source={object.uri} style={$objectImage} resizeMode="contain" />
                  <Text text={object.name} style={$objectName} numberOfLines={1} />
                </View>
              )
            })}
          </View>

          <View style={$setActions}>
            <Button
              text="Assign"
              preset="default"
              style={$actionButton}
            />
            <Button
              text="Edit"
              preset="default"
              style={$actionButton}
            />
            <Button
              text="Practice"
              preset="default"
              style={$actionButton}
            />
          </View>

          {set.description && (
            <Text
              text={set.description}
              style={$description}
              numberOfLines={2}
            />
          )}
        </View>
      )
    } catch (error) {
      console.error("Error rendering set:", error)
      return null
    }
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
        />
        <Button
          text="Import Set"
          preset="default"
          style={$importButton}
        />
      </View>

      <FlatList
        data={objectSets}
        renderItem={renderSetItem}
        keyExtractor={item => item.id}
        contentContainerStyle={$listContent}
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

const $setActions: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: spacing.small,
}

const $actionButton: ViewStyle = {
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