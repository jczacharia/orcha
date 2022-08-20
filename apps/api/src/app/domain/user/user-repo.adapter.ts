import { EntityRepository, MikroORM, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { IProps } from '@orcha/common';
import { IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
import { UserRepoPort } from '@todo-example-app-lib/server';
import { User } from '@todo-example-app-lib/shared';
import { UserEntity } from './user.entity';

export class UserRepoAdapter extends IOrchaMikroOrmRepository<User, UserEntity> implements UserRepoPort {
  constructor(@InjectRepository(UserEntity) public repo: EntityRepository<UserEntity>, public orm: MikroORM) {
    super(repo, orm);
  }

  async findByEmail(email: string): Promise<IProps<User> | null> {
    const user = await this.repo.findOne({ email });
    if (!user) {
      return null;
    }
    return wrap(user).toJSON();
  }

  async findByEmailOrFail(email: string): Promise<IProps<User>> {
    const user = await this.repo.findOneOrFail({ email });
    return wrap(user).toJSON();
  }
}
