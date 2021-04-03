import { IManyToOne, IOneToMany } from '@orcha/common';
import { TodoTag } from '../todo-tag';
import { User } from '../user';

export interface Tag {
  id: string;
  name: string;
  dateCreated: Date | string;
  dateUpdated: Date | string;
  user: IManyToOne<User>;
  todoTags: IOneToMany<TodoTag>;
}
