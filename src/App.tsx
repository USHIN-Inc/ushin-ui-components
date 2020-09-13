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
import React, { useState } from "react";
import SemanticScreen from "./components/SemanticScreen";
import { messages } from "./constants/initialState";
import { MessageState } from "./reducers/message";

const App = () => {
  const showShapes = true;
  const readOnly = false;
  const darkMode = true;

  const [message, setMessage] = useState<MessageState>(messages[0]);
  const onMessageChange = (message: MessageState) => {
    setMessage(message);
  };

  return (
    <SemanticScreen
      message={message}
      showShapes={showShapes}
      readOnly={readOnly}
      onMessageChange={onMessageChange}
      darkMode={darkMode}
    />
  );
};

export default App;
