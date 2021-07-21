import { TodoService } from '@orcha-todo-example-app/server/core/services';
import { ITodoGateway, OrchaTodoExampleAppOrchestrations } from '@orcha-todo-example-app/shared/domain';
import { IServerGateway, ServerGateway, ServerSubscription } from '@orcha/nestjs';
import { Socket } from 'socket.io';

@ServerGateway(OrchaTodoExampleAppOrchestrations.todo)
export class TodoGateway implements IServerGateway<ITodoGateway> {
  constructor(private readonly todo: TodoService) {}

  @ServerSubscription()
  read(socket: Socket, a: any) {
    return this.todo.todoRepo.subscriptions.querySubscription(socket, 'read', a.query);
  }
}
