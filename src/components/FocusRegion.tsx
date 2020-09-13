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
import FocusPoint from "./FocusPoint";
import StyledFocusRegion from "./StyledFocusRegion";
import { PointI, PointShape, RegionI } from "../dataModels";
import styled from "styled-components";
import { useDrop } from "react-dnd";
import { ItemTypes, DraggablePointType } from "../constants/React-Dnd";

import { connect } from "react-redux";
import { AppState } from "../reducers/store";
import { setFocus, SetFocusParams } from "../actions/messageActions";
import { setExpandedRegion } from "../actions/expandedRegionActions";

const FocusRegion = (props: {
  region: RegionI;
  isExpanded: "expanded" | "minimized" | "balanced";
  readOnly: boolean;
  point: PointI | undefined;
  shape: PointShape | undefined;
  index: number | undefined;
  isMainPoint: boolean;
  editingPointId: string;
  onRegionClick: any;
  setFocus: (params: SetFocusParams) => void;
  setExpandedRegion: (params: string) => void;
  darkMode: boolean;
}) => {
  const {
    region,
    isExpanded,
    point,
    shape,
    index,
    isMainPoint,
    editingPointId,
    onRegionClick,
  } = props;

  const [, drop] = useDrop({
    accept: ItemTypes.POINT,
    hover: () => {
      if (isExpanded !== "expanded") {
        props.setExpandedRegion(region);
      }
    },
    drop: (item: DraggablePointType) => {
      props.setFocus({
        pointId: item.pointId,
        oldShape: item.shape,
        oldIndex: item.index,
        newShape: item.originalShape,
        newIndex: item.originalIndex,
      });
    },
  });

  return (
    <StyledFocusRegion
      ref={drop}
      onClick={() => onRegionClick(region, isExpanded !== "expanded")}
    >
      <StyledDiv>
        {point && shape && typeof index === "number" && (
          <FocusPoint
            point={point}
            shape={shape}
            index={index}
            readOnly={props.readOnly}
            isMainPoint={isMainPoint}
            isEditing={editingPointId === point.pointId}
            onClick={() => onRegionClick(region, true)}
            darkMode={props.darkMode}
          />
        )}
      </StyledDiv>
    </StyledFocusRegion>
  );
};

const StyledDiv = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const mapStateToProps = (state: AppState) => ({
  editingPointId: state.editingPoint.editingPointId,
});

const mapDispatchToProps = {
  setFocus,
  setExpandedRegion,
};

export default connect(mapStateToProps, mapDispatchToProps)(FocusRegion);
