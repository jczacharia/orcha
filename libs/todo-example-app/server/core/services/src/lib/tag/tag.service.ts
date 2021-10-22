import { Injectable } from '@nestjs/common';
import { TagRepository } from '@orcha-todo-example-app/server/core/domain';
import { Tag } from '@orcha-todo-example-app/shared/domain';
import { IQuery } from '@orcha/common';
import { UserService } from '../user';

@Injectable()
export class TagService {
  constructor(private readonly user: UserService, private readonly tagRepo: TagRepository) {}

  /**
   * Gets all of a user's todo entities.
   * @param query Orcha query of todos.
   * @param token User's auth token.
   */
  async read(query: IQuery<Tag[]>, token: string) {
    const user = await this.user.verifyUserToken(token);
    return this.tagRepo.query(query, { where: { user: user.id } });
  }
}
