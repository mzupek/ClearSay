import React, { useState, useEffect } from "react"
import { View, ViewStyle, TextStyle, Image, ScrollView, Alert, TouchableOpacity, ImageStyle } from "react-native"
import { Screen, Text, Button, TextField, Icon } from "app/components"
import { spacing } from "app/theme"
import { colors } from "app/theme/colors"
import { observer } from "mobx-react-lite"
import * as ImagePicker from 'expo-image-picker'
import { useStores } from "app/models"
import { useNavigation } from "@react-navigation/native"
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist"
import { Instance } from "mobx-state-tree"
import { ObjectModel } from "app/models/ObjectModel"
import { ObjectSetModel } from "app/models/ObjectSetModel"

interface ObjectType extends Instance<typeof ObjectModel> {}
interface ObjectSetType extends Instance<typeof ObjectSetModel> {}

export const ObjectManagerScreen = observer(function ObjectManagerScreen() {
  const navigation = useNavigation()
  const store = useStores()
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [showSetDetails, setShowSetDetails] = useState(false)

  // Get the currently selected set
  const selectedSet = selectedSetId ? store.objectSets.find(s => s.id === selectedSetId) : null

  // Get unique categories from all objects
  const categories = Array.from(
    new Set(store.objectList.map(obj => obj.category).filter(Boolean))
  )

  // Filter objects based on search query and category
  const filteredObjects = store.objectList.filter(obj => {
    const matchesSearch = 
      obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      obj.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !categoryFilter || obj.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const handleCreateSet = () => {
    Alert.prompt(
      "New Object Set",
      "Enter a name for the new set:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Next",
          onPress: (name?: string) => {
            if (name) {
              Alert.prompt(
                "Set Description",
                "Enter a description (optional):",
                [
                  { text: "Skip", style: "cancel",
                    onPress: () => createSet(name.trim(), "") },
                  {
                    text: "Save",
                    onPress: (description?: string) => {
                      createSet(name.trim(), description || "")
                    }
                  }
                ]
              )
            }
          }
        }
      ]
    )
  }

  const createSet = (name: string, description: string) => {
    const newSet = store.addObjectSet({
      name,
      description,
      objects: [],
      isDefault: false,
      practiceMode: "sequential",
      isActive: true
    })
    setSelectedSetId(newSet.id)
    setShowSetDetails(true)
  }

  const handleEditSet = () => {
    if (!selectedSet) return

    Alert.alert(
      "Edit Set",
      "What would you like to edit?",
      [
        {
          text: "Name",
          onPress: () => {
            Alert.prompt(
              "Edit Name",
              "Enter new name:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Save",
                  onPress: (newName?: string) => {
                    if (newName) {
                      store.updateObjectSet(selectedSet.id, { name: newName.trim() })
                    }
                  }
                }
              ],
              "plain-text",
              selectedSet.name
            )
          }
        },
        {
          text: "Description",
          onPress: () => {
            Alert.prompt(
              "Edit Description",
              "Enter new description:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Save",
                  onPress: (newDescription?: string) => {
                    store.updateObjectSet(selectedSet.id, { 
                      description: newDescription || "" 
                    })
                  }
                }
              ],
              "plain-text",
              selectedSet.description
            )
          }
        },
        {
          text: "Category",
          onPress: () => {
            Alert.alert(
              "Select Category",
              "Choose a category:",
              [
                ...categories.map(category => ({
                  text: category,
                  onPress: () => {
                    store.updateObjectSet(selectedSet.id, { category })
                  }
                })),
                {
                  text: "New Category",
                  onPress: () => {
                    Alert.prompt(
                      "New Category",
                      "Enter new category name:",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Save",
                          onPress: (newCategory?: string) => {
                            if (newCategory) {
                              store.updateObjectSet(selectedSet.id, { 
                                category: newCategory.trim() 
                              })
                            }
                          }
                        }
                      ]
                    )
                  }
                },
                { text: "Cancel", style: "cancel" }
              ]
            )
          }
        },
        {
          text: "Practice Mode",
          onPress: () => {
            Alert.alert(
              "Select Practice Mode",
              "Choose how objects should be presented during practice:",
              [
                {
                  text: "Sequential",
                  onPress: () => {
                    store.updateObjectSet(selectedSet.id, {
                      practiceMode: "sequential"
                    })
                  }
                },
                {
                  text: "Random",
                  onPress: () => {
                    store.updateObjectSet(selectedSet.id, {
                      practiceMode: "random"
                    })
                  }
                },
                {
                  text: "Adaptive",
                  onPress: () => {
                    store.updateObjectSet(selectedSet.id, {
                      practiceMode: "adaptive"
                    })
                  }
                },
                { text: "Cancel", style: "cancel" }
              ]
            )
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    )
  }

  const handleReorderObjects = ({ data }: { data: ObjectType[] }) => {
    if (!selectedSet) return
    const objectIds = data.map(obj => obj.id)
    store.reorderObjectsInSet(selectedSet.id, objectIds)
  }

  const handleEditObject = (object: any) => {
    Alert.alert(
      "Edit Object",
      "What would you like to edit?",
      [
        {
          text: "Name",
          onPress: () => {
            Alert.prompt(
              "Edit Name",
              "Enter new name:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Save",
                  onPress: (newName?: string) => {
                    if (newName) {
                      store.updateObject(object.id, { name: newName.trim() })
                    }
                  }
                }
              ],
              "plain-text",
              object.name
            )
          }
        },
        {
          text: "Tags",
          onPress: () => {
            Alert.prompt(
              "Edit Tags",
              "Enter tags (comma-separated):",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Save",
                  onPress: (tagsString?: string) => {
                    if (tagsString) {
                      const tags = tagsString.split(",").map(t => t.trim()).filter(Boolean)
                      store.updateObject(object.id, { tags })
                    }
                  }
                }
              ],
              "plain-text",
              object.tags.join(", ")
            )
          }
        },
        {
          text: "Category",
          onPress: () => {
            Alert.prompt(
              "Edit Category",
              "Enter category:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Save",
                  onPress: (category?: string) => {
                    if (category) {
                      store.updateObject(object.id, { category: category.trim() })
                    }
                  }
                }
              ],
              "plain-text",
              object.category
            )
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    )
  }

  const handleAddObject = () => {
    if (!selectedSet) return
    Alert.prompt(
      "Add Object",
      "Enter object name:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: (name?: string) => {
            if (name) {
              const newObject = store.addObject({
                name: name.trim(),
                uri: "",
                pronunciation: "",
                tags: [],
                difficulty: "medium",
                category: "",
                notes: "",
                isDefault: false,
                practiceMode: "sequential",
                isActive: true
              })
              if (newObject) {
                store.addObjectToSet(selectedSet.id, newObject.id)
              }
            }
          }
        }
      ],
      "plain-text"
    )
  }

  const renderSetSelector = () => (
    <View>
      <ScrollView horizontal style={$setSelector} showsHorizontalScrollIndicator={false}>
        {store.objectSets.map(set => (
          <TouchableOpacity
            key={set.id}
            style={[
              $setTab,
              selectedSetId === set.id && $selectedSetTab
            ]}
            onPress={() => {
              setSelectedSetId(set.id)
              setShowSetDetails(false)
            }}
            onLongPress={() => {
              setSelectedSetId(set.id)
              setShowSetDetails(true)
            }}
          >
            <Text
              text={set.name}
              style={[
                $setText,
                selectedSetId === set.id && $selectedSetText
              ]}
            />
            <Text
              text={`${set.objects.length} objects`}
              style={$setCountText}
            />
            {set.category && (
              <Text
                text={set.category}
                style={$setCategoryText}
              />
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[$setTab, $newSetTab]}
          onPress={handleCreateSet}
        >
          <Text text="+ New Set" style={$newSetText} />
        </TouchableOpacity>
      </ScrollView>
      {selectedSet && showSetDetails && (
        <View style={$setDetails}>
          <Text text={selectedSet.description} style={$setDescription} />
          <View style={$setActions}>
            <Button
              text="Edit Set"
              onPress={handleEditSet}
              style={$editButton}
            />
            <Button
              text={selectedSet.isActive ? "Active" : "Inactive"}
              onPress={() => {
                store.updateObjectSet(selectedSet.id, {
                  isActive: !selectedSet.isActive
                })
              }}
              style={[
                $statusButton,
                selectedSet.isActive ? $activeButton : $inactiveButton
              ]}
            />
          </View>
        </View>
      )}
    </View>
  )

  const renderHeader = () => (
    <View style={$header}>
      <TextField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search objects..."
        style={$searchField}
      />
      <ScrollView 
        horizontal 
        style={$categoryScroll}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            $categoryChip,
            !categoryFilter && $selectedCategoryChip
          ]}
          onPress={() => setCategoryFilter(null)}
        >
          <Text 
            text="All"
            style={[
              $categoryChipText,
              !categoryFilter && $selectedCategoryChipText
            ]}
          />
        </TouchableOpacity>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              $categoryChip,
              categoryFilter === category && $selectedCategoryChip
            ]}
            onPress={() => setCategoryFilter(category)}
          >
            <Text 
              text={category}
              style={[
                $categoryChipText,
                categoryFilter === category && $selectedCategoryChipText
              ]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={$viewModeButton}
        onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
      >
        <Icon
          icon={viewMode === "grid" ? "view" : "components"}
          color={colors.text}
          size={24}
        />
      </TouchableOpacity>
    </View>
  )

  const renderGrid = () => (
    <View style={$grid}>
      {filteredObjects.map(object => (
        <TouchableOpacity
          key={object.id}
          style={$gridItem}
          onPress={() => handleEditObject(object)}
        >
          <Image
            source={object.isDefault ? object.uri : { uri: object.uri.uri }}
            style={$gridImage}
            resizeMode="cover"
          />
          <Text text={object.name} style={$gridItemName} />
          {object.tags.length > 0 && (
            <Text text={object.tags.join(", ")} style={$gridItemTags} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderList = () => (
    <DraggableFlatList
      data={filteredObjects}
      onDragEnd={handleReorderObjects}
      keyExtractor={(item: ObjectType) => item.id}
      renderItem={({ item, drag, isActive }: { 
        item: ObjectType
        drag: () => void
        isActive: boolean 
      }) => (
        <ScaleDecorator>
          <TouchableOpacity
            style={[$listItem, isActive && $listItemActive]}
            onLongPress={drag}
            onPress={() => handleEditObject(item)}
          >
            <Image
              source={item.isDefault ? item.uri : { uri: item.uri }}
              style={$listImage}
              resizeMode="cover"
            />
            <View style={$listItemContent}>
              <Text text={item.name} style={$listItemName} />
              {item.tags.length > 0 && (
                <Text text={item.tags.join(", ")} style={$listItemTags} />
              )}
              {item.category && (
                <Text text={item.category} style={$listItemCategory} />
              )}
            </View>
          </TouchableOpacity>
        </ScaleDecorator>
      )}
    />
  )

  return (
    <Screen preset="fixed" style={$screen}>
      <View style={$container}>
        {renderSetSelector()}
        {renderHeader()}
        <View style={$content}>
          {viewMode === "grid" ? renderGrid() : renderList()}
        </View>
        <TouchableOpacity
          style={$fab}
          onPress={handleAddObject}
        >
          <Text text="+" style={$fabText} />
        </TouchableOpacity>
      </View>
    </Screen>
  )
})

const $screen: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $container: ViewStyle = {
  flex: 1,
  padding: spacing.medium,
}

const $setSelector: ViewStyle = {
  flexGrow: 0,
  marginBottom: spacing.medium,
}

const $setTab: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  padding: spacing.small,
  marginRight: spacing.small,
  minWidth: 120,
}

const $selectedSetTab: ViewStyle = {
  backgroundColor: colors.palette.accent500,
}

const $setText: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
}

const $selectedSetText: TextStyle = {
  color: colors.palette.neutral100,
}

const $setCountText: TextStyle = {
  fontSize: 12,
  color: colors.palette.neutral600,
}

const $setCategoryText: TextStyle = {
  fontSize: 12,
  color: colors.palette.neutral500,
  fontStyle: "italic",
}

const $setDetails: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.small,
  marginTop: spacing.small,
  marginBottom: spacing.medium,
}

const $setDescription: TextStyle = {
  fontSize: 14,
  color: colors.text,
  marginBottom: spacing.small,
}

const $setActions: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: spacing.small,
}

const $editButton: ViewStyle = {
  flex: 1,
  backgroundColor: colors.palette.neutral700,
}

const $statusButton: ViewStyle = {
  flex: 1,
}

const $activeButton: ViewStyle = {
  backgroundColor: colors.palette.accent500,
}

const $inactiveButton: ViewStyle = {
  backgroundColor: colors.palette.neutral500,
}

const $newSetTab: ViewStyle = {
  backgroundColor: colors.palette.neutral300,
}

const $newSetText: TextStyle = {
  color: colors.palette.neutral800,
  textAlign: "center",
}

const $header: ViewStyle = {
  gap: spacing.small,
  marginBottom: spacing.medium,
}

const $searchField: ViewStyle = {
  flex: 1,
}

const $categoryScroll: ViewStyle = {
  flexGrow: 0,
}

const $categoryChip: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderRadius: 16,
  paddingVertical: spacing.tiny,
  paddingHorizontal: spacing.small,
  marginRight: spacing.tiny,
}

const $selectedCategoryChip: ViewStyle = {
  backgroundColor: colors.palette.accent500,
}

const $categoryChipText: TextStyle = {
  fontSize: 12,
  color: colors.text,
}

const $selectedCategoryChipText: TextStyle = {
  color: colors.palette.neutral100,
}

const $viewModeButton: ViewStyle = {
  padding: spacing.tiny,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  alignSelf: "flex-end",
}

const $content: ViewStyle = {
  flex: 1,
}

const $grid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
}

const $gridItem: ViewStyle = {
  width: "48%",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.small,
  marginBottom: spacing.medium,
}

const $gridImage: ImageStyle = {
  width: "100%",
  height: undefined,
  aspectRatio: 1,
  borderRadius: 4,
  marginBottom: spacing.tiny,
}

const $gridItemName: TextStyle = {
  fontSize: 14,
  fontWeight: "bold",
  marginBottom: spacing.tiny,
}

const $gridItemTags: TextStyle = {
  fontSize: 12,
  color: colors.palette.neutral600,
}

const $list: ViewStyle = {
  flex: 1,
}

const $listItem: ViewStyle = {
  flexDirection: "row",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.small,
  marginBottom: spacing.small,
}

const $listItemActive: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  transform: [{ scale: 1.05 }],
}

const $listImage: ImageStyle = {
  width: 60,
  height: 60,
  borderRadius: 4,
}

const $listItemContent: ViewStyle = {
  flex: 1,
  marginLeft: spacing.small,
}

const $listItemName: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: spacing.tiny,
}

const $listItemTags: TextStyle = {
  fontSize: 12,
  color: colors.palette.neutral600,
}

const $listItemCategory: TextStyle = {
  fontSize: 12,
  color: colors.palette.neutral500,
  fontStyle: "italic",
}

const $fab: ViewStyle = {
  position: "absolute",
  right: spacing.large,
  bottom: spacing.large,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: colors.palette.accent500,
  justifyContent: "center",
  alignItems: "center",
  elevation: 4,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
}

const $fabText: TextStyle = {
  fontSize: 24,
  color: colors.palette.neutral100,
  fontWeight: "bold",
} 