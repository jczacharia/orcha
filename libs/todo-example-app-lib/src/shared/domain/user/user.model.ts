import { IOneToMany, IOrchaModel } from '@orcha/common';
import { Tag } from '../tag';
import { Todo } from '../todo';

export interface User extends IOrchaModel<string> {
  firstName: string | null;
  middleName: string | undefined;
  lastName: string | undefined;
  phone: string | undefined;

  email: string;
  passwordHash: string;
  salt: string;
  dateCreated: Date;
  dateUpdated: Date;
  dateLastLoggedIn: Date | undefined;
  todos: IOneToMany<Todo, 'user'>;
  tags: IOneToMany<Tag, 'user'>;
}
