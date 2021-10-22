import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from '@orcha-todo-example-app/shared/domain';
import { IOrchaTypeormRepository } from '@orcha/typeorm';
import { Repository } from 'typeorm';
import { TodoEntity } from './todo.entity';

@Injectable()
export class TodoRepository extends IOrchaTypeormRepository<Todo> {
  constructor(@InjectRepository(TodoEntity) protected readonly _repo: Repository<Todo>) {
    super(_repo);
  }
}
