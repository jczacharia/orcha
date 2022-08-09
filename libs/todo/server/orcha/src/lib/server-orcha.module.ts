import { Module } from '@nestjs/common';
import { ServicesServicesModule } from '@orcha/todo/server/services';
import { OrchaNestModule } from '@orcha/nestjs';
import { TagGateway } from './tag/tag.gateway';
import { TodoGateway } from './todo/todo.gateway';
import { TodoOrchestration } from './todo/todo.orchestration';
import { UserOrchestration } from './user/user.orchestration';

@Module({
  imports: [
    ServicesServicesModule,
    OrchaNestModule.forFeature({
      orchestrations: [TodoOrchestration, UserOrchestration],
      gateways: [TodoGateway, TagGateway],
    }),
  ],
})
export class ServerOrchaModule {}
