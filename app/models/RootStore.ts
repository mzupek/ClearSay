import { Instance, types } from "mobx-state-tree"

const ObjectModel = types.model({
  id: types.identifier,
  name: types.string,
  uri: types.string,
  attempts: types.optional(types.number, 0),
  correctAttempts: types.optional(types.number, 0),
})

const ObjectSetModel = types.model({
  id: types.identifier,
  name: types.string,
  description: types.string,
  objects: types.array(ObjectModel),
  isActive: types.optional(types.boolean, false),
})

const SessionHistoryModel = types.model({
  id: types.identifier,
  character: types.string,
  accuracy: types.number,
  totalFound: types.number,
  totalTargets: types.number,
  timestamp: types.number,
})

const RootStoreModel = types
  .model("RootStore")
  .props({
    objectStore: types.optional(
      types.model({
        objects: types.array(ObjectModel)
      }),
      { objects: [] }
    ),
    objectSetStore: types.optional(
      types.model({
        sets: types.array(ObjectSetModel)
      }),
      { sets: [] }
    ),
    practiceStore: types.optional(
      types.model({
        isSessionActive: types.boolean,
        currentRound: types.number,
        currentCharacter: types.string,
        characterPool: types.array(types.string),
        charactersFound: types.number,
        totalTargetCharacters: types.number,
        sessionHistory: types.array(SessionHistoryModel)
      }),
      {
        isSessionActive: false,
        currentRound: 1,
        currentCharacter: "",
        characterPool: [],
        charactersFound: 0,
        totalTargetCharacters: 0,
        sessionHistory: []
      }
    )
  })

export const RootStore = RootStoreModel