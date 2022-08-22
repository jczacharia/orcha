import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IExactQuery, IParser, IQuery } from '@orcha/common';
import { IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
import { TagRepoPort } from '@todo-example-app-lib/server';
import { Tag } from '@todo-example-app-lib/shared';
import { TagEntity } from './tag.entity';

@Injectable()
export class TagRepoAdapter extends IOrchaMikroOrmRepository<Tag, TagEntity> implements TagRepoPort {
  constructor(@InjectRepository(TagEntity) public repo: EntityRepository<TagEntity>, public orm: MikroORM) {
    super(repo, orm);
  }

  async findByNameAndUser<Q extends IQuery<Tag>>(
    tagName: string,
    userId: string,
    query: IExactQuery<Tag, Q>
  ): Promise<IParser<Tag, Q> | null> {
    return this.orchaMikro.findOne({ name: tagName, user: { id: userId } }, query);
  }

  async findByUser<Q extends IQuery<Tag>>(
    userId: string,
    query: IExactQuery<Tag, Q>
  ): Promise<IParser<Tag[], Q>> {
    return this.orchaMikro.find({ user: { id: userId } }, query);
  }
}
