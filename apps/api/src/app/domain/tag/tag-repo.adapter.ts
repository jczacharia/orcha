import { EntityRepository, MikroORM, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IExactQuery, IParser, IQuery, parseQuery } from '@orcha/common';
import { createMikroOrmPopulateArray, IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
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
    const populate = createMikroOrmPopulateArray(query);
    const entity = await this.repo.findOne({ name: tagName, user: { id: userId } }, { populate });
    if (!entity) {
      return null;
    }
    const json = wrap(entity).toJSON();
    return parseQuery(json, query);
  }

  async findByUser<Q extends IQuery<Tag>>(
    userId: string,
    query: IExactQuery<Tag, Q>
  ): Promise<IParser<Tag[], Q>> {
    const populate = createMikroOrmPopulateArray(query);
    const entities = await this.repo.find({ user: { id: userId } }, { populate });
    const json = entities.map((e) => wrap(e).toJSON());
    return parseQuery(json, query);
  }
}
