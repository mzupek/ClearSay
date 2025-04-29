import React from "react"
import { View, ViewStyle, Image, ImageStyle, Alert, TextStyle, TouchableOpacity } from "react-native"
import { Screen, Text, Button, Icon } from "app/components"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { speak } from "app/utils/speech"
import { ObjectTabParamList } from "app/navigators/ObjectNavigator"
import { ObjectPracticeTabParamList } from "app/navigators/ObjectPracticeNavigator"
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import { NativeStackScreenProps } from "@react-navigation/native-stack"

type NavigationProps = NativeStackNavigationProp<ObjectTabParamList> & BottomTabNavigationProp<ObjectPracticeTabParamList>

interface ObjectPracticeScreenProps extends NativeStackScreenProps<ObjectTabParamList, "ObjectPractice"> {}

export const ObjectPracticeScreen = observer(function ObjectPracticeScreen(props: ObjectPracticeScreenProps) {
  const { recognitionPractice: store } = useStores()
  const navigation = useNavigation<NavigationProps>()

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])

  // Show instructions if no sets are assigned
  if (!store.assignedSets || store.assignedSets.length === 0) {
    return (
      <Screen
        preset="fixed"
        contentContainerStyle={$screenContentContainer}
        style={$root}
        safeAreaEdges={["top", "bottom"]}
      >
        <View style={$instructionsContainer}>
          <Text text="No Object Sets Assigned" preset="heading" style={$instructionsTitle} />
          <Text text="To start practicing:" preset="subheading" style={$instructionsSubtitle} />
          <View style={$instructionsList}>
            <Text text="1. Go to Settings" style={$instructionText} />
            <Text text="2. Select 'Manage Object Sets'" style={$instructionText} />
            <Text text="3. Choose the sets you want to practice with" style={$instructionText} />
            <Text text="4. Return here to start practicing" style={$instructionText} />
          </View>
          <Button
            text="Go to Settings ⚙️"
            onPress={() => navigation.navigate("Settings" as any)}
            style={[$button, $ordersetsButton]}
            textStyle={$whiteText}
          />
        </View>
      </Screen>
    )
  }

  // If not active, show start screen
  if (!store.isActive) {
    return (
      <Screen
        preset="fixed"
        contentContainerStyle={$screenContentContainer}
        style={$root}
        safeAreaEdges={["top"]}
      >
        <View style={$startContainer}>
          <Text text="Ready to Practice" style={$noSetTitle} />
          <Text text={`${store.assignedSets.length} set(s) with ${store.availableObjects.length} objects`} style={$noSetMessage} />
          <View style={$buttonContainer}>
            <Button
              text="Start Practice ➡️"
              onPress={() => store.startSession()}
              style={[$button, $practiceButton]}
              textStyle={$whiteText}
            />
            <Button
              text="Manage Sets ⚙️"
              onPress={() => navigation.navigate("Settings" as any)}
              style={[$button, $ordersetsButton]}
              textStyle={$whiteText}
            />
          </View>
        </View>
      </Screen>
    )
  }

  // Show practice session
  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$screenContentContainer}
      style={$root}
      safeAreaEdges={["top"]}
    >
      <View style={$header}>
        <TouchableOpacity 
          style={$backButton} 
          onPress={() => {
            Alert.alert(
              "End Session",
              "Are you sure you want to end this practice session?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "End Session", 
                  style: "destructive",
                  onPress: () => {
                    store.endSession()
                    navigation.goBack()
                  }
                }
              ]
            )
          }}
        >
          <Icon icon="back" color={colors.text} size={24} />
        </TouchableOpacity>
        <Text text="Image Recognition" style={$title} />
        <View style={$backButton} />
      </View>

      <View style={$practiceContainer}>
        {store.currentObjects.length > 0 && (
          <>
            <View style={$flashCard}>
              <View style={$imageContainer}>
                <Image 
                  source={store.currentObjects[0].isDefault ? 
                    store.currentObjects[0].uri : 
                    { uri: store.currentObjects[0].uri }}
                  style={$image}
                  resizeMode="contain"
                />
              </View>
              <View style={$textContainer}>
                <Text text={store.currentObjects[0].name} style={$wordText} />
                <Text 
                  text={`Session Score: ${store.correctAnswers}/${store.totalAttempts}`}
                  style={$scoreText}
                />
              </View>
            </View>
            <View style={$buttonsContainer}>
              <View style={$actionButtons}>
                <Button
                  text="Say Word 🎤"
                  onPress={() => speak(store.currentObjects[0].name)}
                  style={[$button, $sayButton]}
                  textStyle={$whiteText}
                />
                <Button
                  text="Spell Word 🐝"
                  onPress={() => {
                    const word = store.currentObjects[0].name.toLowerCase()
                    const spellOut = word.split('').join('... ')
                    speak(spellOut)
                  }}
                  style={[$button, $spellButton]}
                  textStyle={$whiteText}
                />
              </View>
              <View style={$responseButtons}>
                <Button
                  text="Got it Wrong ❌"
                  onPress={() => store.recordIncorrectAttempt()}
                  style={[$button, $wrongButton]}
                  textStyle={$whiteText}
                />
                <Button
                  text="Got it Right ✅"
                  onPress={() => store.recordCorrectAttempt()}
                  style={[$button, $rightButton]}
                  textStyle={$whiteText}
                />
              </View>
            </View>
          </>
        )}
      </View>
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  flex: 1,
  paddingTop: spacing.small,
}

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.extraSmall,
  paddingHorizontal: spacing.small,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  backgroundColor: colors.background,
  height: 44,
}

const $startContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  gap: spacing.medium,
  paddingHorizontal: spacing.medium,
}

const $practiceContainer: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.medium,
}

const $flashCard: ViewStyle = {
  backgroundColor: colors.background,
  borderRadius: 16,
  padding: spacing.medium,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  alignItems: "center",
  width: "100%",
  maxWidth: 400,
  marginVertical: spacing.medium,
}

const $imageContainer: ViewStyle = {
  width: "100%",
  aspectRatio: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  overflow: "hidden",
  marginBottom: spacing.medium,
}

const $textContainer: ViewStyle = {
  alignItems: "center",
  width: "100%",
  paddingVertical: spacing.small,
}

const $buttonsContainer: ViewStyle = {
  width: "100%",
  gap: spacing.medium,
  paddingBottom: spacing.large,
}

const $actionButtons: ViewStyle = {
  flexDirection: "row",
  gap: spacing.medium,
  justifyContent: "center",
  width: "100%",
  marginBottom: spacing.medium,
}

const $image: ImageStyle = {
  width: "80%",
  height: "80%",
}

const $wordText: TextStyle = {
  fontSize: 48,
  fontWeight: "bold",
  textAlign: "center",
  color: colors.text,
  includeFontPadding: false,
  lineHeight: 56,
}

const $responseButtons: ViewStyle = {
  flexDirection: "row",
  gap: spacing.medium,
  justifyContent: "center",
  width: "100%",
}

const $wrongButton: ViewStyle = {
  backgroundColor: colors.palette.angry500,
  flex: 1,
  minHeight: 50,
}

const $rightButton: ViewStyle = {
  backgroundColor: colors.palette.secondary500,
  flex: 1,
  minHeight: 50,
}

const $scoreText: TextStyle = {
  fontSize: 16,
  color: colors.text,
}

const $button: ViewStyle = {
  borderRadius: 12,
  paddingVertical: spacing.medium,
  paddingHorizontal: spacing.medium,
  minHeight: 50,
}

const $sayButton: ViewStyle = {
  backgroundColor: colors.palette.accent500,
  flex: 1,
}

const $spellButton: ViewStyle = {
  backgroundColor: colors.palette.secondary500,
  flex: 1,
}

const $whiteText: TextStyle = {
  color: colors.palette.neutral100,
  fontWeight: "bold",
  fontSize: 18,
  textAlign: "center",
}

const $practiceButton: ViewStyle = {
  backgroundColor: colors.palette.secondary500,
  borderRadius: 12,
  padding: spacing.medium,
  minHeight: 50,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  width: "100%",
}

const $ordersetsButton: ViewStyle = {
  backgroundColor: colors.palette.accent500,
  borderRadius: 12,
  padding: spacing.medium,
  minHeight: 50,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  width: "100%",
}

const $noSetTitle: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: spacing.small,
  color: colors.text,
}

const $noSetMessage: TextStyle = {
  fontSize: 16,
  textAlign: "center",
  marginBottom: spacing.large,
  color: colors.textDim,
}

const $title: TextStyle = {
  fontSize: 20,
  color: colors.text,
  textAlign: "center",
  flex: 1,
}

const $buttonContainer: ViewStyle = {
  gap: spacing.medium,
  marginTop: spacing.large,
  width: "100%",
  paddingHorizontal: spacing.large,
}

const $backButton: ViewStyle = {
  padding: spacing.extraSmall,
  width: 44,
  height: 44,
  justifyContent: "center",
  alignItems: "center",
}

const $instructionsList: ViewStyle = {
  marginBottom: spacing.large,
}

const $instructionText: TextStyle = {
  marginVertical: spacing.tiny,
  textAlign: "center",
}

const $instructionsContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.large,
}

const $instructionsTitle: TextStyle = {
  marginBottom: spacing.medium,
  textAlign: "center",
}

const $instructionsSubtitle: TextStyle = {
  marginBottom: spacing.medium,
  textAlign: "center",
}
