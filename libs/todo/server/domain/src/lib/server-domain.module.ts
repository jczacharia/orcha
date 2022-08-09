import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, Provider } from '@nestjs/common';
import { TagEntity } from './tag/tag.entity';
import { TagRepository } from './tag/tag.repository';
import { TaggedTodoEntity } from './tagged-todo/tagged-todo.entity';
import { TaggedTodoRepository } from './tagged-todo/tagged-todo.repository';
import { TodoEntity } from './todo/todo.entity';
import { TodoRepository } from './todo/todo.repository';
import { UserEntity } from './user/user.entity';
import { UserRepository } from './user/user.repository';

const repositories: Provider[] = [TodoRepository, TagRepository, TaggedTodoRepository, UserRepository];

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [TagEntity, TodoEntity, TaggedTodoEntity, UserEntity],
    }),
  ],
  providers: repositories,
  exports: repositories,
})
export class ServicesDomainModule {}
