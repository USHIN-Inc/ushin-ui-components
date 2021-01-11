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
import React, { forwardRef, useImperativeHandle, useRef } from "react";

import {
  StyledButton,
  StyledDiv,
  StyledTextArea,
  TextareaWrapper,
} from "./StyledPoint";
import { PointI, PointReferenceI } from "../dataModels/dataModels";
import { getOriginalAuthorId } from "../dataModels/pointUtils";

import Banner from "./Banner";
import AllShapes from "./AllShapes";
import { useTextareaIndent } from "../hooks/useTextareaIndent";

interface Props {
  id: string;
  displayPoint: PointI;
  referenceData: PointReferenceI | null;
  isMainPoint: boolean;
  isSelected: boolean;
  readOnlyOverride: boolean;
  suppressAutoFocus?: boolean;
  darkMode?: boolean;
  handleChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown?: (e: React.KeyboardEvent) => void;
  handleBlur?: () => void;
  handlePointDivClick?: (e: React.MouseEvent) => void;
  handleShapeIconClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

//TODO: fix ref type below
const Point = forwardRef<any, Props>((props, ref) => {
  const divRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    get div() {
      return divRef.current;
    },
    get button() {
      return buttonRef.current;
    },
    get banner() {
      return bannerRef.current;
    },
    get textarea() {
      return textareaRef.current;
    },
  }));

  const { textareaIndent, textareaNewline } = useTextareaIndent(
    divRef,
    bannerRef
  );

  return (
    <StyledDiv
      onClick={props.handlePointDivClick}
      ref={divRef}
      isSelected={props.isSelected}
      darkMode={props.darkMode}
    >
      <StyledButton
        onClick={props.handleShapeIconClick}
        isSelected={props.isSelected}
        darkMode={props.darkMode}
        title="Select point"
        ref={buttonRef}
      >
        <AllShapes
          shape={props.displayPoint.shape}
          isMainPoint={props.isMainPoint}
          isSelected={props.isSelected}
          darkMode={props.darkMode}
        />
      </StyledButton>
      {props.referenceData && (
        //TODO: Place Banner inside a container which handles placement
        <Banner
          authorId={getOriginalAuthorId(props.referenceData)}
          placement={{ top: "0.1rem", left: "2.2em" }}
          darkMode={props.darkMode}
          isSelected={props.isSelected}
          ref={bannerRef}
        />
      )}
      <TextareaWrapper
        isMainPoint={props.isMainPoint}
        isSelected={props.isSelected}
        darkMode={props.darkMode}
        indent={textareaIndent}
        newLine={textareaNewline}
      >
        <StyledTextArea
          value={props.displayPoint.content}
          onChange={props.handleChange}
          onBlur={props.handleBlur}
          readOnly={!!props.referenceData || props.readOnlyOverride}
          ref={textareaRef}
          autoFocus={!props.suppressAutoFocus}
          onKeyDown={props.handleKeyDown}
        />
      </TextareaWrapper>
      {props.children}
    </StyledDiv>
  );
});

export default Point;
