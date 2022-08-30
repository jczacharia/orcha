import { IPaginate } from '@orcha/common';
import { IServerController, ServerController, ServerOperation } from '@orcha/nestjs';
import { TodoService } from '@todo-example-app-lib/server';
import {
  CreateTodoDto,
  DeleteTodoDto,
  ITodoController,
  TagDto,
  TODO_CONTROLLER_NAME,
  UnTagDto,
  UpdateTodoDto,
} from '@todo-example-app-lib/shared';

@ServerController(TODO_CONTROLLER_NAME)
export class TodoController implements IServerController<ITodoController> {
  constructor(private todo: TodoService) {}

  @ServerOperation()
  getMine(token: string) {
    return this.todo.getMine(token);
  }

  @ServerOperation()
  create(token: string, dto: CreateTodoDto) {
    return this.todo.create(token, dto);
  }

  @ServerOperation()
  update(token: string, dto: UpdateTodoDto) {
    return this.todo.update(token, dto);
  }

  @ServerOperation()
  delete(token: string, dto: DeleteTodoDto) {
    return this.todo.delete(token, dto);
  }

  @ServerOperation()
  tag(token: string, dto: TagDto) {
    return this.todo.tag(token, dto);
  }

  @ServerOperation()
  untag(token: string, dto: UnTagDto) {
    return this.todo.untag(token, dto);
  }

  @ServerOperation()
  paginateAll(token: string, paginate: IPaginate) {
    return this.todo.paginateAll(token, paginate);
  }
}
