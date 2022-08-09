import { OnGatewayDisconnect } from '@nestjs/websockets';
import { TodoService } from '@orcha/todo/server/services';
import {
  ITodoGateway,
  OrchaTodoExampleAppGateways,
  Todo,
  TodoListenOneDto,
  TodoQueryModel,
  TodoUpdateAndListenOneDto,
} from '@orcha/todo/shared/domain';
import { IQuery } from '@orcha/common';
import { IServerGateway, ServerGateway, ServerSubscription } from '@orcha/nestjs';
import { Socket } from 'socket.io';

@ServerGateway(OrchaTodoExampleAppGateways.todo)
export class TodoGateway implements IServerGateway<ITodoGateway>, OnGatewayDisconnect {
  constructor(private readonly _todo: TodoService) {}

  @ServerSubscription({ validateQuery: TodoQueryModel })
  listen(socket: Socket, query: IQuery<Todo[]>, token: string) {
    return this._todo.subscriptions.listen(socket, query, token, 'listen');
  }

  @ServerSubscription({ validateQuery: TodoQueryModel })
  listenOne(socket: Socket, query: IQuery<Todo[]>, token: string, dto: TodoListenOneDto) {
    return this._todo.subscriptions.listenOne(socket, query, token, dto, 'listenOne');
  }

  @ServerSubscription({ validateQuery: TodoQueryModel })
  updateAndListenOne(socket: Socket, query: IQuery<Todo[]>, token: string, dto: TodoUpdateAndListenOneDto) {
    return this._todo.subscriptions.updateAndListenOne(socket, query, token, dto, 'updateAndListenOne');
  }

  // Make sure to do this!!
  handleDisconnect(socket: Socket) {
    this._todo.subscriptions.onDisconnect(socket);
  }
}
