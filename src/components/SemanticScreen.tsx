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
import React, { useMemo, useEffect } from "react";
import { Provider } from "react-redux";
import { createStore } from "../reducers/store";
import { MessageState } from "../reducers/message";
import { setMessage } from "../actions/messageActions";

import SemanticScreenLogic from "./SemanticScreenLogic";

const SemanticScreen = (props: {
  message?: MessageState;
  onMessageChange?: (message: MessageState) => void;
  showShapes?: boolean;
  readOnly?: boolean;
  darkMode?: boolean;
}) => {
  const { message, onMessageChange } = props;

  const store = useMemo(createStore, []);

  useEffect(() => {
    if (message && message !== store.getState().message) {
      store.dispatch(setMessage({ message: message }));
    }
  }, [store, message]);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      if (onMessageChange && store.getState().message !== message) {
        onMessageChange(store.getState().message);
      }
    });
    return () => unsubscribe();
  }, [store, onMessageChange, message]);

  return (
    <Provider store={store}>
      <SemanticScreenLogic
        showShapes={props.showShapes || true}
        readOnly={props.readOnly || false}
        darkMode={props.darkMode || false}
      />
    </Provider>
  );
};

export default SemanticScreen;
