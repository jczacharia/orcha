import { OnGatewayDisconnect } from '@nestjs/websockets';
import { TagService } from '@orcha-todo-example-app/server/core/services';
import {
  ITagGateway,
  OrchaTodoExampleAppGateways,
  Tag,
  TagQueryModel,
} from '@orcha-todo-example-app/shared/domain';
import { IQuery } from '@orcha/common';
import { IServerGateway, ServerGateway, ServerSubscription } from '@orcha/nestjs';
import { Socket } from 'socket.io';

@ServerGateway(OrchaTodoExampleAppGateways.tag)
export class TagGateway implements IServerGateway<ITagGateway>, OnGatewayDisconnect {
  constructor(private readonly _tag: TagService) {}

  @ServerSubscription({ validateQuery: TagQueryModel })
  read(socket: Socket, query: IQuery<Tag[]>, token: string) {
    console.log('new socket for tag gateway', socket.id);
    return this._tag.subscriptions.read(socket, query, token, 'read');
  }

  // Make sure to do this!!
  handleDisconnect(socket: Socket) {
    this._tag.subscriptions.onDisconnect(socket);
  }
}
