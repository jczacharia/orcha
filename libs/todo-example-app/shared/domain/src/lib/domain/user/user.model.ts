import { IOneToMany } from '@orcha/common';
import { Tag } from '../tag';
import { Todo } from '../todo';

export interface User {
  id: string;
  password: string;
  dateCreated: Date | string;
  dateLastLoggedIn?: Date | string;
  todos: IOneToMany<Todo>;
  tags: IOneToMany<Tag>;
}
