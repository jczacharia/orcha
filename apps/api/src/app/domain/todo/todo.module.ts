import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import {
  TaggedTodoRepoPort,
  TagRepoPort,
  TodoRepoPort,
  TodoService,
  UserService,
} from '@todo-example-app-lib/server';
import { TagEntity } from '../tag/tag.entity';
import { TagModule } from '../tag/tag.module';
import { TaggedTodoModule } from '../tagged-todo/tagged-todo.module';
import { UserModule } from '../user/user.module';
import { TodoRepoAdapter } from './todo-repo.adapter';
import { TodoEntity } from './todo.entity';
import { TodoOrchestration } from './todo.orchestration';

@Module({
  imports: [
    UserModule,
    TagModule,
    TaggedTodoModule,
    MikroOrmModule.forFeature({ entities: [TodoEntity, TagEntity] }),
  ],
  controllers: [TodoOrchestration],
  providers: [
    {
      provide: TodoRepoPort,
      useClass: TodoRepoAdapter,
    },
    {
      inject: [UserService, TodoRepoPort, TagRepoPort, TaggedTodoRepoPort],
      provide: TodoService,
      useFactory: (
        userService: UserService,
        todoRepo: TodoRepoPort,
        tagRepo: TagRepoPort,
        taggedTodoRepo: TaggedTodoRepoPort
      ) => new TodoService(userService, todoRepo, tagRepo, taggedTodoRepo),
    },
  ],
})
export class TodoModule {}
