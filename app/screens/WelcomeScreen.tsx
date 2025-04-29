import React, { FC } from "react"
import { TextStyle, View, ViewStyle, TouchableOpacity, Image, ImageStyle, ScrollView } from "react-native"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { AppStackParamList } from "app/navigators/AppNavigator"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

export const WelcomeScreen: FC = observer(function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>()
  const store = useStores()

  return (
    <Screen 
      preset="scroll" 
      safeAreaEdges={["top"]} 
      contentContainerStyle={$container}
      ScrollViewProps={{
        showsVerticalScrollIndicator: true,
        bounces: true,
      }}
    >
      <View style={$header}>
        <Text text="Welcome to ClearSay" preset="heading" style={$title} />
        <Text
          text="Choose a practice mode to get started"
          preset="subheading"
          style={$subtitle}
        />
      </View>

      <View style={$mainContent}>
        <View style={$practiceSection}>
          <Text text="Practice Activities" preset="subheading" style={$sectionTitle} />
          <View style={$buttonContainer}>
            <View style={$buttonGroup}>
              <TouchableOpacity
                onPress={() => navigation.navigate("MainTabs")}
                style={$buttonWrapper}
              >
                <Image 
                  source={require("../../assets/images/LettersAndNumbers.png")}
                  style={$buttonImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text 
                text="Visual Scanning" 
                style={$buttonText}
              />
            </View>
            
            <View style={$buttonGroup}>
              <TouchableOpacity
                onPress={() => navigation.navigate("ObjectTabs", { screen: "ObjectPractice" })}
                style={$buttonWrapper}
              >
                <Image 
                  source={require("../../assets/images/ImageRecognition.png")}
                  style={$buttonImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text 
                text="Image Recognition" 
                style={$buttonText}
              />
            </View>

            <View style={$buttonGroup}>
              <TouchableOpacity
                onPress={() => navigation.navigate("PictureToWordPractice")}
                style={$buttonWrapper}
              >
                <Image 
                  source={require("../../assets/images/ImageRecognition.png")}
                  style={$buttonImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text 
                text="Picture to Word" 
                style={$buttonText}
              />
            </View>

            <View style={$buttonGroup}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Recognition")}
                style={$buttonWrapper}
              >
                <Image 
                  source={require("../../assets/images/ImageRecognition.png")}
                  style={$buttonImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text 
                text="Name the Picture" 
                style={$buttonText}
              />
            </View>
          </View>
        </View>

        <View style={$objectsSection}>
          <Text text="Object Sets" preset="subheading" style={$sectionTitle} />
          <View style={$objectSetButtons}>
            <TouchableOpacity
              style={[$setCard, $newSetCard]}
              onPress={() => navigation.navigate("CreateObjectSet")}
            >
              <Text text="+ Create New Set" style={$newSetText} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[$setCard, $manageSetCard]}
              onPress={() => navigation.navigate("ManageObjectSets", {})}
            >
              <Text text="Manage Sets" style={$newSetText} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

    
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.large,
  minHeight: "200%",
  flexGrow: 1,
}

const $header: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.huge,
}

const $title: TextStyle = {
  marginBottom: spacing.small,
}

const $subtitle: TextStyle = {
  color: colors.textDim,
}

const $mainContent: ViewStyle = {
  flex: 1,
  gap: spacing.extraLarge,
  paddingBottom: spacing.extraLarge * 2,
}

const $practiceSection: ViewStyle = {
  gap: spacing.large,
}

const $objectsSection: ViewStyle = {
  gap: spacing.large,
}

const $sectionTitle: TextStyle = {
  fontSize: 20,
  marginBottom: spacing.medium,
}

const $buttonContainer: ViewStyle = {
  gap: spacing.medium,
}

const $buttonGroup: ViewStyle = {
  alignItems: "center",
  gap: spacing.medium,
}

const $buttonWrapper: ViewStyle = {
  width: 300,
  height: 200,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
}

const $buttonImage: ImageStyle = {
  width: "100%",
  height: "100%",
}

const $buttonText: TextStyle = {
  color: colors.text,
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  marginTop: spacing.extraSmall,
}

const $objectSetButtons: ViewStyle = {
  flexDirection: "row",
  gap: spacing.medium,
  justifyContent: "space-between",
  paddingHorizontal: spacing.small,
}

const $setCard: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.medium,
  width: "48%",
  height: 120,
  justifyContent: "center",
}

const $newSetCard: ViewStyle = {
  backgroundColor: colors.palette.neutral300,
  justifyContent: "center",
  alignItems: "center",
}

const $manageSetCard: ViewStyle = {
  backgroundColor: colors.palette.neutral300,
  justifyContent: "center",
  alignItems: "center",
}

const $newSetText: TextStyle = {
  fontSize: 16,
  color: colors.palette.neutral800,
  textAlign: "center",
}

const $button: ViewStyle = {
  minHeight: 50,
}