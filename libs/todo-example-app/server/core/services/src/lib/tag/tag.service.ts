import { Injectable } from '@nestjs/common';
import { TagRepository } from '@orcha-todo-example-app/server/core/domain';
import { Tag } from '@orcha-todo-example-app/shared/domain';
import { IQuery } from '@orcha/common';
import { Socket } from 'socket.io';
import { UserService } from '../user';

@Injectable()
export class TagService {
  readonly subscriptions = {
    /**
     * Gets all of a user's todo entities.
     * @param query Orcha query of todos.
     * @param token User's auth token.
     */
    read: async (socket: Socket, query: IQuery<Tag[]>, token: string, channel: string) => {
      const user = await this._user.verifyUserToken(token);
      return this._tagRepo.subscriptions.querySubscription(socket, channel, query, {
        where: { user: user.id },
      });
    },

    onDisconnect: (socket: Socket) => {
      return this._tagRepo.subscriptions.onDisconnect(socket);
    },
  };

  constructor(private readonly _user: UserService, private readonly _tagRepo: TagRepository) {}
}
