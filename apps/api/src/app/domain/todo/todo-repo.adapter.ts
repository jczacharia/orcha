import { EntityRepository, MikroORM, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IExactQuery, IParser, IQuery, parseQuery } from '@orcha/common';
import { createMikroOrmPopulateArray, IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
import { TodoRepoPort } from '@todo-example-app-lib/server';
import { Todo } from '@todo-example-app-lib/shared';
import { TagEntity } from '../tag/tag.entity';
import { TodoEntity } from './todo.entity';

@Injectable()
export class TodoRepoAdapter extends IOrchaMikroOrmRepository<Todo, TodoEntity> implements TodoRepoPort {
  constructor(
    @InjectRepository(TodoEntity) public repo: EntityRepository<TodoEntity>,
    @InjectRepository(TagEntity) public tagRepo: EntityRepository<TagEntity>,
    public orm: MikroORM
  ) {
    super(repo, orm);
  }

  async getByUser<Q extends IQuery<Todo>>(
    userId: string,
    query: IExactQuery<Todo, Q>
  ): Promise<IParser<Todo[], Q>> {
    const populate = createMikroOrmPopulateArray(query);
    const entities = await this.repo.find({ user: { id: userId } }, { populate });
    const json = entities.map((e) => wrap(e).toJSON());
    return parseQuery(json, query);
  }

  async deleteTodoAndLonelyTags(todoId: Todo['id']): Promise<Todo['id']> {
    const todo = await this.repo.findOneOrFail(todoId, { populate: ['taggedTodos'] });
    todo.taggedTodos.removeAll();
    this.repo.remove(todo);
    const tags = await this.tagRepo.findAll({ populate: ['taggedTodos'] });
    const lonelyTags = tags.filter((tag) => tag.taggedTodos.length === 0);
    this.tagRepo.remove(lonelyTags);
    await this.repo.flush();
    return todoId;
  }
}
