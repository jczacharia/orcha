import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { IExactQuery, IParser, IQuery } from '@orcha/common';
import { IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
import { UserRepoPort } from '@todo-example-app-lib/server';
import { User } from '@todo-example-app-lib/shared';
import { UserEntity } from './user.entity';

export class UserRepoAdapter extends IOrchaMikroOrmRepository<User, UserEntity> implements UserRepoPort {
  constructor(@InjectRepository(UserEntity) public repo: EntityRepository<UserEntity>, public orm: MikroORM) {
    super(repo, orm);
  }

  findByEmail<Q extends IQuery<User>>(
    email: string,
    query: IExactQuery<User, Q>
  ): Promise<IParser<User, Q> | null> {
    return this.orchaMikro.findOne({ email }, query);
  }

  findByEmailOrFail<Q extends IQuery<User>>(
    email: string,
    query: IExactQuery<User, Q>
  ): Promise<IParser<User, Q>> {
    return this.orchaMikro.findOneOrFail({ email }, query);
  }
}
