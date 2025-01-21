import React from "react"
import { TextStyle, View, ViewStyle, TouchableOpacity, Image, ImageStyle } from "react-native"
import { Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { useNavigation } from "@react-navigation/native"

export function WelcomeScreen() {
  const navigation = useNavigation()

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text text="Welcome to ClearSay" preset="heading" style={$title} />
      
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
            text="Letter & Number Practice" 
            style={$buttonText}
          />
        </View>
        
        <View style={$buttonGroup}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ObjectTabs")}
            style={$buttonWrapper}
          >
            <Image 
              source={require("../../assets/images/ImageRecognition.png")}
              style={$buttonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text 
            text="Custom Objects Practice" 
            style={$buttonText}
          />
        </View>
      </View>
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.large,
}

const $title: TextStyle = {
  marginBottom: spacing.extraLarge,
  textAlign: "center",
}

const $buttonContainer: ViewStyle = {
  gap: spacing.extraLarge,
  alignContent: "center",
  justifyContent: "center",
  alignItems: "center",
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