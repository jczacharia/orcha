import { IOneToMany, IOrchaModel, ORCHA_VIEW } from '@orcha/common';
import { Tag } from '../tag';
import { Todo } from '../todo';

export interface User extends IOrchaModel<string> {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  phone: string | null;

  email: string;
  passwordHash: string;
  salt: string;
  dateCreated: Date;
  dateUpdated: Date;
  dateLastLoggedIn: Date | null;
  todos: IOneToMany<Todo, 'user'>;
  tags: IOneToMany<Tag, 'user'>;

  [ORCHA_VIEW]: { numOfTodos: number };
}
