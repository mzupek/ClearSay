import React, { FC } from "react"
import { ViewStyle, View, Switch, TextStyle, TouchableOpacity } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AppStackParamList } from "app/navigators/AppNavigator"

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

export const RecognitionSettingsScreen: FC = observer(function RecognitionSettingsScreen() {
  const { recognitionPractice: store } = useStores()
  const navigation = useNavigation<NavigationProp>()

  const handleManageObjectSets = () => {
    navigation.navigate("ManageObjectSets", { interactiveType: "Recognition" })
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={$container}
      safeAreaEdges={["top", "bottom"]}
    >
      <View style={$section}>
        <Text text="Object Sets" preset="heading" style={$sectionTitle} />
        <View style={$assignedSetsContainer}>
          {store.assignedSets.length === 0 ? (
            <Text 
              text="No sets assigned for practice" 
              style={$noSetsText} 
            />
          ) : (
            store.assignedSets.map(set => (
              <View key={set.id} style={$assignedSetItem}>
                <View style={$assignedSetInfo}>
                  <Text text={set.name} style={$assignedSetName} />
                  <Text text={`${set.objects.length} objects`} style={$assignedSetDetails} />
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    store.setAssignedSets([])
                  }}
                  style={$unassignButton}
                >
                  <Text text="✕" style={$unassignText} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        <Button
          text="Manage Object Sets"
          preset="default"
          style={$button}
          onPress={handleManageObjectSets}
        />
      </View>

      <View style={$section}>
        <Text text="Practice Settings" preset="heading" style={$sectionTitle} />
        
        <View style={$settingRow}>
          <Text text="Announce Choices" />
          <Switch
            value={store.settings.announceChoices}
            onValueChange={(value) => store.updateSettings({ announceChoices: value })}
          />
        </View>

        <View style={$settingRow}>
          <Text text="Announce Correctness" />
          <Switch
            value={store.settings.announceCorrectness}
            onValueChange={(value) => store.updateSettings({ announceCorrectness: value })}
          />
        </View>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.medium,
  backgroundColor: colors.background,
}

const $section: ViewStyle = {
  marginBottom: spacing.large,
}

const $sectionTitle: TextStyle = {
  marginBottom: spacing.medium,
}

const $settingRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.small,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral300,
}

const $button: ViewStyle = {
  marginTop: spacing.small,
}

const $assignedSetsContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  padding: spacing.small,
  marginBottom: spacing.small,
}

const $noSetsText: TextStyle = {
  textAlign: "center",
  color: colors.textDim,
  padding: spacing.small,
}

const $assignedSetItem: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 6,
  padding: spacing.small,
  marginBottom: spacing.tiny,
}

const $assignedSetInfo: ViewStyle = {
  flex: 1,
}

const $assignedSetName: TextStyle = {
  fontWeight: "bold",
}

const $assignedSetDetails: TextStyle = {
  fontSize: 12,
  color: colors.textDim,
}

const $unassignButton: ViewStyle = {
  padding: spacing.tiny,
  marginLeft: spacing.small,
}

const $unassignText: TextStyle = {
  color: colors.textDim,
  fontSize: 16,
} 