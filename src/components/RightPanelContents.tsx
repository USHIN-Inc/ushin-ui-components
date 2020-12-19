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
import React, { useState } from "react";
import styled from "styled-components";
import { connect } from "react-redux";

import { AppState } from "../reducers/store";

import MessageListItem from "./MessageListItem";
import { blackOrWhite } from "../dataModels/pointUtils";
import Banner from "./Banner";
import {
  searchByContent,
  SearchByContentParams,
} from "../actions/searchActions";

interface OwnProps {
  darkMode?: boolean;
}

interface AllProps extends OwnProps {
  authorId: string;
  results: string[];
  searchByContent: (params: SearchByContentParams) => void;
}

const RightPanelContents = (props: AllProps) => {
  const { results, searchByContent } = props;

  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = () => {
    console.log(searchQuery);
    searchByContent({ searchQuery });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      <Banner
        authorId={props.authorId}
        placement={{ top: "0", right: "0" }}
        fontSize={"large"}
        darkMode={props.darkMode}
      />
      <SearchDiv darkMode={props.darkMode}>
        <StyledInput
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          darkMode={props.darkMode}
        />{" "}
        <StyledSvg
          onClick={handleSubmit}
          darkMode={props.darkMode}
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"
          />
          <path
            fill-rule="evenodd"
            d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"
          />
        </StyledSvg>
      </SearchDiv>
      <ResultsContainer>
        {results.map((_id: string, i: number) => (
          <MessageListItem
            key={_id}
            type="persistedMessage"
            messageId={_id}
            index={i}
            darkMode={props.darkMode}
          />
        ))}
      </ResultsContainer>
    </>
  );
};

interface StyledProps {
  darkMode?: boolean;
}

const SearchDiv = styled.div<StyledProps>`
  position: relative;
  border: 1.5px solid ${(props) => (props.darkMode ? "white" : "black")};
  border-radius: 3px;
  margin: 2rem 0.2rem 0 0.2rem;
`;

const StyledInput = styled.input<StyledProps>`
  font: Arial;
  width: calc(100% - 2em);

  ${(props) =>
    props.darkMode
      ? `
    color: white;
    background-color: black;
    border: none;`
      : `
    color: black;
    background-color: white;
    border: none;
  `}
`;

const StyledSvg = styled.svg<StyledProps>`
  --colorFG: ${(props) => blackOrWhite(props.darkMode)[0]};
  --colorBG: ${(props) => blackOrWhite(props.darkMode)[1]};

  position: absolute;
  top: 0;
  right: 0.4rem;
  bottom: 0;
  margin: auto 0;
  height: 1rem;
  width: 1rem;
  fill: var(--colorFG);
`;

const ResultsContainer = styled.div`
  overflow-x: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0.2rem;
  margin-top: 0.5rem;
`;

const mapStateToProps = (state: AppState) => {
  const { results } = state.search;

  return {
    authorId: state.userIdentities.currentIdentity,
    results,
  };
};

const mapActionsToProps = {
  searchByContent,
};

export default connect(mapStateToProps, mapActionsToProps)(RightPanelContents);
