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
import React from "react";
import { connect } from "react-redux";

import { AppState } from "../reducers";
import { DraftMessageI, MessageI } from "../dataModels/dataModels";
import {
  PointMapping,
  saveMessage,
  SaveMessageParams,
} from "../actions/dbActions";

import { ButtonSvg } from "./HoverOptions";

interface OwnProps {
  messageId: string;
  darkMode?: boolean;
}

interface AllProps extends OwnProps {
  message: DraftMessageI;
  points: PointMapping;
  saveMessage: (params: SaveMessageParams) => void;
}

const PublishButton = (props: AllProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const { points, message, saveMessage } = props;
    if (!message.main) {
      window.alert(
        "Before publishing, please add a main point to your message"
      );
    } else {
      console.log("Saving", { message, points });
      // Type assertion is okay here since main point must exist
      saveMessage({ message: message as MessageI, points });
    }
  };

  return (
    <ButtonSvg
      onClick={handleClick}
      darkMode={props.darkMode}
      viewBox="0 0 16 16"
    >
      <title>Publish message</title>
      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
    </ButtonSvg>
  );
};

const mapStateToProps = (state: AppState, ownProps: OwnProps) => {
  const message = state.draftMessages.byId[ownProps.messageId];
  const points = state.draftPoints.byId;
  return {
    message,
    points,
  };
};

const mapActionsToProps = {
  saveMessage,
};

export default connect(mapStateToProps, mapActionsToProps)(PublishButton);
