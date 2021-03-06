/*
  Copyright (C) 2021 by USHIN, Inc.

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
import React, { useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

import {
  PointI,
  PointReferenceI,
  SemanticScreenRouteParams,
} from "../dataModels/dataModels";
import {
  getPointIfReference,
  getReferenceData,
} from "../dataModels/pointUtils";
import { ItemTypes, DraggablePointType } from "../constants/React-Dnd";
import Point from "./Point";
import { PointWrapper } from "./StyledPoint";
import { Hamburger } from "./Hamburger";
import { HoverContainer } from "./hover-buttons/HoverContainer";
import { SetMainPointButton } from "./hover-buttons/SetMainPointButton";
import { ViewOriginalMessageButton } from "./hover-buttons/ViewOriginalMessageButton";
import { TrashButton } from "./hover-buttons/TrashButton";

import { useHoverOptions } from "../hooks/useHoverOptions";

import { useDrop, DropTargetMonitor } from "react-dnd";
import { useDragPoint } from "../hooks/useDragPoint";
import { XYCoord } from "dnd-core";

import { connect } from "react-redux";
import { AppState } from "../reducers";
import {
  setCursorPosition,
  clearCursorPosition,
  CursorPositionParams,
} from "../actions/cursorPositionActions";
import {
  splitIntoTwoPoints,
  SplitIntoTwoPointsParams,
  combinePoints,
  CombinePointsParams,
  pointsMoveWithinMessage,
  PointsMoveWithinMessageParams,
  draftPointUpdate,
  DraftPointUpdateParams,
  draftPointsDelete,
  DraftPointsDeleteParams,
} from "../actions/draftPointsActions";
import { setMain, SetMainParams } from "../actions/draftMessagesActions";
import { hoverOver, HoverOverParams } from "../actions/dragActions";
import {
  setSelectedPoints,
  SetSelectedPointsParams,
  togglePoint,
  TogglePointParams,
  viewOriginalMessage,
  ViewOriginalMessageParams,
} from "../actions/selectPointActions";

interface OwnProps {
  params: SemanticScreenRouteParams;
  pointId: string;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  darkMode?: boolean;
}

interface AllProps extends OwnProps {
  point: PointI;
  referenceData?: PointReferenceI;
  cursorPositionIndex?: number;
  isDraft: boolean;
  isDragHovered: boolean;
  splitIntoTwoPoints: (params: SplitIntoTwoPointsParams) => void;
  combinePoints: (params: CombinePointsParams) => void;
  setCursorPosition: (params: CursorPositionParams) => void;
  clearCursorPosition: () => void;
  pointsMoveWithinMessage: (params: PointsMoveWithinMessageParams) => void;
  draftPointUpdate: (params: DraftPointUpdateParams) => void;
  draftPointsDelete: (params: DraftPointsDeleteParams) => void;
  hoverOver: (params: HoverOverParams) => void;
  setSelectedPoints: (params: SetSelectedPointsParams) => void;
  togglePoint: (params: TogglePointParams) => void;
  setMain: (params: SetMainParams) => void;
  viewOriginalMessage: (params: ViewOriginalMessageParams) => void;
}

const RegionPoint = (props: AllProps) => {
  const {
    point,
    pointId,
    index,
    cursorPositionIndex,
    clearCursorPosition,
    setCursorPosition,
    referenceData,
  } = props;
  const { messageId } = props.params;

  const history = useHistory();

  const [, drop] = useDrop({
    accept: ItemTypes.POINT,
    hover: (item: DraggablePointType, monitor: DropTargetMonitor) => {
      const hoverIndex = index;
      const dragIndex = item.index;

      const hoverBoundingRect = pointRef.current?.div.getBoundingClientRect();

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();

      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      let newIndex = hoverIndex;

      if (dragIndex === hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      if (dragIndex === hoverIndex && hoverClientY > hoverMiddleY) newIndex++;

      item.index = newIndex;
      item.region = point.shape;

      props.hoverOver({
        region: point.shape,
        index: newIndex,
      });
    },
    drop: () => {
      if (props.isDraft) {
        props.pointsMoveWithinMessage({ messageId });
      }
    },
  });

  const { drag, preview } = useDragPoint(pointId, index);

  //TODO: fix ref type
  const pointRef = useRef<any>(null);

  drag(pointRef.current?.button);
  drop(preview(pointRef.current?.div));

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.draftPointUpdate({
      point: { ...point, content: e.target.value },
    });
  };

  const handleShapeIconClick = (e: React.MouseEvent) => {
    props.togglePoint({ pointId });
    e.stopPropagation();
  };

  const handlePointDivClick = (e: React.MouseEvent) => {
    if (props.isExpanded) {
      e.stopPropagation();
    }

    //TODO: Change the following gesture to a hoverOver button perhaps?
    props.setSelectedPoints({ pointIds: [] });
  };

  //TODO: Would it be possible to combine handleKeyDown with
  //handleChange?
  //TODO: place this function inside a useCallback hook?
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!props.isDraft) {
      return;
    } else {
      if (e.key === "Enter") {
        e.preventDefault();
        pointRef.current.textarea.selectionStart !== 0 &&
          props.splitIntoTwoPoints({
            pointId,
            sliceIndex: pointRef.current.textarea.selectionStart,
            messageId,
          });
      } else if (
        e.key === "Backspace" &&
        pointRef.current.textarea.selectionStart === 0 &&
        pointRef.current.textarea.selectionStart ===
          pointRef.current.textarea.selectionEnd
      ) {
        if (index !== 0) {
          e.preventDefault();
          props.combinePoints({
            shape: point.shape,
            messageId,
            keepIndex: index - 1,
            deleteIndex: index,
          });
        } else if (index === 0 && !point.content) {
          e.preventDefault();
          props.combinePoints({
            shape: point.shape,
            messageId,
            keepIndex: index,
            deleteIndex: index + 1,
          });
        }
      } else if (
        e.key === "Delete" &&
        pointRef.current.textarea.selectionStart === point.content.length &&
        pointRef.current.textarea.selectionStart ===
          pointRef.current.textarea.selectionEnd
      ) {
        e.preventDefault();
        props.combinePoints({
          shape: point.shape,
          messageId,
          keepIndex: index,
          deleteIndex: index + 1,
        });
      } else if (
        e.key === "ArrowLeft" &&
        pointRef.current.textarea.selectionStart === 0 &&
        pointRef.current.textarea.selectionStart ===
          pointRef.current.textarea.selectionEnd
      ) {
        e.preventDefault();
        setCursorPosition({
          point,
          messageId,
          index,
          moveTo: "endOfPrevPoint",
        });
      } else if (
        e.key === "ArrowRight" &&
        pointRef.current.textarea.selectionStart === point.content.length &&
        pointRef.current.textarea.selectionStart ===
          pointRef.current.textarea.selectionEnd
      ) {
        e.preventDefault();
        setCursorPosition({
          point,
          messageId,
          index,
          moveTo: "beginningOfNextPoint",
        });
      }
    }
  };

  const handleBlur = () => {
    if (!point.content)
      props.draftPointsDelete({
        pointIds: [pointId],
        messageId,
        deleteSelectedPoints: false,
      });
  };

  useEffect(() => {
    if (typeof cursorPositionIndex === "number") {
      pointRef.current?.textarea.focus();
      pointRef.current?.textarea.setSelectionRange(
        cursorPositionIndex as number,
        cursorPositionIndex as number
      );
      clearCursorPosition();
    }
  }, [cursorPositionIndex, clearCursorPosition]);

  const {
    renderHamburger,
    renderHoverOptions,
    handleHamburgerMouseEnter,
    handlePointMouseEnter,
    handlePointMouseLeave,
  } = useHoverOptions();

  function handleSetMainPointButtonClick(e: React.MouseEvent) {
    props.setMain({
      newMainId: pointId,
      messageId: props.params.messageId,
    });
    e.stopPropagation();
  }

  function handleViewOriginalMessageButtonClick(e: React.MouseEvent) {
    if (referenceData === undefined) return;
    props.viewOriginalMessage({
      pointId,
      referenceData,
      history,
    });
    e.stopPropagation();
  }

  function handleTrashButtonClick(e: React.MouseEvent) {
    props.draftPointsDelete({
      pointIds: [pointId],
      messageId: props.params.messageId,
      deleteSelectedPoints: true,
    });
    e.stopPropagation();
  }

  return (
    <PointWrapper
      onMouseEnter={handlePointMouseEnter}
      onMouseLeave={handlePointMouseLeave}
      isSelected={props.isSelected}
      darkMode={props.darkMode}
    >
      <Point
        id={props.pointId}
        displayPoint={props.point}
        referenceData={referenceData}
        isMainPoint={false}
        isSelected={props.isSelected}
        readOnlyOverride={!props.isDraft}
        darkMode={props.darkMode}
        handleChange={handleChange}
        handleKeyDown={handleKeyDown}
        handleBlur={handleBlur}
        handlePointDivClick={handlePointDivClick}
        handleShapeIconClick={handleShapeIconClick}
        ref={pointRef}
      >
        {renderHamburger && (
          <Hamburger
            onMouseEnter={handleHamburgerMouseEnter}
            darkMode={props.darkMode}
            isSelected={props.isSelected}
          />
        )}
        {renderHoverOptions && (
          <HoverContainer
            darkMode={props.darkMode}
            isSelected={props.isSelected}
          >
            {referenceData && (
              <ViewOriginalMessageButton
                handleClick={handleViewOriginalMessageButtonClick}
                darkMode={props.darkMode}
                isSelected={props.isSelected}
              />
            )}
            {props.isDraft && (
              <>
                <SetMainPointButton
                  handleClick={handleSetMainPointButtonClick}
                  darkMode={props.darkMode}
                  isSelected={props.isSelected}
                />
                <TrashButton
                  handleClick={handleTrashButtonClick}
                  messageOrPoint="message"
                  darkMode={props.darkMode}
                  isSelected={props.isSelected}
                />
              </>
            )}
          </HoverContainer>
        )}
      </Point>
    </PointWrapper>
  );
};

const mapStateToProps = (state: AppState, ownProps: OwnProps) => {
  const referenceData = getReferenceData(ownProps.pointId, state);
  const point = getPointIfReference(ownProps.pointId, state);

  let isDragHovered = false;
  if (
    state.drag.context &&
    state.drag.context.region === point.shape &&
    state.drag.context.index === ownProps.index
  )
    isDragHovered = true;

  const { messageId } = ownProps.params;
  return {
    point,
    referenceData,
    cursorPositionIndex:
      state.cursorPosition.details &&
      state.cursorPosition.details.pointId === ownProps.pointId
        ? state.cursorPosition.details.contentIndex
        : undefined,
    isDraft: state.draftMessages.allIds.includes(messageId),
    isDragHovered,
  };
};

const mapDispatchToProps = {
  splitIntoTwoPoints,
  combinePoints,
  setCursorPosition,
  clearCursorPosition,
  pointsMoveWithinMessage,
  draftPointUpdate,
  draftPointsDelete,
  hoverOver,
  togglePoint,
  setSelectedPoints,
  setMain,
  viewOriginalMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(RegionPoint);
