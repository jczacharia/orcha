import { IOneToMany } from '@orcha/common';
import { Todo } from '../todo';

export interface User {
  id: string;
  password: string;
  dateCreated: Date | string;
  dateLastLoggedIn?: Date | string;
  todos: IOneToMany<User, Todo>;
}
