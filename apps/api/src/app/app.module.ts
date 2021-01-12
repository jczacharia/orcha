import { OrchestraModule } from '@orchestra/nestjs';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppOrchestration } from './app.orchestration';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: '1Qazxsw2',
      database: 'orchestra-root',
      synchronize: true,
      autoLoadEntities: true,
      ssl: false,
    }),
    TypeOrmModule.forFeature([UserEntity]),
    OrchestraModule.forFeature({ orchestrations: [AppOrchestration] }),
  ],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class AppModule {}
