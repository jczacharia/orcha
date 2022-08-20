import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { TaggedTodoRepoPort } from '@todo-example-app-lib/server';
import { TagEntity } from '../tag/tag.entity';
import { TaggedTodoRepoAdapter } from './tagged-todo-repo.adapter';
import { TaggedTodoEntity } from './tagged-todo.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [TaggedTodoEntity, TagEntity] })],
  providers: [
    {
      provide: TaggedTodoRepoPort,
      useClass: TaggedTodoRepoAdapter,
    },
  ],
  exports: [TaggedTodoRepoPort],
})
export class TaggedTodoModule {}
