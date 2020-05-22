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
//TODO: how to confirm that focus point exists in the array of points
//contained in the semscreen?
import { AuthorI, PointI, MessageI } from '../interfaces';

const authors: AuthorI[] = [
  { 
    name: 'KindWoman',
    authorDate: new Date(),
    authorId: 'user1',
    styles: {
      textColor: '#111',
      backgroundColor: '#eee',
    },
  },
]

const points: PointI[] = [
  {
    author: authors[0],
    content: 'Online Deliberation (focus)',
    shape: 'Topics',
    pointId: 'point1',
    pointDate: new Date(),
  },
  {
    author: authors[0],
    content: 'Build an open, collaborative, compassionate system to share information and make decisions (main point)',
    shape: 'Actions',
    pointId: 'point2',
    pointDate: new Date(),
  },
  {
    author: authors[0],
    content: 'Create a frontend which can ride on federated and distributed backends, such as IPFS.',
    shape: 'Actions',
    pointId: 'point1',
    pointDate: new Date(),
  },
  {
    author: authors[0],
    content: 'Build an open, collaborative, compassionate system to share information and make decisions',
    shape: 'Actions',
    pointId: 'point2',
    pointDate: new Date(),
  },
  {
    author: authors[0],
    content: 'Build an open, collaborative, compassionate system to share information and make decisions',
    shape: 'Actions',
    pointId: 'point2',
    pointDate: new Date(),
  },
  {
    author: authors[0],
    content: 'Create a frontend which can ride on federated and distributed backends, such as IPFS.',
    shape: 'Actions',
    pointId: 'point1',
    pointDate: new Date(),
  },
  {
    author: authors[0],
    content: 'Build an open, collaborative, compassionate system to share information and make decisions',
    shape: 'Actions',
    pointId: 'point2',
    pointDate: new Date(),
  },
]

const messages: MessageI[] = [
  {
    author: authors[0],
    points: points,
    focus: points.slice(0,1),
    mainPoint: points[1],
    messageId: 'semscreen1',
    messageDate: new Date(),
  },
]

export { messages };
