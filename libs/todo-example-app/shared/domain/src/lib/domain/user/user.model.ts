import { IOneToMany } from '@orcha/common';
import { Tag } from '../tag';
import { Todo } from '../todo';

export interface User {
  id: string;
  passwordHash: string;
  salt: string;
  dateCreated: Date | string;
  dateLastLoggedIn?: Date | string;
  todos: IOneToMany<User, Todo>;
  tags: IOneToMany<User, Tag>;
}
