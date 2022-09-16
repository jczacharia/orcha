import { IOperationSimple, IOperationPaginate } from '@orcha/common';
import { CreateTodoDto, DeleteTodoDto, TagDto, UnTagDto, UpdateTodoDto } from './todo.dtos';
import { Todo } from './todo.model';
import { TodoQueryModel } from './todo.queries';

export const TODO_CONTROLLER_NAME = 'todo';

export interface ITodoController {
  getMine: IOperationSimple<Todo[], typeof TodoQueryModel>;
  create: IOperationSimple<Todo, typeof TodoQueryModel, CreateTodoDto>;
  update: IOperationSimple<Todo, typeof TodoQueryModel, UpdateTodoDto>;
  delete: IOperationSimple<{ deletedId: Todo['id'] }, { deletedId: true }, DeleteTodoDto>;
  tag: IOperationSimple<Todo, typeof TodoQueryModel, TagDto>;
  untag: IOperationSimple<Todo, typeof TodoQueryModel, UnTagDto>;
  paginateAll: IOperationPaginate<Todo, typeof TodoQueryModel>;
}
