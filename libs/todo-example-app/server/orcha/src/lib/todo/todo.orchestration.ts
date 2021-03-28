import { TodoService } from '@orcha-todo-example-app/server/core/services';
import {
  CreateTodoDto,
  DeleteTodoDto,
  DeleteTodoQueryModel,
  ITodoOrchestration,
  OrchaTodoExampleAppOrchestrations,
  Todo,
  TodoQueryModel,
  UpdateTodoDto,
} from '@orcha-todo-example-app/shared/domain';
import { IQuery } from '@orcha/common';
import { IServerOrchestration, ServerOperation, ServerOrchestration } from '@orcha/nestjs';

@ServerOrchestration(OrchaTodoExampleAppOrchestrations.todo)
export class TodoOrchestration implements IServerOrchestration<ITodoOrchestration> {
  constructor(private readonly todo: TodoService) {}

  @ServerOperation({ validateQuery: TodoQueryModel })
  create(query: IQuery<Todo>, token: string, dto: CreateTodoDto) {
    return this.todo.create(query, token, dto);
  }

  @ServerOperation({ validateQuery: TodoQueryModel })
  read(query: IQuery<Todo[]>, token: string) {
    return this.todo.read(query, token);
  }

  @ServerOperation({ validateQuery: TodoQueryModel })
  update(query: IQuery<Todo>, token: string, dto: UpdateTodoDto) {
    return this.todo.update(query, token, dto);
  }

  @ServerOperation({ validateQuery: DeleteTodoQueryModel })
  delete(query: IQuery<{ deletedId: string }>, token: string, dto: DeleteTodoDto) {
    return this.todo.delete(query, token, dto);
  }
}
