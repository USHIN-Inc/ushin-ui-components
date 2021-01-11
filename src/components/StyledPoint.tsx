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
import styled from "styled-components";
import TextareaAutosize from "react-textarea-autosize";

import { blackOrWhite } from "../dataModels/pointUtils";

interface StyledPointProps {
  isMainPoint?: boolean;
  isSelected?: boolean;
  darkMode?: boolean;
  indent?: string;
  newLine?: boolean;
}

export const MainPointWrapper = styled.div`
  margin: auto;
  left: 0;
  right: 0;
`;

export const PointWrapper = styled.div<StyledPointProps>`
  --colorFG: ${(props) => blackOrWhite(props.darkMode, props.isSelected)[0]};
  --colorBG: ${(props) => blackOrWhite(props.darkMode, props.isSelected)[1]};

  :focus-within,
  :hover {
    border: 1px solid ${(props) => (props.darkMode ? "white" : "black")};
    border-radius: 3px;
  }

  margin: 2px 2px;
  padding-right: 1rem;
  background-color: var(--colorBG);
  border-radius: 3px;
`;

export const StyledDiv = styled.div<StyledPointProps>`
  position: relative;
`;

export const StyledButton = styled.button<StyledPointProps>`
  --colorFG: ${(props) => blackOrWhite(props.darkMode, props.isSelected)[0]};
  --colorBG: ${(props) => blackOrWhite(props.darkMode, props.isSelected)[1]};

  position: absolute;
  height: 1em;
  width: 1em;
  background: none;
  border: none;
  left: -0.2rem;
  z-index: 4;

  :focus {
    outline: none;
    & > svg {
      border: 1px solid var(--colorFG);
      border-radius: 3px;
    }
  }
`;

export const TextareaWrapper = styled.div<StyledPointProps>`
  --colorFG: ${(props) => blackOrWhite(props.darkMode, props.isSelected)[0]};
  --colorBG: ${(props) => blackOrWhite(props.darkMode, props.isSelected)[1]};

  & > textarea {
    color: var(--colorFG);

    font-size: ${(props) => (props.isMainPoint ? "medium" : "small")};
    font-weight: ${(props) => (props.isMainPoint ? "bold" : "normal")};
    text-indent: ${(props) => (props.indent ? props.indent : "1.8em")};

    ${(props) =>
      props.newLine &&
      ` top: 1rem;
      margin-bottom: 1rem;
    `};
  }
`;

export const StyledTextArea = styled(TextareaAutosize)`
  position: relative;
  width: 100%;
  border: 0;
  outline: none;
  overflow: hidden;
  resize: none;
  background-color: transparent;
  font-family: Arial;
`;
