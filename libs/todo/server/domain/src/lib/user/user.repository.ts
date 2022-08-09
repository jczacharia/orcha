import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
import { User } from '@orcha/todo/shared/domain';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends IOrchaMikroOrmRepository<User, UserEntity> {
  constructor(@InjectRepository(UserEntity) public repo: EntityRepository<UserEntity>, public orm: MikroORM) {
    super(repo, orm);
  }
}
