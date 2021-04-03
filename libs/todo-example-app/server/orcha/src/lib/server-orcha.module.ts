import { Module } from '@nestjs/common';
import { ServicesCoreServicesModule } from '@orcha-todo-example-app/server/core/services';
import { OrchaModule } from '@orcha/nestjs';
import { TagOrchestration } from './tag/tag.orchestration';
import { TodoTagOrchestration } from './todo-tag/todo-tag.orchestration';
import { TodoOrchestration } from './todo/todo.orchestration';
import { UserOrchestration } from './user/user.orchestration';

@Module({
  imports: [
    ServicesCoreServicesModule,
    OrchaModule.forFeature({
      orchestrations: [TodoOrchestration, UserOrchestration, TodoTagOrchestration, TagOrchestration],
    }),
  ],
})
export class ServerOrchaModule {}
