import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IOrchaMikroOrmRepository } from '@orcha/mikro-orm';
import { Todo } from '@orcha/todo/shared/domain';
import { TodoEntity } from './todo.entity';

@Injectable()
export class TodoRepository extends IOrchaMikroOrmRepository<Todo, TodoEntity> {
  constructor(@InjectRepository(TodoEntity) public repo: EntityRepository<TodoEntity>, public orm: MikroORM) {
    super(repo, orm);
  }
}
