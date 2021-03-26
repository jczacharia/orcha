import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerOrchaModule } from '@orcha-todo-example-app/server/orcha';
import { environment } from '@orcha-todo-example-app/shared/domain';

@Module({
  imports: [ServerOrchaModule, TypeOrmModule.forRoot(environment.typeOrmConfig)],
})
export class AppModule {}
