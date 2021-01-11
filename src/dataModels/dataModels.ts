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

//TODO: make script in package.json for running typescript
export type PointShape =
  | "facts"
  | "thoughts"
  | "feelings"
  | "needs"
  | "topics"
  | "actions"
  | "people";

export const allPointShapes: PointShape[] = [
  "facts",
  "thoughts",
  "feelings",
  "needs",
  "topics",
  "actions",
  "people",
];

export function isPointShape(region: string): region is PointShape {
  return (allPointShapes as string[]).includes(region);
}

export type PointShapeWithEmpty = PointShape | "";

export type RegionI = PointShape | "merits" | "center";

export type RegionWithParkingI = RegionI | "parking";

export interface AuthorI {
  _id: string;
  name: string;
  color: string;
}

//make PointI extend PointNoIdI, if possible
// TODO: move this inside DraftPointCreateParams, and then delete
export interface PointNoIdI {
  content: string;
  shape: PointShape;
}

export interface PointI {
  content: string;
  _id: string;
  shape: PointShape;
  pointDate: Date;
}

export interface ReferenceLog {
  pointId: string;
  messageId: string;
  authorId: string;
}

export interface PointReferenceI {
  _id: string;
  referenceHistory: ReferenceLog[];
}

export interface PointReferenceWithShape extends PointReferenceI {
  shape: PointShape;
}

export type ShapesI = {
  [shape in PointShape]: string[];
};

export interface DraftMessageI {
  _id: string;
  revisionOf?: string;
  author: string;
  shapes: ShapesI;
  main?: string;
  createdAt: Date;
}

export interface MessageI {
  _id: string;
  revisionOf?: string;
  author: string;
  shapes: ShapesI;
  main: string;
  createdAt: Date;
}

export interface CursorPositionI {
  pointId: string;
  index: number;
}

export type HoverOptionsType =
  | "draftPoint"
  | "publishedPoint"
  | "draftMessage"
  | "publishedMessage";

export interface UserIdentity extends AuthorI {
  _rev: string;
}

//TODO: validate that main points are contained in the points array
