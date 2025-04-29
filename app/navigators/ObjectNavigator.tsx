import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { ObjectPracticeScreen } from "app/screens/ObjectPracticeScreen"
import { ObjectProgressScreen } from "app/screens/ObjectProgressScreen"
import { ObjectManagerScreen } from "app/screens/ObjectManagerScreen"
import { CreateObjectSetScreen } from "app/screens/CreateObjectSetScreen"
import { ManageObjectSetsScreen } from "app/screens/ManageObjectSetsScreen"
import { colors } from "app/theme"
import { Icon } from "app/components"
import { ObjectModel, ObjectSetModel } from "app/models"
import { Instance } from "mobx-state-tree"
import { PictureToWordNavigator } from "./PictureToWordNavigator"

export type InteractiveType = "PictureToWord" | "WordToPicture" | "Spelling" | "Pronunciation"

export type ObjectTabParamList = {
  ObjectPractice: undefined
  ObjectProgress: undefined
  ObjectManager: undefined
  PictureToWordPractice: undefined
  CreateObjectSet: {
    editMode?: boolean
    setId?: string
    setData?: {
      name: string
      description: string
      objects: Instance<typeof ObjectModel>[]
      category?: string
      practiceMode?: "sequential" | "random" | "adaptive"
      isActive?: boolean
    }
  }
  ManageObjectSets: {
    interactiveType?: InteractiveType
  }
}

const Stack = createNativeStackNavigator<ObjectTabParamList>()

export const ObjectNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ObjectManager" component={ObjectManagerScreen} />
      <Stack.Screen name="ObjectPractice" component={ObjectPracticeScreen} />
      <Stack.Screen 
        name="PictureToWordPractice" 
        component={PictureToWordNavigator}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="CreateObjectSet" 
        component={CreateObjectSetScreen}
        options={{
          headerShown: true,
          title: "Create Object Set",
          headerBackTitle: "Back"
        }}
      />
      <Stack.Screen 
        name="ManageObjectSets" 
        component={ManageObjectSetsScreen}
        options={{
          headerShown: true,
          title: "Manage Object Sets",
          headerBackTitle: "Back"
        }}
      />
    </Stack.Navigator>
  )
} 