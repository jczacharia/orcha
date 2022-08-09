import { ISubscription } from '@orcha/common';
import { TodoListenOneDto, TodoUpdateAndListenOneDto } from './todo.dtos';
import { Todo } from './todo.model';

export interface ITodoGateway {
  listen: ISubscription<Todo>;
  listenOne: ISubscription<Todo, TodoListenOneDto>;
  updateAndListenOne: ISubscription<Todo, TodoUpdateAndListenOneDto>;
}
