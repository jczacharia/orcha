import { EntityRepository, MikroORM, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IExactQuery, IParser, IQuery, parseQuery } from '@orcha/common';
import { createMikroOrmPopulateArray, IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
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
    const populate = createMikroOrmPopulateArray(query);
    const entity = await this.repo.findOne({ tag: { id: tagId }, todo: { id: todoId } }, { populate });
    if (!entity) {
      return null;
    }
    const json = wrap(entity).toJSON();
    return parseQuery(json, query);
  }

  async deleteTaggedTodoAndLonelyTags(taggedTodoId: TaggedTodo['id']): Promise<TaggedTodo['id']> {
    const taggedTodo = await this.repo.findOneOrFail(taggedTodoId);
    this.repo.remove(taggedTodo);
    const tags = await this.tagRepo.findAll({ populate: ['taggedTodos'] });
    const lonelyTags = tags.filter((tag) => tag.taggedTodos.length === 0);
    this.tagRepo.remove(lonelyTags);
    await this.repo.flush();
    return taggedTodoId;
  }
}
