import { TodoTagService } from '@orcha-todo-example-app/server/core/services';
import {
  CreateTodoTagDto,
  DeleteTodoTagDto,
  DeleteTodoTagQueryModel,
  ITodoTagOrchestration,
  OrchaTodoExampleAppOrchestrations,
  TodoTag,
  TodoTagQueryModel,
} from '@orcha-todo-example-app/shared/domain';
import { IQuery } from '@orcha/common';
import { IServerOrchestration, ServerOperation, ServerOrchestration } from '@orcha/nestjs';

@ServerOrchestration(OrchaTodoExampleAppOrchestrations.todoTag)
export class TodoTagOrchestration implements IServerOrchestration<ITodoTagOrchestration> {
  constructor(private readonly todoTag: TodoTagService) {}

  @ServerOperation({ validateQuery: TodoTagQueryModel })
  create(query: IQuery<TodoTag>, token: string, dto: CreateTodoTagDto) {
    return this.todoTag.create(query, token, dto);
  }

  @ServerOperation({ validateQuery: TodoTagQueryModel })
  read(query: IQuery<TodoTag>, token: string) {
    return this.todoTag.read(query, token);
  }

  @ServerOperation({ validateQuery: DeleteTodoTagQueryModel })
  delete(query: IQuery<{ deletedId: string }>, token: string, dto: DeleteTodoTagDto) {
    return this.todoTag.delete(query, token, dto);
  }
}
