import { TodoService } from '@orcha/todo/server/services';
import {
  CreateTodoDto,
  DeleteTodoDto,
  DeleteTodoQueryModel,
  ITodoOrchestration,
  OrchaTodoExampleAppOrchestrations,
  TagDto,
  Todo,
  TodoQueryModel,
  UnTagDto,
  UpdateTodoDto,
} from '@orcha/todo/shared/domain';
import { IPaginate, IQuery } from '@orcha/common';
import { IServerOrchestration, ServerOperation, ServerOrchestration } from '@orcha/nestjs';

@ServerOrchestration(OrchaTodoExampleAppOrchestrations.todo)
export class TodoOrchestration implements IServerOrchestration<ITodoOrchestration> {
  constructor(private readonly _todo: TodoService) {}

  @ServerOperation({ validateQuery: TodoQueryModel })
  create(query: IQuery<Todo>, token: string, dto: CreateTodoDto) {
    return this._todo.create(query, token, dto);
  }

  @ServerOperation({ validateQuery: TodoQueryModel })
  update(query: IQuery<Todo>, token: string, dto: UpdateTodoDto) {
    return this._todo.update(query, token, dto);
  }

  @ServerOperation({ validateQuery: DeleteTodoQueryModel })
  delete(query: IQuery<{ deletedId: string }>, token: string, dto: DeleteTodoDto) {
    return this._todo.delete(query, token, dto);
  }

  @ServerOperation({ validateQuery: TodoQueryModel })
  tag(query: IQuery<Todo>, token: string, dto: TagDto) {
    return this._todo.tag(query, token, dto);
  }

  @ServerOperation({ validateQuery: TodoQueryModel })
  untag(query: IQuery<Todo>, token: string, dto: UnTagDto) {
    return this._todo.untag(query, token, dto);
  }

  @ServerOperation({ validateQuery: TodoQueryModel })
  paginate(query: IQuery<Todo> & IPaginate, token: string) {
    return this._todo.paginate(query, token);
  }
}
