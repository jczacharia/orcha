import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoEntity } from './todo/todo.entity';
import { TodoRepository } from './todo/todo.repository';
import { UserEntity } from './user/user.entity';
import { UserRepository } from './user/user.repository';

const entities = TypeOrmModule.forFeature([TodoEntity, UserEntity]);

const repositories: Provider[] = [TodoRepository, UserRepository];

@Module({
  imports: [entities],
  providers: repositories,
  exports: repositories,
})
export class ServicesCoreDomainModule {}
