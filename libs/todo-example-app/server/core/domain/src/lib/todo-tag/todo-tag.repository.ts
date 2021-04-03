import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TodoTag } from '@orcha-todo-example-app/shared/domain';
import { IOrchaTypeormRepository } from '@orcha/typeorm';
import { Repository } from 'typeorm';
import { TodoTagEntity } from './todo-tag.entity';

@Injectable()
export class TodoTagRepository extends IOrchaTypeormRepository<TodoTag> {
  constructor(@InjectRepository(TodoTagEntity) protected readonly repo: Repository<TodoTag>) {
    super(repo);
  }
}
