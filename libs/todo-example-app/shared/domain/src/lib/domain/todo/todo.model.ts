import { IManyToOne, IOneToMany } from '@orcha/common';
import { TodoTag } from '../todo-tag';
import { User } from '../user';

export interface Todo {
  id: string;
  content: string;
  done: boolean;
  dateCreated: Date | string;
  dateUpdated: Date | string;
  user: IManyToOne<Todo, User>;
  todoTags: IOneToMany<Todo, TodoTag>;
}
