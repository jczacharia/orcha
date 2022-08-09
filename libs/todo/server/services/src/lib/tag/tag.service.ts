import { Injectable } from '@nestjs/common';
import { TagRepository } from '@orcha/todo/server/domain';
import { Tag } from '@orcha/todo/shared/domain';
import { IQuery } from '@orcha/common';
import { Socket } from 'socket.io';
import { UserService } from '../user/user.service';

@Injectable()
export class TagService {
  readonly subscriptions = {
    /**
     * Gets all of a user's todo entities.
     * @param query Orcha query of todos.
     * @param token User's auth token.
     */
    listen: async (socket: Socket, query: IQuery<Tag[]>, token: string, channel: string) => {
      const userId = await this._user.verifyUserToken(token);
      return this._tagRepo.orcha.subscriptions.querySubscription(socket, channel, query, {
        user: { id: userId },
      });
    },

    onDisconnect: (socket: Socket) => {
      return this._tagRepo.orcha.subscriptions.onDisconnect(socket);
    },
  };

  constructor(private readonly _user: UserService, private readonly _tagRepo: TagRepository) {}
}
