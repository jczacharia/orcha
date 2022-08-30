import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrchaDbTransactionalPort } from '@orcha/common';
import { OrchaMikroOrmTransactional } from '@orcha/mikro-orm';
import {
  AuthPort,
  TaggedTodoRepoPort,
  TagRepoPort,
  TagService,
  TodoRepoPort,
  TodoService,
  UserRepoPort,
  UserService,
} from '@todo-example-app-lib/server';
import { TagRepoAdapter } from './tag/tag-repo.adapter';
import { TagController } from './tag/tag.controller';
import { TagEntity } from './tag/tag.entity';
import { TaggedTodoRepoAdapter } from './tagged-todo/tagged-todo-repo.adapter';
import { TaggedTodoEntity } from './tagged-todo/tagged-todo.entity';
import { TodoRepoAdapter } from './todo/todo-repo.adapter';
import { TodoController } from './todo/todo.controller';
import { TodoEntity } from './todo/todo.entity';
import { AuthAdapter } from './user/auth.adapter';
import { UserRepoAdapter } from './user/user-repo.adapter';
import { UserController } from './user/user.controller';
import { UserEntity } from './user/user.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [UserEntity, TodoEntity, TaggedTodoEntity, TagEntity] }),
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '14d' },
    }),
  ],
  controllers: [UserController, TodoController, TagController],
  providers: [
    {
      provide: UserRepoPort,
      useClass: UserRepoAdapter,
    },
    {
      inject: [MikroORM],
      provide: OrchaDbTransactionalPort,
      useFactory: (orm: MikroORM) => new OrchaMikroOrmTransactional(orm),
    },
    {
      provide: AuthPort,
      useClass: AuthAdapter,
    },
    {
      inject: [UserRepoPort, AuthPort],
      provide: UserService,
      useFactory: (userRepo: UserRepoPort, auth: AuthPort) => new UserService(userRepo, auth),
    },
    {
      provide: TodoRepoPort,
      useClass: TodoRepoAdapter,
    },
    {
      inject: [UserService, TodoRepoPort, TagRepoPort, TaggedTodoRepoPort, OrchaDbTransactionalPort],
      provide: TodoService,
      useFactory: (
        userService: UserService,
        todoRepo: TodoRepoPort,
        tagRepo: TagRepoPort,
        taggedTodoRepo: TaggedTodoRepoPort,
        transaction: OrchaDbTransactionalPort
      ) => new TodoService(userService, todoRepo, tagRepo, taggedTodoRepo, transaction),
    },
    {
      provide: TaggedTodoRepoPort,
      useClass: TaggedTodoRepoAdapter,
    },
    {
      provide: TagRepoPort,
      useClass: TagRepoAdapter,
    },
    {
      inject: [UserService, TagRepoPort],
      provide: TagService,
      useFactory: (userService: UserService, tagRepo: TagRepoPort) => new TagService(userService, tagRepo),
    },
  ],
})
export class DomainModule {}
