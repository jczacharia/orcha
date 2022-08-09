import { IOneToMany, IOneToOne, IOrchaModel } from '@orcha/common';
import { Tag } from '../tag';
import { Todo } from '../todo';

export interface User extends IOrchaModel<string> {
  passwordHash: string;
  salt: string;
  dateCreated: Date | string;
  dateLastLoggedIn?: Date | string;
  todos: IOneToMany<Todo, 'user'>;
  tags: IOneToMany<Tag, 'user'>;
}
