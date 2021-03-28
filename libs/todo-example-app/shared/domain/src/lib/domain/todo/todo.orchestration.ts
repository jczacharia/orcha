import { IOperation } from '@orcha/common';
import { CreateTodoDto, DeleteTodoDto, UpdateTodoDto } from './todo.dtos';
import { Todo } from './todo.model';

export interface ITodoOrchestration {
  create: IOperation<Todo, CreateTodoDto>;
  read: IOperation<Todo[]>;
  update: IOperation<Todo, UpdateTodoDto>;
  delete: IOperation<{ deletedId: string }, DeleteTodoDto>;
}
