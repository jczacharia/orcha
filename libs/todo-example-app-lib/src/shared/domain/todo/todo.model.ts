import { IOneToMany, IOneToOne, IOrchaModel } from '@orcha/common';
import { TaggedTodo } from '../tagged-todo';
import { User } from '../user';

export interface Todo extends IOrchaModel<number> {
  content: string;
  done: boolean;
  dateCreated: Date;
  dateUpdated: Date;
  user: IOneToOne<User, 'todos'>;
  taggedTodos: IOneToMany<TaggedTodo, 'todo'>;
}
