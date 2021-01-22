import { OrchestraModule } from '@orcha/nestjs';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppOrchestration } from './app.orchestration';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

@Global()
@Module({
  imports: [
    OrchestraModule.forFeature({ orchestrations: [AppOrchestration] }),
  ],
})
export class AppModule {}
