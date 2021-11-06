import { OnGatewayDisconnect } from '@nestjs/websockets';
import { TodoService } from '@orcha-todo-example-app/server/core/services';
import {
  ITodoGateway,
  OrchaTodoExampleAppGateways,
  Todo,
  TodoQueryModel,
} from '@orcha-todo-example-app/shared/domain';
import { IQuery } from '@orcha/common';
import { IServerGateway, ServerGateway, ServerSubscription } from '@orcha/nestjs';
import { Socket } from 'socket.io';

@ServerGateway(OrchaTodoExampleAppGateways.todo)
export class TodoGateway implements IServerGateway<ITodoGateway>, OnGatewayDisconnect {
  constructor(private readonly _todo: TodoService) {}

  @ServerSubscription({ validateQuery: TodoQueryModel })
  read(socket: Socket, query: IQuery<Todo[]>, token: string) {
    return this._todo.subscriptions.read(socket, query, token, 'read');
  }

  // Make sure to do this!!
  handleDisconnect(socket: Socket) {
    this._todo.subscriptions.onDisconnect(socket);
  }
}
