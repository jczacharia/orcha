import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from './tag/tag.entity';
import { TagRepository } from './tag/tag.repository';
import { TodoTagEntity } from './todo-tag/todo-tag.entity';
import { TodoTagRepository } from './todo-tag/todo-tag.repository';
import { TodoEntity } from './todo/todo.entity';
import { TodoRepository } from './todo/todo.repository';
import { UserEntity } from './user/user.entity';
import { UserRepository } from './user/user.repository';

const entities = TypeOrmModule.forFeature([TagEntity, TodoEntity, TodoTagEntity, UserEntity]);

const repositories: Provider[] = [TodoRepository, TagRepository, TodoTagRepository, UserRepository];

@Module({
  imports: [entities],
  providers: repositories,
  exports: repositories,
})
export class ServicesCoreDomainModule {}
