import { IManyToOne, IOneToMany } from '@orcha/common';
import { TaggedTodo } from '../tagged-todo';
import { User } from '../user';

export interface Todo {
  id: string;
  content: string;
  done: boolean;
  dateCreated: Date | string;
  dateUpdated: Date | string;
  user: IManyToOne<User, 'todos'>;
  taggedTodos: IOneToMany<TaggedTodo, 'todo'>;
}
