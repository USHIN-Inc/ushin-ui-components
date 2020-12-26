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
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import { store } from "./reducers/store";
import { connect, Provider } from "react-redux";

import { AppState } from "./reducers/store";
import { DBState } from "./reducers/db";
import { DisplayAppState } from "./reducers/displayApp";
import { DraftMessagesState } from "./reducers/draftMessages";
import { DraftPointsState } from "./reducers/draftPoints";
import { SemanticScreenState } from "./reducers/semanticScreen";

import { loadDatabase } from "./actions/dbActions";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const mapStateToProps = (state: AppState) => {
  return {
    db: state.db,
    displayApp: state.displayApp,
    draftMessages: state.draftMessages,
    draftPoints: state.draftPoints,
    semanticScreen: state.semanticScreen,
  };
};

const mapActionsToProps = {
  loadDatabase,
};

interface Props {
  db: DBState;
  displayApp: DisplayAppState;
  draftMessages: DraftMessagesState;
  draftPoints: DraftPointsState;
  loadDatabase: () => void;
  semanticScreen: SemanticScreenState;
}

const AppWithPersistence = connect(
  mapStateToProps,
  mapActionsToProps
)(
  ({
    db,
    displayApp,
    draftMessages,
    draftPoints,
    loadDatabase,
    semanticScreen,
  }: Props) => {
    const localStorageState = { draftMessages, draftPoints, semanticScreen };

    localStorage.setItem(
      "localStorageState",
      JSON.stringify(localStorageState)
    );

    useEffect(() => {
      if (db?.loading) loadDatabase();
    }, [db, loadDatabase]);

    if (!displayApp.display) return null;

    return <App />;
  }
);

ReactDOM.render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
      <Provider store={store}>
        <AppWithPersistence />
      </Provider>
    </DndProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
