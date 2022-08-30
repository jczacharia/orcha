import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IExactQuery, IParser, IQuery } from '@orcha/common';
import { IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
import { TaggedTodoRepoPort } from '@todo-example-app-lib/server';
import { TaggedTodo } from '@todo-example-app-lib/shared';
import { TagEntity } from '../tag/tag.entity';
import { TaggedTodoEntity } from './tagged-todo.entity';

@Injectable()
export class TaggedTodoRepoAdapter
  extends IOrchaMikroOrmRepository<TaggedTodo, TaggedTodoEntity>
  implements TaggedTodoRepoPort
{
  constructor(
    @InjectRepository(TaggedTodoEntity) public repo: EntityRepository<TaggedTodoEntity>,
    @InjectRepository(TagEntity) public tagRepo: EntityRepository<TagEntity>,
    public orm: MikroORM
  ) {
    super(repo, orm);
  }

  async findTaggedTodo<Q extends IQuery<TaggedTodo>>(
    todoId: number,
    tagId: string,
    query: IExactQuery<TaggedTodo, Q>
  ): Promise<IParser<TaggedTodo, Q> | null> {
    return this.orchaMikro.findOne({ tag: { id: tagId }, todo: { id: todoId } }, query);
  }
}
