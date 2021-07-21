import { IGateway, IOperation, ISubscription } from '@orcha/common';
import { TagDto, CreateTodoDto, DeleteTodoDto, UpdateTodoDto, UnTagDto } from './todo.dtos';
import { Todo } from './todo.model';

export interface ITodoGateway {
  read: ISubscription<Todo[]>;
}
