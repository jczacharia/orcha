import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
import { Tag } from '@orcha/todo/shared/domain';
import { TagEntity } from './tag.entity';

@Injectable()
export class TagRepository extends IOrchaMikroOrmRepository<Tag, TagEntity> {
  constructor(@InjectRepository(TagEntity) public repo: EntityRepository<TagEntity>, public orm: MikroORM) {
    super(repo, orm);
  }
}
