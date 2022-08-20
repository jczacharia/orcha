import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { OrchaNestModule } from '@orcha/nestjs';
import { environment } from '@todo-example-app-lib/shared';
import { TagModule } from './domain/tag/tag.module';
import { TaggedTodoModule } from './domain/tagged-todo/tagged-todo.module';
import { TodoModule } from './domain/todo/todo.module';
import { UserModule } from './domain/user/user.module';

@Module({
  imports: [
    OrchaNestModule.forRoot(),
    MikroOrmModule.forRoot(environment.mikroOrmConfig),
    UserModule,
    TagModule,
    TodoModule,
    TaggedTodoModule,
  ],
})
export class AppModule {}
