import { Action, Actions } from "./constants";
import { ThunkAction } from "redux-thunk";

import { AppState } from "../reducers/store";

export interface SearchByContentParams {
  searchQuery: string;
}

export interface _SearchByContentParams extends SearchByContentParams {
  results: string[];
}

export const searchByContent = (
  params: SearchByContentParams
): ThunkAction<void, AppState, unknown, Action<_SearchByContentParams>> => {
  return (dispatch, getState) => {
    const state = getState();

    if (!state.db.db)
      return console.warn("Tried to search before database was loaded");
    const db = state.db.db;
    db.searchPointsByContent(params.searchQuery).then(async (points) => {
      const messages = await db.searchMessagesForPoints(points);
      const results = messages.map(({ _id }) => _id);

      // TODO: Put messages into message store
      // TODO: Put points into point store

      dispatch(
        _searchByContent({
          ...params,
          results,
        })
      );
    });
  };
};

const _searchByContent = (
  params: _SearchByContentParams
): Action<_SearchByContentParams> => {
  return {
    type: Actions.searchByContent,
    params,
  };
};
