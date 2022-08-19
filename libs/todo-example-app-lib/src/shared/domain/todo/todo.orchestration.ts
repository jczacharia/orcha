import { IOperation, IPaginate, IPagination } from '@orcha/common';
import { CreateTodoDto, DeleteTodoDto, TagDto, UnTagDto, UpdateTodoDto } from './todo.dtos';
import { Todo } from './todo.model';
import { TodoQueryModel } from './todo.queries';

export interface ITodoOrchestration {
  create: IOperation<Todo, typeof TodoQueryModel, CreateTodoDto>;
  update: IOperation<Todo, typeof TodoQueryModel, UpdateTodoDto>;
  delete: IOperation<{ deletedId: string }, { deletedId: true }, DeleteTodoDto>;
  tag: IOperation<Todo, typeof TodoQueryModel, TagDto>;
  untag: IOperation<Todo, typeof TodoQueryModel, UnTagDto>;
  paginate: IOperation<IPagination<Todo>, typeof TodoQueryModel & IPaginate>;
}
