import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '@orcha-todo-example-app/shared/domain';
import { IOrchaTypeormRepository } from '@orcha/typeorm';
import { Repository } from 'typeorm';
import { TagEntity } from './tag.entity';

@Injectable()
export class TagRepository extends IOrchaTypeormRepository<Tag> {
  constructor(@InjectRepository(TagEntity) protected readonly repo: Repository<Tag>) {
    super(repo);
  }
}
