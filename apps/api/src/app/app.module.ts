import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { OrchaNestModule } from '@orcha/nestjs';
import { environment } from '@todo-example-app-lib/shared';
import { DomainModule } from './domain/domain.module';

@Module({
  imports: [OrchaNestModule.forRoot(), MikroOrmModule.forRoot(environment.mikroOrmConfig), DomainModule],
})
export class AppModule {}
