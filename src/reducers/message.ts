import { Action, Actions } from "../actions/constants";
import { AppState } from "./store";
import update from "immutability-helper";
import { v4 as uuidv4 } from "uuid";
import randomColor from "randomcolor";

import {
  allPointShapes,
  PointI,
  AuthorI,
  PointsI,
  PointShape,
} from "../dataModels";
import {
  _PointCreateParams,
  PointUpdateParams,
  PointMoveParams,
  PointsDeleteParams,
  SetFocusParams,
  SetMainPointParams,
  CombinePointsParams,
  SplitIntoTwoPointsParams,
  SetMessageParams,
} from "../actions/messageActions";

export interface MessageState {
  messageId: string;
  revisionOf?: string;
  author: AuthorI;
  points: PointsI;
  focus?: { pointId: string; shape: PointShape };
  main?: string;
  createdAt: Date;
}

export const initialMessageState: MessageState = {
  messageId: uuidv4(),
  author: { name: "anonymous", color: randomColor() },
  points: {
    facts: [],
    thoughts: [],
    feelings: [],
    needs: [],
    topics: [],
    actions: [],
    people: [],
  },
  createdAt: new Date(),
};

export const messageReducer = (
  state = initialMessageState,
  action: Action,
  appState: AppState
): MessageState => {
  let newState = state;
  switch (action.type) {
    case Actions.setMessage:
      newState = setMessage(state, action as Action<SetMessageParams>);
      break;
    case Actions.pointCreate:
      newState = handlePointCreate(state, action as Action<_PointCreateParams>);
      break;
    case Actions.pointUpdate:
      newState = handlePointUpdate(state, action as Action<PointUpdateParams>);
      break;
    case Actions.pointMove:
      newState = handlePointMove(state, action as Action<PointMoveParams>);
      break;
    case Actions.pointsDelete:
      newState = handlePointsDelete(
        state,
        action as Action<PointsDeleteParams>
      );
      break;
    case Actions.setFocus:
      newState = handleSetFocus(state, action as Action<SetFocusParams>);
      break;
    case Actions.setMainPoint:
      newState = handleSetMainPoint(
        state,
        action as Action<SetMainPointParams>
      );
      break;
    case Actions.combinePoints:
      newState = handleCombinePoints(
        state,
        action as Action<CombinePointsParams>
      );
      break;
    case Actions.splitIntoTwoPoints:
      newState = handleSplitIntoTwoPoints(
        state,
        action as Action<SplitIntoTwoPointsParams>
      );
      break;
  }
  return newState;
};

function setMessage(
  state: MessageState,
  action: Action<SetMessageParams>
): MessageState {
  return action.params.message;
}

function handlePointCreate(
  state: MessageState,
  action: Action<_PointCreateParams>
): MessageState {
  const newPoints = state.points[action.params.shape].slice();
  newPoints.splice(action.params.index, 0, {
    ...action.params.point,
    pointId: action.params.newPointId,
    pointDate: new Date(),
  });
  return action.params.focus
    ? {
        ...state,
        points: {
          ...state.points,
          [action.params.shape]: newPoints,
        },
        focus: {
          pointId: action.params.newPointId,
          shape: action.params.shape,
        },
      }
    : {
        ...state,
        points: {
          ...state.points,
          [action.params.shape]: newPoints,
        },
      };
}

function handlePointUpdate(
  state: MessageState,
  action: Action<PointUpdateParams>
): MessageState {
  return {
    ...state,
    points: {
      ...state.points,
      [action.params.shape]: state.points[action.params.shape].map((p) => {
        if (p.pointId === action.params.point.pointId) {
          return action.params.point;
        }
        return p;
      }),
    },
  };
}

function handlePointMove(
  state: MessageState,
  action: Action<PointMoveParams>
): MessageState {
  const pointWithNewShape = state.points[action.params.oldShape].find(
    (p) => p.pointId === action.params.pointId
  ) as PointI;
  let newFocus = state.focus;
  if (state.focus && action.params.pointId === state.focus.pointId) {
    newFocus = undefined;
  }
  return action.params.oldShape === action.params.newShape
    ? {
        ...state,
        points: {
          ...state.points,
          [action.params.oldShape]: update(
            state.points[action.params.oldShape],
            {
              $splice: [
                [action.params.oldIndex, 1],
                [action.params.newIndex, 0, pointWithNewShape],
              ],
            }
          ),
        },
        focus: newFocus,
      }
    : {
        ...state,
        points: {
          ...state.points,
          [action.params.oldShape]: update(
            state.points[action.params.oldShape],
            {
              $splice: [[action.params.oldIndex, 1]],
            }
          ),
          [action.params.newShape]: update(
            state.points[action.params.newShape],
            {
              $splice: [[action.params.newIndex, 0, pointWithNewShape]],
            }
          ),
        },
        focus: newFocus,
      };
}

function handlePointsDelete(
  state: MessageState,
  action: Action<PointsDeleteParams>
): MessageState {
  return {
    ...state,
    points: allPointShapes.reduce((obj: PointsI, pointShape: PointShape) => {
      obj[pointShape] = state.points[pointShape].filter((p) => {
        return !action.params.pointIds.includes(p.pointId);
      });
      return obj;
    }, state.points),
  };
}

function handleSetFocus(
  state: MessageState,
  action: Action<SetFocusParams>
): MessageState {
  const intermediateState = handlePointMove(
    state,
    action as Action<PointMoveParams>
  );

  return {
    ...intermediateState,
    focus: { pointId: action.params.pointId, shape: action.params.newShape },
  };
}

function handleSetMainPoint(
  state: MessageState,
  action: Action<SetMainPointParams>
): MessageState {
  return {
    ...state,
    main: action.params.pointId,
  };
}

function handleCombinePoints(
  state: MessageState,
  action: Action<CombinePointsParams>
): MessageState {
  if (
    action.params.aboveOrBelow === "below" &&
    action.params.index === state.points[action.params.shape].length - 1
  ) {
    return state;
  }

  const prevPoint = state.points[action.params.shape][action.params.index - 1];
  const currentPoint = state.points[action.params.shape][action.params.index];
  const nextPoint = state.points[action.params.shape][action.params.index + 1];
  const combinedPoints = state.points[action.params.shape].slice();
  action.params.aboveOrBelow === "above" &&
    combinedPoints.splice(action.params.index - 1, 2, {
      ...prevPoint,
      content: prevPoint.content + currentPoint.content,
    });
  action.params.aboveOrBelow === "below" &&
    combinedPoints.splice(action.params.index, 2, {
      ...currentPoint,
      content: currentPoint.content + nextPoint.content,
    });
  return {
    ...state,
    points: {
      ...state.points,
      [action.params.shape]: combinedPoints,
    },
  };
}

function handleSplitIntoTwoPoints(
  state: MessageState,
  action: Action<SplitIntoTwoPointsParams>
): MessageState {
  const splitPoints = state.points[action.params.shape].slice();
  splitPoints.splice(
    action.params.index,
    1,
    {
      ...state.points[action.params.shape][action.params.index],
      content: action.params.topPoint.content,
    },
    {
      ...action.params.bottomPoint,
      pointId: action.params.newPointId,
      pointDate: new Date(),
    }
  );
  return {
    ...state,
    points: {
      ...state.points,
      [action.params.shape]: splitPoints,
    },
  };
}
