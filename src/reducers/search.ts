import { Action, Actions } from "../actions/constants";

import { _SearchByContentParams } from "../actions/searchActions";

import { AppState } from "./store";

export interface SearchState {
  searchQuery: string;
  // Array of message IDs
  results: string[];
}

export const initialSearchState: SearchState = {
  searchQuery: "",
  results: [],
};

export const searchReducer = (
  state = initialSearchState,
  action: Action,
  appState: AppState
): SearchState => {
  let newState = state;
  switch (action.type) {
    case Actions.searchByContent:
      newState = handleSearchResults(
        state,
        action as Action<_SearchByContentParams>,
        appState
      );
      break;
  }

  return newState;
};

function handleSearchResults(
  state: SearchState,
  action: Action<_SearchByContentParams>,
  appState: AppState
) {
  return { ...state, ...action.params };
}
