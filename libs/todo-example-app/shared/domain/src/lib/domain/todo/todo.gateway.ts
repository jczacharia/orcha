import { ISubscription } from '@orcha/common';
import { Todo } from './todo.model';

export interface ITodoGateway {
  read: ISubscription<Todo[]>;
}
