import { IOneToMany, IOrchaModel } from '@orcha/common';
import { Tag } from '../tag';
import { Todo } from '../todo';

export interface User extends IOrchaModel<string> {
  email: string;
  passwordHash: string;
  salt: string;
  dateCreated: Date;
  dateLastLoggedIn?: Date;
  todos: IOneToMany<Todo, 'user'>;
  tags: IOneToMany<Tag, 'user'>;
}
