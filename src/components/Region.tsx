/*
  Copyright (C) 2020 by USHIN, Inc.  
  This file is part of U4U.

  U4U is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  U4U is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with U4U.  If not, see <https://www.gnu.org/licenses/>.
*/

import React from "react";
import Point from "./Point";
import Placeholder from "./Placeholder";
import StyledRegion from "./StyledRegion";
import { AuthorI, PointI, PointShape } from "../dataModels";
import { useDrop } from "react-dnd";
import { ItemTypes, DraggablePointType } from "../constants/React-Dnd";
import styled from "styled-components";

import { connect } from "react-redux";
import { AppState } from "../reducers/store";
import { Details as CursorPositionDetails } from "../reducers/cursorPosition";
import {
  pointCreate,
  PointCreateParams,
  pointMove,
  PointMoveParams,
} from "../actions/messageActions";
import { setExpandedRegion } from "../actions/expandedRegionActions";

const Region = (props: {
  region: PointShape;
  isExpanded: "expanded" | "minimized" | "balanced";
  readOnly: boolean;
  author: AuthorI;
  points: PointI[];
  focusPointId: string | undefined;
  mainPointId: string | undefined;
  cursorPosition: CursorPositionDetails | null;
  pointCreate: (params: PointCreateParams) => void;
  createEmptyPoint: any;
  onRegionClick: any;
  editingPointId: string;
  pointMove: (params: PointMoveParams) => void;
  setExpandedRegion: (region: string) => void;
  darkMode: boolean;
}) => {
  const {
    region,
    isExpanded,
    points,
    focusPointId,
    mainPointId,
    author,
    cursorPosition,
    createEmptyPoint,
    onRegionClick,
    editingPointId,
  } = props;

  const renderPoints = points.filter((p) => p.pointId !== focusPointId);

  const placeholderText = `New ${region.toLowerCase()} point`;
  const placeholderImg = require(`../images/${region}.svg`);
  const placeholderImgAlt = region;

  const [, drop] = useDrop({
    accept: ItemTypes.POINT,
    hover: (item: DraggablePointType) => {
      //TODO: consider only calling appDispatch after the animation transition ends.
      if (item.quoted && item.shape !== region) return;
      if (isExpanded !== "expanded") {
        props.setExpandedRegion(region);
      }

      if (
        item.shape !== region ||
        item.index !== points.length - 1 ||
        item.pointId === focusPointId
      ) {
        const newIndex =
          item.shape === region ? points.length - 1 : points.length;

        props.pointMove({
          pointId: item.pointId,
          oldShape: item.shape,
          oldIndex: item.index,
          newShape: region,
          newIndex: newIndex,
        });

        item.index = newIndex;
        item.shape = region;
      }
    },
  });

  const onClickRemainingSpace = () => {
    if (isExpanded === "expanded") {
      onRegionClick(region, false);
    } else {
      if (!props.readOnly) {
        props.pointCreate({
          point: {
            author: author,
            content: "",
          },
          shape: region,
          index: points.length,
        });
      }
    }
  };

  return (
    <StyledRegion
      isExpanded={isExpanded}
      borderColor={author.color}
      onClick={() => onRegionClick(region, true)}
    >
      <div>
        {renderPoints.map((p: PointI) => (
          <Point
            key={p.pointId}
            point={p}
            shape={region}
            readOnly={props.readOnly}
            isExpanded={isExpanded}
            isMainPoint={mainPointId === p.pointId}
            index={points.findIndex((point) => point.pointId === p.pointId)}
            isEditing={editingPointId === p.pointId}
            cursorPositionIndex={
              cursorPosition && cursorPosition.pointId === p.pointId
                ? cursorPosition.index
                : undefined
            }
            darkMode={props.darkMode}
          />
        ))}
        {isExpanded === "expanded" && !props.readOnly && (
          <Placeholder
            text={placeholderText}
            img={placeholderImg}
            imgAlt={placeholderImgAlt}
            onClick={() => {
              createEmptyPoint(region, points.length);
            }}
          />
        )}
        <DropTargetDiv
          ref={drop}
          isExpanded={isExpanded}
          onClick={onClickRemainingSpace}
        />
      </div>
    </StyledRegion>
  );
};

interface DropTargetDivProps {
  isExpanded: "expanded" | "minimized" | "balanced";
}

const DropTargetDiv = styled.div<DropTargetDivProps>`
  min-height: ${(props) => (props.isExpanded ? "50px" : 0)};
  height: 100%;
`;

const mapStateToProps = (state: AppState) => ({
  editingPointId: state.editingPoint.editingPointId,
  cursorPosition: state.cursorPosition.details,
});

const mapDispatchToProps = {
  pointCreate,
  pointMove,
  setExpandedRegion,
};

export default connect(mapStateToProps, mapDispatchToProps)(Region);
