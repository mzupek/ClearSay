import React, { useState } from "react"
import { View, ViewStyle, ScrollView, Alert, TextStyle, Image, ImageStyle } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { useNavigation } from "@react-navigation/native"

export const ObjectSetScreen = observer(function ObjectSetScreen() {
  const { objectSetStore, objectStore } = useStores()
  const navigation = useNavigation()
  const [selectedSet, setSelectedSet] = useState(null)

  const getObjectsForSet = (set) => {
    return set.objectIds.map(id => objectStore.objects.find(obj => obj.id === id)).filter(Boolean)
  }

  const handleCreateSet = () => {
    Alert.prompt(
      "New Object Set",
      "Enter a name for the new set:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: (name?: string) => {
            if (name) {
              objectSetStore.addSet({
                id: Date.now().toString(),
                name: name.trim(),
                objectIds: [],
                isActive: true
              })
            }
          }
        }
      ]
    )
  }

  const handleManageObjects = (set) => {
    setSelectedSet(set)
    Alert.alert(
      "Manage Objects",
      "Would you like to add or remove objects?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setSelectedSet(null)
        },
        {
          text: "Add Objects",
          onPress: () => {
            const availableObjects = objectStore.objects.filter(
              obj => !set.objectIds.includes(obj.id)
            )
            if (availableObjects.length === 0) {
              Alert.alert("No Objects Available", "All objects are already in this set.")
              setSelectedSet(null)
              return
            }
            Alert.alert(
              "Select Objects",
              "Choose objects to add:",
              availableObjects.map(obj => ({
                text: obj.name,
                onPress: () => {
                  objectSetStore.addObjectToSet(set.id, obj.id)
                  setSelectedSet(null)
                }
              }))
            )
          }
        },
        {
          text: "Remove Objects",
          onPress: () => {
            const setObjects = getObjectsForSet(set)
            if (setObjects.length === 0) {
              Alert.alert("No Objects", "This set is empty.")
              setSelectedSet(null)
              return
            }
            Alert.alert(
              "Select Objects",
              "Choose objects to remove:",
              setObjects.map(obj => ({
                text: obj.name,
                onPress: () => {
                  objectSetStore.removeObjectFromSet(set.id, obj.id)
                  setSelectedSet(null)
                }
              }))
            )
          }
        }
      ]
    )
  }

  return (
    <Screen preset="scroll">
      <View style={$container}>
        <View style={$header}>
          <Text preset="heading" text="Object Sets" style={$title} />
          <Button
            text="⬅️ Exit"
            onPress={() => navigation.goBack()}
            style={[$backButton, $button]}
            textStyle={$whiteText}
          />
        </View>
        <Button
          text="Create New Set"
          onPress={handleCreateSet}
          style={$createButton}
          textStyle={$whiteText}
        />
        <ScrollView style={$scrollView}>
          {objectSetStore.setList.map((set) => (
            <View key={set.id} style={$setContainer}>
              <View style={$setInfo}>
                <Text text={set.name} style={$setName} />
                <Text 
                  text={`${set.objectIds.length} objects`} 
                  style={$setCount}
                />
              </View>
              <ScrollView horizontal style={$objectsRow}>
                {getObjectsForSet(set).map((obj) => (
                  <View key={obj.id} style={$objectContainer}>
                    <Image 
                      source={obj.isDefault ? obj.uri : { uri: obj.uri.uri }}
                      style={$objectImage}
                      resizeMode="cover"
                    />
                    <Text text={obj.name} style={$objectName} />
                  </View>
                ))}
              </ScrollView>
              <View style={$setActions}>
                <Button
                  text="Manage Objects"
                  onPress={() => handleManageObjects(set)}
                  style={[$manageButton, $button]}
                  textStyle={$whiteText}
                />
                {/* <Button
                  text={set.isActive ? "Active" : "Inactive"}
                  onPress={() => objectSetStore.toggleSetActive(set.id)}
                  style={[
                    $statusButton,
                    set.isActive ? $activeButton : $inactiveButton
                  ]}
                /> */}
                {!set.isDefault && (
                  <Button
                    text="Delete"
                    onPress={() => objectSetStore.removeSet(set.id)}
                    style={[$deleteButton, $button]}
                    textStyle={$whiteText}
                  />
                )}
              </View>
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

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.large,
}

const $title: TextStyle = {
  marginBottom: spacing.large,
  textAlign: "center",
}

const $button: ViewStyle = {
  marginBottom: spacing.medium,
  padding: 10,
}

const $scrollView: ViewStyle = {
  flex: 1,
}

const $setContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.medium,
  marginBottom: spacing.medium,
}

const $setInfo: ViewStyle = {
  marginBottom: spacing.small,
}

const $setName: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: spacing.tiny,
}

const $setCount: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral600,
}

const $setActions: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: spacing.small,
}

const $statusButton: ViewStyle = {
  minWidth: 100,
}

const $activeButton: ViewStyle = {
  backgroundColor: colors.palette.neutral500,
}

const $inactiveButton: ViewStyle = {
  backgroundColor: colors.palette.neutral400,
}

const $deleteButton: ViewStyle = {
  minWidth: 80,
  backgroundColor: colors.palette.angry500,
}

const $backButton: ViewStyle = {
  minWidth: 80,
  backgroundColor: colors.palette.angry500,
}

const $objectsRow: ViewStyle = {
  flexDirection: "row",
  marginVertical: spacing.small,
}

const $objectContainer: ViewStyle = {
  alignItems: "center",
  marginRight: spacing.small,
  width: 80,
}

const $objectImage: ImageStyle = {
  width: 60,
  height: 60,
  borderRadius: 4,
  marginBottom: spacing.tiny,
}

const $objectName: TextStyle = {
  fontSize: 12,
  textAlign: "center",
}

const $manageButton: ViewStyle = {
  flex: 1,
  minWidth: 150,
  backgroundColor: colors.palette.neutral800,
  alignContent: 'flex-start',
}

const $whiteText: TextStyle = {
  color: 'white', 
  fontWeight: 'bold',
  fontSize: 22,
  lineHeight: 22,
}

const $createButton: ViewStyle = {
  marginBottom: spacing.medium,
  padding: 10,
  minHeight: 80,
  shadowColor: 'black',
  shadowOffset: { width: 5, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 5,
  elevation: 5,
  backgroundColor: 'green',
}