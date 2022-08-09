import { OnGatewayDisconnect } from '@nestjs/websockets';
import { TagService } from '@orcha/todo/server/services';
import {
  ITagGateway,
  OrchaTodoExampleAppGateways,
  Tag,
  TagQueryModel,
} from '@orcha/todo/shared/domain';
import { IQuery } from '@orcha/common';
import { IServerGateway, ServerGateway, ServerSubscription } from '@orcha/nestjs';
import { Socket } from 'socket.io';

@ServerGateway(OrchaTodoExampleAppGateways.tag)
export class TagGateway implements IServerGateway<ITagGateway>, OnGatewayDisconnect {
  constructor(private readonly _tag: TagService) {}

  @ServerSubscription({ validateQuery: TagQueryModel })
  listen(socket: Socket, query: IQuery<Tag[]>, token: string) {
    return this._tag.subscriptions.listen(socket, query, token, 'listen');
  }

  // Make sure to do this!!
  handleDisconnect(socket: Socket) {
    this._tag.subscriptions.onDisconnect(socket);
  }
}
