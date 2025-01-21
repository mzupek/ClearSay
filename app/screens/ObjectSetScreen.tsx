import React, { useState } from "react"
import { View, ViewStyle, TextStyle, Alert } from "react-native"
import { Screen, Text, Button, TextField } from "app/components"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { useNavigation } from "@react-navigation/native"

export const ObjectSetScreen = observer(function ObjectSetScreen() {
  const navigation = useNavigation()
  const { objectSetStore } = useStores()
  const [showNewSetForm, setShowNewSetForm] = useState(false)
  const [newSetName, setNewSetName] = useState("")
  const [newSetDescription, setNewSetDescription] = useState("")

  const handleCreateSet = () => {
    if (!newSetName.trim()) {
      Alert.alert("Error", "Please enter a name for the set")
      return
    }
    
    objectSetStore.addSet(newSetName.trim(), newSetDescription.trim())
    setNewSetName("")
    setNewSetDescription("")
    setShowNewSetForm(false)
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <View style={$container}>
      <Text text="Object Sets" preset="heading" style={$title} />
        <View style={$header}>
          <Button
            text="← Back"
            onPress={() => navigation.goBack()}
            style={[$button, $backButton]}
          />
        </View>
        
        {!showNewSetForm ? (
          <Button
            text="Create New Set"
            onPress={() => setShowNewSetForm(true)}
            style={$button}
          />
        ) : (
          <View style={$form}>
            <TextField
              value={newSetName}
              onChangeText={setNewSetName}
              placeholder="Set Name"
              style={$input}
            />
            <TextField
              value={newSetDescription}
              onChangeText={setNewSetDescription}
              placeholder="Set Description"
              style={$input}
              multiline
            />
            <View style={$buttonRow}>
              <Button
                text="Cancel"
                onPress={() => setShowNewSetForm(false)}
                style={[$button, $cancelButton]}
              />
              <Button
                text="Create"
                onPress={handleCreateSet}
                style={$button}
              />
            </View>
          </View>
        )}

        <View style={$setList}>
          {objectSetStore.sets.map(set => (
            <View key={set.id} style={$setItem}>
              <View style={$setInfo}>
                <Text text={set.name} style={$setName} />
                <Text text={set.description} style={$setDescription} />
                <Text text={`${set.objects.length} objects`} style={$objectCount} />
              </View>
              <View style={$setActions}>
                <Button
                  text={set.isActive ? "Active" : "Inactive"}
                  onPress={() => objectSetStore.toggleSetActive(set.id)}
                  style={[
                    $statusButton,
                    set.isActive ? $activeButton : $inactiveButton
                  ]}
                />
                <Button
                  text="Delete"
                  onPress={() => {
                    Alert.alert(
                      "Delete Set",
                      "Are you sure you want to delete this set?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Delete", 
                          style: "destructive",
                          onPress: () => objectSetStore.removeSet(set.id)
                        }
                      ]
                    )
                  }}
                  style={[$button, $deleteButton]}
                />
              </View>
            </View>
          ))}
        </View>
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
  alignItems: "center",
  marginBottom: spacing.extraLarge,
}

const $backButton: ViewStyle = {
  maxWidth: 70,
  marginRight: spacing.medium,
}

const $title: TextStyle = {
  flex: 1,
  textAlign: "center",
}

const $form: ViewStyle = {
  gap: spacing.small,
  marginBottom: spacing.extraLarge,
}

const $input: ViewStyle = {
  marginBottom: spacing.small,
}

const $buttonRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: spacing.small,
}

const $button: ViewStyle = {
  flex: 1,
}

const $cancelButton: ViewStyle = {
  backgroundColor: colors.palette.neutral400,
}

const $deleteButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
}

const $setList: ViewStyle = {
  gap: spacing.medium,
}

const $setItem: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.medium,
  borderRadius: 8,
  gap: spacing.small,
}

const $setInfo: ViewStyle = {
  gap: spacing.extraSmall,
}

const $setName: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
}

const $setDescription: TextStyle = {
  fontSize: 14,
  color: colors.textDim,
}

const $objectCount: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
}

const $setActions: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: spacing.small,
}

const $statusButton: ViewStyle = {
  flex: 1,
}

const $activeButton: ViewStyle = {
  backgroundColor: 'green',
}

const $inactiveButton: ViewStyle = {
  backgroundColor: colors.palette.neutral400,
}