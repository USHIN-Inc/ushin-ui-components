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
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import {
  AuthorI,
  PointI,
  HoverOptionsType,
  PointReferenceI,
} from "../dataModels/dataModels";
import {
  getPointIfReference,
  getMessageById,
  getReferenceData,
  isUserIdentity,
} from "../dataModels/pointUtils";
import Point from "./Point";
import HoverOptions from "./HoverOptions";
import Banner from "./Banner";
import { Hamburger } from "./Hamburger";

import { useHoverOptions } from "../hooks/useHoverOptions";

import { connect } from "react-redux";
import { AppState } from "../reducers";
import {
  setCurrentMessage,
  SetCurrentMessageParams,
} from "../actions/semanticScreenActions";
import {
  pointsMoveToMessage,
  PointsMoveToMessageParams,
} from "../actions/draftPointsActions";
import { hoverOver, HoverOverParams } from "../actions/dragActions";

import { useDrop } from "react-dnd";
import { ItemTypes } from "../constants/React-Dnd";

interface OwnProps {
  messageId: string;
  type: HoverOptionsType;
  index: number;
  darkMode?: boolean;
}

interface AllProps extends OwnProps {
  author: AuthorI;
  displayPoint: PointI;
  referenceData: PointReferenceI | null;
  isDragHovered: boolean;
  setCurrentMessage: (params: SetCurrentMessageParams) => void;
  pointsMoveToMessage: (params: PointsMoveToMessageParams) => void;
  hoverOver: (params: HoverOverParams) => void;
}

const MessageListItem = (props: AllProps) => {
  const { referenceData } = props;

  const [, drop] = useDrop({
    accept: ItemTypes.POINT,
    drop: () => {
      if (props.type === "draftMessage") {
        props.pointsMoveToMessage({ newMessageId: props.messageId });
      }
    },
    hover: () => {
      if (!props.isDragHovered && props.type === "draftMessage") {
        props.hoverOver({
          region: "parking",
          index: props.index,
        });
      }
    },
  });

  const handleClick = () => {
    props.setCurrentMessage({ messageId: props.messageId });
  };

  //The useState and useEffect are purely to cause the component to
  //re-render after it first mounts. A better solution must exist.
  const [, setCounter] = useState(0);
  useEffect(() => {
    setCounter((c) => c + 1);
  }, [referenceData]);

  const {
    isHovered,
    renderHamburger,
    renderHoverOptions,
    handleHamburgerMouseEnter,
    handlePointMouseEnter,
    handlePointMouseLeave,
  } = useHoverOptions();

  return (
    <MessageWrapper
      author={props.author}
      onMouseEnter={handlePointMouseEnter}
      onMouseLeave={handlePointMouseLeave}
      onClick={handleClick}
      isHovered={isHovered || props.isDragHovered}
      darkMode={props.darkMode}
      ref={drop}
    >
      <Point
        id={props.messageId}
        displayPoint={props.displayPoint}
        referenceData={props.referenceData}
        isMainPoint={true}
        isSelected={false}
        readOnlyOverride={true}
        darkMode={props.darkMode}
        suppressAutoFocus={true}
      >
        {renderHamburger && props.type !== "publishedMessage" && (
          <Hamburger
            onMouseEnter={handleHamburgerMouseEnter}
            darkMode={props.darkMode}
          />
        )}
        {renderHoverOptions && props.type !== "publishedMessage" && (
          <HoverOptions
            type={props.type}
            id={props.messageId}
            darkMode={props.darkMode}
          />
        )}
      </Point>
      <Banner
        authorId={props.author._id}
        placement={{ top: "-1rem", right: "0.5rem" }}
        fontSize="medium"
        isHovered={isHovered || props.isDragHovered}
        darkMode={props.darkMode}
      />
    </MessageWrapper>
  );
};

const MessageWrapper = styled.div<{
  author: AuthorI;
  isHovered: boolean;
  darkMode?: boolean;
}>`
  position: relative;
  border-radius: 3px;
  padding: 3px 1rem 3px 3px;

  ${(props) =>
    `
    border: 1.5px solid ${props.author.color};
    border-top: 0.5rem solid ${props.author.color}; 
  `}

  ${(props) =>
    props.isHovered &&
    `
    border-color: ${props.darkMode ? "white" : "black"};
  `}
`;

const mapStateToProps = (state: AppState, ownProps: OwnProps) => {
  const message = getMessageById(ownProps.messageId, state);
  const author = isUserIdentity(message.author, state)
    ? state.userIdentities.byId[message.author]
    : state.authors.byId[message.author];

  // Display a random point from the message if no main point exists
  const displayPointId =
    message.main ??
    Object.values(
      state.draftMessages.byId[ownProps.messageId].shapes
    ).flat()[0];
  const displayPoint = getPointIfReference(displayPointId, state);
  const referenceData = getReferenceData(displayPointId, state);

  let isDragHovered = false;
  if (
    state.drag.context &&
    state.drag.context.region === "parking" &&
    state.drag.context.index === ownProps.index &&
    ownProps.type === "draftMessage"
  )
    isDragHovered = true;

  return {
    author,
    displayPoint,
    referenceData,
    isDragHovered,
  };
};

const mapActionsToProps = {
  setCurrentMessage,
  pointsMoveToMessage,
  hoverOver,
};

export default connect(mapStateToProps, mapActionsToProps)(MessageListItem);
