import { IManyToOne, IOneToMany, IOrchaModel } from '@orcha/common';
import { TaggedTodo } from '../tagged-todo';
import { User } from '../user';

export interface Tag extends IOrchaModel<string> {
  name: string;
  dateCreated: Date;
  dateUpdated: Date;
  user: IManyToOne<User, 'tags'>;
  taggedTodos: IOneToMany<TaggedTodo, 'tag'>;
}
