import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthPort, UserRepoPort, UserService } from '@todo-example-app-lib/server';
import { AuthAdapter } from './auth.adapter';
import { UserRepoAdapter } from './user-repo.adapter';
import { UserEntity } from './user.entity';
import { UserOrchestration } from './user.orchestration';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [UserEntity] }),
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '14d' },
    }),
  ],
  controllers: [UserOrchestration],
  providers: [
    {
      provide: UserRepoPort,
      useClass: UserRepoAdapter,
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
  ],
  exports: [UserService],
})
export class UserModule {}
