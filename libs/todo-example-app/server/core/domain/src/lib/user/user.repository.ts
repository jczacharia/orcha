import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@orcha-todo-example-app/shared/domain';
import { IOrchaTypeormRepository } from '@orcha/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends IOrchaTypeormRepository<User> {
  constructor(@InjectRepository(UserEntity) protected readonly repo: Repository<User>) {
    super(repo);
  }
}
