import { IOperation } from '@orcha/common';
import { TagDto, CreateTodoDto, DeleteTodoDto, UpdateTodoDto, UnTagDto } from './todo.dtos';
import { Todo } from './todo.model';

export interface ITodoOrchestration {
  create: IOperation<Todo, CreateTodoDto>;
  update: IOperation<Todo, UpdateTodoDto>;
  delete: IOperation<{ deletedId: string }, DeleteTodoDto>;
  tag: IOperation<Todo, TagDto>;
  untag: IOperation<Todo, UnTagDto>;
}
