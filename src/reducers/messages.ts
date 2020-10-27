/*
  Copyright (C) 2020 by USHIN, Inc.

  This file is part of U4U.

  U4U is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  U4U is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with U4U.  If not, see <https://www.gnu.org/licenses/>.
*/
import { Action, Actions } from "../actions/constants";
import { AppState } from "./store";
import produce from "immer";
import { v4 as uuidv4 } from "uuid";

import {
  allPointShapes,
  MessageI,
  isPointShape,
} from "../dataModels/dataModels";
import {
  getPointById,
  getReferenceData,
  getReferencedPointId,
  isReference,
} from "../dataModels/getters";
import {
  _PointCreateParams,
  PointsMoveParams,
  PointsDeleteParams,
  CombinePointsParams,
  _SplitIntoTwoPointsParams,
} from "../actions/pointsActions";
import { SetFocusParams, SetMainPointParams } from "../actions/messagesActions";

export interface MessagesState {
  byId: {
    [_id: string]: MessageI;
  };
  allMessages: string[];
}

export const initialMessagesState: MessagesState = {
  byId: {
    message0: {
      _id: uuidv4(),
      author: "author0",
      shapes: {
        facts: [],
        thoughts: [],
        feelings: [],
        needs: [],
        topics: [],
        actions: [],
        people: [],
      },
      createdAt: new Date(),
      isPersisted: false,
    },
  },
  allMessages: ["message0"],
};

export const messagesReducer = (
  state = initialMessagesState,
  action: Action,
  appState: AppState
): MessagesState => {
  let newState = state;
  switch (action.type) {
    case Actions.pointCreate:
      newState = handlePointCreate(
        state,
        action as Action<_PointCreateParams>,
        appState
      );
      break;
    case Actions.pointsMove:
      newState = handlePointsMove(
        state,
        action as Action<PointsMoveParams>,
        appState
      );
      break;
    case Actions.pointsDelete:
      newState = handlePointsDelete(
        state,
        action as Action<PointsDeleteParams>,
        appState
      );
      break;
    case Actions.setFocus:
      newState = handleSetFocus(
        state,
        action as Action<SetFocusParams>,
        appState
      );
      break;
    case Actions.setMainPoint:
      newState = handleSetMainPoint(
        state,
        action as Action<SetMainPointParams>,
        appState
      );
      break;
    case Actions.combinePoints:
      newState = handleCombinePoints(
        state,
        action as Action<CombinePointsParams>,
        appState
      );
      break;
    case Actions.splitIntoTwoPoints:
      newState = handleSplitIntoTwoPoints(
        state,
        action as Action<_SplitIntoTwoPointsParams>,
        appState
      );
      break;
  }
  return newState;
};

//function setMessage(
//  state: MessagesState,
//  action: Action<SetMessageParams>
//): MessagesState {
//  return action.params.message;
//}

function handlePointCreate(
  state: MessagesState,
  action: Action<_PointCreateParams>,
  appState: AppState
): MessagesState {
  const shape = action.params.point.shape;

  return produce(state, (draft) => {
    const currentMessage = draft.byId[appState.semanticScreen.currentMessage];
    if (action.params.focus) {
      currentMessage.focus = action.params.newPointId;
    } else {
      currentMessage.shapes[shape].splice(
        action.params.index,
        0,
        action.params.newPointId
      );
    }
    //Message.main should only be undefined if message has no points
    if (!currentMessage.main) {
      currentMessage.main = action.params.newPointId;
    }
  });
}

function handlePointsMove(
  state: MessagesState,
  action: Action<PointsMoveParams>,
  appState: AppState
): MessagesState {
  if (appState.drag.context === null) return state;
  const { region, index } = appState.drag.context;

  if (!isPointShape(region)) return state;

  const pointsToMove = appState.selectedPoints.pointIds.filter(
    (p) =>
      !getReferenceData(p, appState.points) ||
      region === getPointById(p, appState.points).shape
  );

  const currentMessageId = appState.semanticScreen.currentMessage;
  const pointIds: string[] = state.byId[currentMessageId].shapes[region];
  let newPointIds: string[] = [];

  // Rebuild array of pointIds for state.shapes[region]
  pointIds.forEach((pointId: string, i: number) => {
    if (i === index) {
      newPointIds = newPointIds.concat(pointsToMove);
    }

    if (!appState.selectedPoints.pointIds.includes(pointId)) {
      newPointIds.push(pointId);
    }
  });

  if (index === pointIds.length) {
    newPointIds = newPointIds.concat(pointsToMove);
  }

  return produce(state, (draft) => {
    const currentMessage = draft.byId[currentMessageId];
    currentMessage.shapes[region] = newPointIds;
    // Remove pointIds from other shapes arrays when they're moved
    allPointShapes.forEach((pointShape) => {
      if (pointShape !== region) {
        currentMessage.shapes[pointShape] = currentMessage.shapes[
          pointShape
        ].filter((p) => !pointsToMove.includes(p));
      }
    });
    // Remove focus if it was moved to a ShapeRegion
    if (currentMessage.focus && pointsToMove.includes(currentMessage.focus)) {
      delete draft.byId[currentMessageId].focus;
    }
  });
}

function handlePointsDelete(
  state: MessagesState,
  action: Action<PointsDeleteParams>,
  appState: AppState
): MessagesState {
  return produce(state, (draft) => {
    const currentMessage = draft.byId[appState.semanticScreen.currentMessage];
    allPointShapes.forEach((shape) => {
      currentMessage.shapes[shape] = currentMessage.shapes[shape].filter(
        (id) => !action.params.pointIds.includes(id)
      );
    });
    currentMessage.focus &&
      action.params.pointIds.includes(currentMessage.focus) &&
      delete currentMessage.focus;
    //Message.main should only be undefined if message has no points
    if (
      currentMessage.main &&
      action.params.pointIds.includes(currentMessage.main)
    ) {
      const pointInShapes = Object.values(currentMessage.shapes).flat()[0];
      if (pointInShapes) {
        currentMessage.main = pointInShapes;
      } else {
        currentMessage.main = currentMessage.focus;
      }
    }
  });
}

function handleSetFocus(
  state: MessagesState,
  action: Action<SetFocusParams>,
  appState: AppState
): MessagesState {
  const newFocus = appState.selectedPoints.pointIds[0];
  if (!newFocus) return state;

  const newFocusShape = getPointById(newFocus, appState.points).shape;

  return produce(state, (draft) => {
    const currentMessage = draft.byId[appState.semanticScreen.currentMessage];
    currentMessage.shapes[newFocusShape] = currentMessage.shapes[
      newFocusShape
    ].filter((id) => id !== newFocus);
    if (currentMessage.focus) {
      const oldFocusShape = getPointById(currentMessage.focus, appState.points)
        .shape;
      currentMessage.shapes[oldFocusShape].push(currentMessage.focus);
    }
    currentMessage.focus = newFocus;
  });
}

function handleSetMainPoint(
  state: MessagesState,
  action: Action<SetMainPointParams>,
  appState: AppState
): MessagesState {
  const currentMessageId = appState.semanticScreen.currentMessage;

  return {
    ...state,
    byId: {
      ...state.byId,
      [currentMessageId]: {
        ...state.byId[currentMessageId],
        main: action.params.pointId,
      },
    },
  };
}

function handleCombinePoints(
  state: MessagesState,
  action: Action<CombinePointsParams>,
  appState: AppState
): MessagesState {
  const currentMessageId = appState.semanticScreen.currentMessage;

  const withinBounds = (index: number): boolean => {
    return (
      index >= 0 &&
      index < state.byId[currentMessageId].shapes[action.params.shape].length
    );
  };

  const isQuoted = (index: number): boolean => {
    const pointId =
      state.byId[currentMessageId].shapes[action.params.shape][index];
    return !!getReferencedPointId(pointId, appState.points);
  };

  // Don't attempt to combine a point with the point below it if no point
  // exists below it.
  if (
    !withinBounds(action.params.keepIndex) ||
    !withinBounds(action.params.deleteIndex)
  ) {
    return state;
  }

  // Don't combine points with quoted points:
  if (
    isQuoted(action.params.keepIndex) ||
    isQuoted(action.params.deleteIndex)
  ) {
    return state;
  }

  const pointIdToDelete =
    state.byId[currentMessageId].shapes[action.params.shape][
      action.params.deleteIndex
    ];
  return produce(state, (draft) => {
    draft.byId[currentMessageId].shapes[action.params.shape] = draft.byId[
      currentMessageId
    ].shapes[action.params.shape].filter((id) => id !== pointIdToDelete);
    draft.byId[currentMessageId].main === pointIdToDelete &&
      delete draft.byId[currentMessageId].main;
  });
}

function handleSplitIntoTwoPoints(
  state: MessagesState,
  action: Action<_SplitIntoTwoPointsParams>,
  appState: AppState
): MessagesState {
  const point = appState.points.byId[action.params.pointId];
  if (isReference(point)) {
    return state;
  }

  return produce(state, (draft) => {
    const currentMessage = draft.byId[appState.semanticScreen.currentMessage];

    const shape = getPointById(action.params.pointId, appState.points).shape;
    const splitPointIndex =
      currentMessage.shapes[shape].findIndex(
        (id) => id === action.params.pointId
      ) + 1;
    currentMessage.shapes[shape].splice(
      splitPointIndex,
      0,
      action.params.newPointId
    );
  });
}