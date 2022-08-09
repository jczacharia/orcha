import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ServerOrchaModule } from '@orcha/todo/server/orcha';
import { environment } from '@orcha/todo/shared/domain';

@Module({
  imports: [ServerOrchaModule, MikroOrmModule.forRoot(environment.mikroOrmConfig)],
})
export class AppModule {}
