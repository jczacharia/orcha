import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IExactQuery, IParser, IQuery } from '@orcha/common';
import { IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
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
    return this.orchaMikro.find({ user: { id: userId } }, query);
  }
}
