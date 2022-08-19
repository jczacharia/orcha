import { EntityRepository, MikroORM, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { IProps } from '@orcha/common';
import { IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
import { UserRepoPort } from '@todo-example-app-lib/server';
import { User } from '@todo-example-app-lib/shared';
import { IExactQuery, IQueryObject } from 'libs/common/src/lib/query';
import { nanoid } from 'nanoid';
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

  async createUser(email: string, passwordHash: string, salt: string): Promise<IProps<User>> {
    const user = this.repo.create({ id: nanoid(), dateCreated: new Date(), email, passwordHash, salt });
    await this.repo.persistAndFlush(user);
    return wrap(user).toJSON();
  }

  async findOne(id: string): Promise<IProps<User> | null> {
    const user = await this.repo.findOne({ id });
    if (!user) {
      return null;
    }
    return wrap(user).toJSON();
  }

  async findOneOrFail(id: string): Promise<IProps<User>> {
    const user = await this.repo.findOneOrFail({ id });
    return wrap(user).toJSON();
  }

  async updateProps(id: string, model: Partial<IProps<User>>): Promise<IProps<User>> {
    const user = await this.repo.findOneOrFail({ id });
    wrap(user).assign(model);
    return user;
  }

  orchaFindOne<Q extends IQueryObject<User>>(id: string, query: IExactQuery<User, Q>) {
    return this.orcha.findOne(id, query);
  }

  orchaFindOneOrFail<Q extends IQueryObject<User>>(id: string, query: IExactQuery<User, Q>) {
    return this.orcha.findOneOrFail(id, query);
  }
}
