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
import { useState } from "react";

export function useHoverOptions() {
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const renderHamburger = isHovered && !showOptions;
  const renderHoverOptions = isHovered && showOptions;

  const handleHamburgerMouseEnter = (e: React.MouseEvent) => {
    setShowOptions(true);
    e.stopPropagation();
  };

  const handlePointMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    e.stopPropagation();
  };

  const handlePointMouseLeave = (e: React.MouseEvent) => {
    setIsHovered(false);
    setShowOptions(false);
    e.stopPropagation();
  };

  return {
    isHovered,
    renderHamburger,
    renderHoverOptions,
    handleHamburgerMouseEnter,
    handlePointMouseEnter,
    handlePointMouseLeave,
  };
}
