/* Copyright (C) 2020 by USHIN, Inc.

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
import React, { useEffect, useRef } from "react";
import { AuthorI, PointI, PointShape } from "../dataModels";
import { useDragPoint } from "../hooks/useDragPoint";
import TextareaAutosize from "react-textarea-autosize";
import styled from "styled-components";
import Banner from "./Banner";

import { connect } from "react-redux";
import { setEditingPoint } from "../actions/editingPointActions";
import {
  pointUpdate,
  PointUpdateParams,
  setMainPoint,
  SetMainPointParams,
} from "../actions/messageActions";

const FocusPoint = (props: {
  point: PointI;
  shape: PointShape;
  index: number;
  readOnly: boolean;
  darkMode: boolean;
  isMainPoint: boolean;
  isEditing: boolean;
  onClick: any;
  setEditingPoint: (pointId: string) => void;
  pointUpdate: (params: PointUpdateParams) => void;
  setMainPoint: (params: SetMainPointParams) => void;
}) => {
  const {
    point,
    shape,
    index,
    isMainPoint,
    isEditing,
    onClick,
    setEditingPoint,
  } = props;

  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    isEditing && ref.current && ref.current.focus();
  }, [isEditing]);

  const handleChange = (e: any) => {
    props.pointUpdate({
      point: { ...point, content: e.target.value },
      shape: shape,
    });
  };

  const handleBlur = () => {
    setEditingPoint("");
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick();
  };

  const imageUrl = require(`../images/${shape}.svg`);

  const { isDragging, drag, preview } = useDragPoint(point, shape, index);

  return (
    <StyledSpan
      ref={preview}
      onClick={handleClick}
      isMainPoint={isMainPoint}
      isEditing={isEditing}
      isDragging={isDragging}
      quotedAuthor={point.quotedAuthor}
    >
      <StyledImg
        ref={props.readOnly ? null : drag}
        src={imageUrl}
        onClick={() => {
          if (props.readOnly) {
            return;
          } else {
            isMainPoint
              ? props.setMainPoint({ pointId: "" })
              : props.setMainPoint({ pointId: point.pointId });
          }
        }}
        quotedAuthor={point.quotedAuthor}
        height={isMainPoint ? 30 : 20}
        alt={shape}
      />
      <StyledTextArea
        value={point.content}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={() => {
          setEditingPoint(point.pointId);
        }}
        readOnly={!!point.quotedAuthor || props.readOnly}
        ref={ref}
        isMainPoint={isMainPoint}
        quotedAuthor={point.quotedAuthor}
        darkMode={props.darkMode}
      />
      {point.quotedAuthor && (
        <Banner
          text={point.quotedAuthor.name}
          color={point.quotedAuthor.color}
          placement={{ top: "-0.5rem", right: "0.4rem" }}
          darkMode={props.darkMode}
        />
      )}
    </StyledSpan>
  );
};

interface StyledProps {
  isMainPoint?: boolean;
  isEditing?: boolean;
  isDragging?: boolean;
  quotedAuthor?: AuthorI;
  darkMode?: boolean;
}

const StyledSpan = styled.span<StyledProps>`
  position: relative;
  margin: auto;
  display: flex;
  opacity: ${(props) => (props.isDragging ? 0.4 : 1)};
  ${(props) =>
    props.isEditing &&
    `
  background-color: #777;
  border-radius: 5px;
`}

  ${(props) =>
    props.isMainPoint &&
    `
  padding: 1% 0;
`};
`;

const StyledImg = styled.img<StyledProps>`
  height: 20px;
  margin: auto;
  opacity: 0.7;
`;

const StyledTextArea = styled(TextareaAutosize)<StyledProps>`
  width: 100%;
  border: 0px;
  color: ${(props) => (props.darkMode ? "#fff" : "#000")};
  background-color: transparent;
  font-family: arial;
  font-size: medium;
  font-weight: ${(props) => (props.isMainPoint ? "bold" : "normal")};
  outline: 0;
  resize: none;
  ${(props) =>
    props.quotedAuthor &&
    ` border: 1.5px solid ${props.quotedAuthor.color}; border-top: 0.5rem solid ${props.quotedAuthor.color}; border-radius: 3px; padding: 3px 0 3px 3px;`}
`;

const mapStateToProps = () => {
  return {};
};

const mapActionsToProps = {
  setEditingPoint,
  pointUpdate,
  setMainPoint,
};

export default connect(mapStateToProps, mapActionsToProps)(FocusPoint);
