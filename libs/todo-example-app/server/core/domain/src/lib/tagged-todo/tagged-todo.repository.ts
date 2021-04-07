import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaggedTodo } from '@orcha-todo-example-app/shared/domain';
import { IOrchaTypeormRepository } from '@orcha/typeorm';
import { Repository } from 'typeorm';
import { TaggedTodoEntity } from './tagged-todo.entity';

@Injectable()
export class TaggedTodoRepository extends IOrchaTypeormRepository<TaggedTodo> {
  constructor(@InjectRepository(TaggedTodoEntity) protected readonly repo: Repository<TaggedTodo>) {
    super(repo);
  }
}
