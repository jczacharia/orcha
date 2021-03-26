import { IManyToOne } from '@orcha/common';
import { User } from '../user';

export interface Todo {
  id: string;
  content: string;
  done: boolean;
  dateCreated: Date | string;
  dateUpdated: Date | string;
  user: IManyToOne<Todo, User>;
}
