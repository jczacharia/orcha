import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
import { TaggedTodo } from '@orcha/todo/shared/domain';
import { TaggedTodoEntity } from './tagged-todo.entity';

@Injectable()
export class TaggedTodoRepository extends IOrchaMikroOrmRepository<TaggedTodo, TaggedTodoEntity> {
  constructor(
    @InjectRepository(TaggedTodoEntity) public repo: EntityRepository<TaggedTodoEntity>,
    public orm: MikroORM
  ) {
    super(repo, orm);
  }
}
