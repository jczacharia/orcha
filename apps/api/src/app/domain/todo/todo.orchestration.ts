import { IPaginate } from '@orcha/common';
import { IServerOrchestration, Operation, OrchestrationController } from '@orcha/nestjs';
import { TodoService } from '@todo-example-app-lib/server';
import {
  CreateTodoDto,
  DeleteTodoDto,
  ITodoOrchestration,
  TagDto,
  TODO_ORCHESTRATION_NAME,
  UnTagDto,
  UpdateTodoDto,
} from '@todo-example-app-lib/shared';

@OrchestrationController(TODO_ORCHESTRATION_NAME)
export class TodoOrchestration implements IServerOrchestration<ITodoOrchestration> {
  constructor(private todo: TodoService) {}

  @Operation()
  getMine(token: string) {
    return this.todo.getMine(token);
  }

  @Operation()
  create(token: string, dto: CreateTodoDto) {
    return this.todo.create(token, dto);
  }

  @Operation()
  update(token: string, dto: UpdateTodoDto) {
    return this.todo.update(token, dto);
  }

  @Operation()
  delete(token: string, dto: DeleteTodoDto) {
    return this.todo.delete(token, dto);
  }

  @Operation()
  tag(token: string, dto: TagDto) {
    return this.todo.tag(token, dto);
  }

  @Operation()
  untag(token: string, dto: UnTagDto) {
    return this.todo.untag(token, dto);
  }

  @Operation()
  paginateAll(token: string, paginate: IPaginate) {
    return this.todo.paginateAll(token, paginate);
  }
}
