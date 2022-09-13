import { TagQueryModel } from '../../../shared/domain/tag/tag.queries';
import { UserService } from '../user/user.service';
import { TagRepoPort } from './tag-repo.port';

export class TagService {
  constructor(private user: UserService, private tagRepo: TagRepoPort) {}

  async getMine(token: string) {
    const user = await this.user.verifyUserToken(token, {});
    return this.tagRepo.findByUser(user.id, TagQueryModel);
  }
}
