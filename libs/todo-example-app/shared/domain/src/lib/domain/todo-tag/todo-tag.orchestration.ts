import { IOperation } from '@orcha/common';
import { CreateTodoTagDto, DeleteTodoTagDto } from './todo-tag.dtos';
import { TodoTag } from './todo-tag.model';

export interface ITodoTagOrchestration {
  create: IOperation<TodoTag, CreateTodoTagDto>;
  read: IOperation<TodoTag[]>;
  delete: IOperation<{ deletedId: string }, DeleteTodoTagDto>;
}
