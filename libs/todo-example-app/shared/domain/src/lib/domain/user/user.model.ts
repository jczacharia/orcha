import { IOneToMany } from '@orcha/common';
import { Tag } from '../tag';
import { Todo } from '../todo';

export interface User {
  id: string;
  password: string;
  dateCreated: Date | string;
  dateLastLoggedIn?: Date | string;
  dg: string[];
  todos: IOneToMany<User, Todo>;
  tags: IOneToMany<User, Tag>;
}
