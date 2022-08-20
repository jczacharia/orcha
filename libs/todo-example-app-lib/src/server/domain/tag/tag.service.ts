import { Injectable } from '@nestjs/common';
import { TagQueryModel } from '@todo-example-app-lib/shared';
import { UserService } from '../user/user.service';
import { TagRepoPort } from './tag-repo.port';

@Injectable()
export class TagService {
  constructor(private user: UserService, private tagRepo: TagRepoPort) {}

  async getMine(token: string) {
    const user = await this.user.verifyUserToken(token, { id: true });
    return this.tagRepo.findByUser(user.id, TagQueryModel);
  }
}
