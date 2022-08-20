import { IOperation, IPaginate, IPagination } from '@orcha/common';
import { CreateTodoDto, DeleteTodoDto, TagDto, UnTagDto, UpdateTodoDto } from './todo.dtos';
import { Todo } from './todo.model';
import { TodoQueryModel } from './todo.queries';

export const TODO_ORCHESTRATION_NAME = 'todo';

export interface ITodoOrchestration {
  getMine: IOperation<Todo[], typeof TodoQueryModel>;
  create: IOperation<Todo, typeof TodoQueryModel, CreateTodoDto>;
  update: IOperation<Todo, typeof TodoQueryModel, UpdateTodoDto>;
  delete: IOperation<{ deletedId: Todo['id'] }, { deletedId: true }, DeleteTodoDto>;
  tag: IOperation<Todo, typeof TodoQueryModel, TagDto>;
  untag: IOperation<Todo, typeof TodoQueryModel, UnTagDto>;
  paginateAll: IOperation<IPagination<Todo>, typeof TodoQueryModel, IPaginate>;
}
