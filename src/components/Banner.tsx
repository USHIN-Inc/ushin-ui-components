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
import React from "react";
import styled from "styled-components";

interface Placement {
  top: string;
  right: string;
}

const Banner = (props: {
  text: string;
  color: string;
  placement: Placement;
  darkMode: boolean;
}) => (
  // \u00A0 adds extra spaces on either side of the text
  <BannerView
    color={props.color}
    onClick={console.log}
    top={props.placement.top}
    right={props.placement.right}
    darkMode={props.darkMode}
  >
    {`\u00A0 ${props.text} \u00A0`}
  </BannerView>
);

interface BannerViewProps extends Placement {
  darkMode: boolean;
}

const BannerView = styled.div<BannerViewProps>`
  position: absolute;
  color: ${(props) => (props.darkMode ? "#fff" : "#000")};
  text-align: center;
  font-size: medium;
  top: ${(props) => props.top};
  right: ${(props) => props.right};
  padding: 0;
  z-index: 1;
  cursor: pointer;
  background-color: ${(props) => (props.darkMode ? "#000" : "#fff")};

  &:before {
    content: "";
    position: absolute;
    background-image: ${(props) =>
      `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' height='450' width='450' preserveAspectRatio='none'> <path d='M391.908 347.474c-2.816 9.508-9.271 16.797-23.376 21.095 0 0-73.876 28.625-143.069 0-69.194-28.627-143.066 0-143.066 0-12.913 0-23.378-9.44-23.378-21.095V89.287c5.229-11.555 12.51-17.483 23.469-21.826 0 0 64.284-31.412 142.975.73 78.504 32.068 143.069 0 143.069 0 12.911 0 23.376 9.446 23.376 21.096z' fill='${
        props.color && props.color.replace("#", "%23")
      }' fill-opacity='0.1' stroke='${
        props.color && props.color.replace("#", "%23")
      }' stroke-width='1.5' vector-effect='non-scaling-stroke'/></svg>")`};
    background-repeat: no-repeat;
    background-size: 133% 120%;
    background-position: center;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
`;

export default Banner;
