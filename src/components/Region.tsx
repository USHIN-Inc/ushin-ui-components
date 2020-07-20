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
// TODO: type appDispatch

import React from "react";
import Point from "./Point";
import Placeholder from "./Placeholder";
import StyledRegion from "./StyledRegion";
import {
  AuthorI,
  PointI,
  PointShape,
  CursorPositionI,
} from "../constants/AppState";

import { useDrop } from "react-dnd";
import { ItemTypes, DraggablePointType } from "../constants/React-Dnd";
import styled from "styled-components";

const Region = (props: {
  region: PointShape;
  isExpanded: "expanded" | "minimized" | "balanced";
  author: AuthorI;
  points: PointI[];
  focusPointId: string | undefined;
  mainPointId: string | undefined;
  appDispatch: any;
  editingPoint: PointI["pointId"] | undefined;
  cursorPosition?: CursorPositionI;
  createEmptyPoint: any;
  onRegionClick: any;
  setExpandedRegion: any;
}) => {
  const {
    region,
    isExpanded,
    points,
    focusPointId,
    mainPointId,
    author,
    appDispatch,
    editingPoint,
    cursorPosition,
    createEmptyPoint,
    onRegionClick,
    setExpandedRegion,
  } = props;

  const renderPoints = points.filter((p) => p.pointId !== focusPointId);

  const placeholderText = `New ${region.toLowerCase()} point`;
  const placeholderImg = require(`../images/${region}.svg`);
  const placeholderImgAlt = region;

  const ref = React.useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ItemTypes.POINT,
    hover: (item: DraggablePointType) => {
      if (!ref.current) {
        return;
      }
      //TODO: consider only calling appDispatch after the animation transition ends.
      if (isExpanded !== "expanded") {
        setExpandedRegion(region);
      }

      if (item.shape !== region || item.index !== points.length - 1) {
        const newIndex =
          item.shape === region ? points.length - 1 : points.length;

        appDispatch({
          type: "pointMove",
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

  drop(ref);

  return (
    <StyledRegion
      isExpanded={isExpanded}
      backgroundColor={author.styles.backgroundColor}
      onClick={() => onRegionClick(region, false)}
    >
      <div>
        {renderPoints.map((p: PointI) => (
          <Point
            key={p.pointId}
            point={p}
            shape={region}
            isExpanded={isExpanded}
            setExpandedRegion={setExpandedRegion}
            isMainPoint={mainPointId === p.pointId}
            index={points.findIndex((point) => point.pointId === p.pointId)}
            appDispatch={appDispatch}
            isEditing={editingPoint === p.pointId}
            createPointBelow={(topContent, bottomContent) => {
              appDispatch({
                type: "splitIntoTwoPoints",
                topPoint: {
                  author: author,
                  content: topContent,
                  shape: region,
                },
                bottomPoint: {
                  author: author,
                  content: bottomContent,
                  shape: region,
                },
                shape: region,
                index: points.findIndex((p) => p.pointId === editingPoint),
              });
            }}
            combinePoints={(
              aboveOrBelow: "above" | "below",
              point: PointI,
              shape: PointShape,
              index: number
            ) => {
              if (aboveOrBelow === "below" && index === points.length - 1) {
                return;
              } else {
                appDispatch({
                  type: "combinePoints",
                  aboveOrBelow: aboveOrBelow,
                  point: point,
                  shape: shape,
                  index: index,
                });
              }
            }}
            setCursorPosition={(index: number, moveTo: string) => {
              if (moveTo === "beginningOfPriorPoint") {
                appDispatch({
                  type: "setCursorPosition",
                  pointId: points[index - 1].pointId,
                  index: 0,
                });
              } else if (moveTo === "endOfPriorPoint") {
                appDispatch({
                  type: "setCursorPosition",
                  pointId: points[index - 1].pointId,
                  index: points[index - 1].content.length,
                });
              } else if (moveTo === "beginningOfNextPoint") {
                !(index === points.length - 1) &&
                  appDispatch({
                    type: "setCursorPosition",
                    pointId: points[index + 1].pointId,
                    index: 0,
                  });
              }
            }}
            cursorPositionIndex={
              cursorPosition && cursorPosition.pointId === p.pointId
                ? cursorPosition.index
                : undefined
            }
            onClick={() => onRegionClick(region, true)}
          />
        ))}
        {isExpanded === "expanded" && (
          <>
            <Placeholder
              text={placeholderText}
              img={placeholderImg}
              imgAlt={placeholderImgAlt}
              onClick={() => {
                createEmptyPoint(region, points.length);
              }}
            />
          </>
        )}
        <DropTargetDiv ref={ref} isExpanded={isExpanded} />
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

export default Region;
